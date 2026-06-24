## Context

O Mesa Justa não possui atualmente nenhuma tela ou API para que Doadores gerenciem seus lotes de alimentos. Esta é a funcionalidade central do lado do doador no circuito solidário: sem ela, não há dados de doações para que as ONGs busquem no mapa, nem base para gamificação ESG. Este change cria a camada de dados (`Donation`), a API de doações e o Dashboard do Doador (`INT-02`/`INT-03`).

**Dependência direta:** `auth-setup` — o usuário autenticado como `DONOR` deve existir para associar a doação ao estabelecimento.

**Stakeholders:** Doadores (criam e acompanham lotes), ONGs (consomem os lotes disponíveis via geo-matching), Administradores (visualizam o volume total no dashboard ESG).

---

## Goals / Non-Goals

**Goals:**
- Criar o modelo `Donation` no Prisma com campos: `id`, `donorId`, `name`, `category`, `weightKg`, `expiresAt`, `status`, `notes`, `createdAt`, `updatedAt`
- Criar endpoints `POST /api/v1/donations` (cadastro) e `GET /api/v1/donations` (listagem do doador logado)
- Implementar Dashboard do Doador (`INT-02`) com cards de métricas (kg doados, Moedas Verdes, saldo de doações ativas) e tabela de lotes
- Implementar Modal de Nova Doação (`INT-03`) com validação de data de validade e alerta de expiração no dia corrente
- Implementar rotina de expiração automática de lotes via job ou verificação on-load
- Bloquear cadastro de doação com data de validade anterior ao dia atual

**Non-Goals:**
- Edição ou exclusão de lotes após cadastro — operação deferida (lotes são imutáveis no ciclo de vida do MVP)
- Upload de imagens de alimentos — fora do escopo do MVP
- Notificações push para o Doador sobre status da doação — módulo separado

---

## Decisions

### D1: Status da Doação como Enum Prisma vs. String

**Decisão:** Definir um enum Prisma `DonationStatus` com valores: `AVAILABLE`, `RESERVED`, `COLLECTED`, `EXPIRED`.

**Rationale:** Enums tipados no Prisma previnem valores de status inválidos diretamente no schema do banco (PostgreSQL `ENUM` type), eliminando a necessidade de validação manual e tornando os estados explícitos no TypeScript. String livre seria propensa a inconsistências de casing e erros de digitação em queries.

**Alternativa descartada:** String com validação Zod — validação só no application layer, não no banco.

---

### D2: Rotina de Expiração — Cron Job vs. Verificação On-Load

**Decisão:** Implementar verificação de expiração em dois pontos: (a) no `GET /api/v1/donations` — expirar lotes vencidos antes de retornar a lista; (b) no `GET /api/v1/ong/donations` (consumido pelas ONGs) — filtrar ativos com `expiresAt > now()`.

**Rationale:** Um cron job dedicado requer infraestrutura adicional (Vercel Cron, AWS EventBridge, ou worker process) que está fora do escopo do MVP Electron/desktop. A verificação on-load no endpoint de listagem garante que lotes vencidos nunca apareçam como disponíveis para ONGs sem a complexidade de scheduling. O custo é uma query extra de `updateMany` ao carregar o dashboard — aceitável para o volume do MVP.

**Alternativa descartada:** Vercel Cron — não disponível em planos gratuitos; worker Node.js separado — complexidade desnecessária para MVP.

---

### D3: Cálculo de Moedas Verdes no Backend vs. Frontend

**Decisão:** Calcular Moedas Verdes no backend no momento do cadastro da doação e armazenar o valor calculado no modelo `Donation`.

**Rationale:** As fórmulas ESG são definidas centralmente no `openspec/config.yaml` (`base_multiplier: 10`, bonuses por categoria). Calcular no backend garante consistência — o mesmo valor é exibido no Dashboard do Doador, no ranking de gamificação e no relatório ESG do Admin. Calcular no frontend seria redundante e criaria divergências se as regras mudarem.

**Fórmula:** `moedasVerdes = weightKg * 10 * multiplierByCategory` onde `Proteínas` e `Refeições Prontas` têm `multiplier = 1.5`, demais categorias `multiplier = 1.0`.

---

### D4: Validação de Data — Client-side vs. Server-side

**Decisão:** Validação em ambos os lados — bloqueio imediato no cliente (UX) + validação Zod no servidor (segurança).

**Rationale:** Bloquear no cliente (`min` do input `date` definido como `today`) oferece feedback imediato ao usuário sem round-trip ao servidor. A validação server-side com Zod garante que mesmo um cliente manipulado não consiga cadastrar lotes com data retroativa. As duas camadas são complementares.

---

## Risks / Trade-offs

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Lotes vencidos aparecendo disponíveis para ONGs antes do próximo load | Alta | Médio | Filtro `expiresAt > now()` obrigatório em todas as queries de listagem pública de doações |
| `updateMany` de expiração lento com muitos registros no endpoint de listagem | Baixa | Baixo | Executar apenas para registros `status = AVAILABLE OR RESERVED` e `expiresAt < now()` com índice em `expiresAt` |
| Categoria com multiplicador errado causando saldo incorreto de Moedas Verdes | Média | Médio | Testes unitários das funções de cálculo ESG cobrindo todas as categorias |

---

## Migration Plan

1. Adicionar enum `DonationStatus` e modelo `Donation` ao `prisma/schema.prisma`
2. Executar `npx prisma migrate dev --name donor-donations`
3. Criar `src/lib/esg/formulas.ts` com funções de cálculo de Moedas Verdes por categoria
4. Criar Route Handlers `POST /api/v1/donations/route.ts` e `GET /api/v1/donations/route.ts`
5. Criar página `src/app/dashboard/donor/page.tsx` com tabela de lotes e cards de métricas
6. Criar componente `src/components/donations/NewDonationModal.tsx` com o formulário `INT-03`
7. Rollback: reverter migração com `npx prisma migrate reset` e remover arquivos de rota/página/componente
