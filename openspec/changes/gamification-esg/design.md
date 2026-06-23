## Context

O Mesa Justa já possui o fluxo de doações implementado (`donor-donations`) e o log de auditoria (`collection-audit`). Neste momento, não há nenhum mecanismo de incentivo para que os doadores (estabelecimentos parceiros) mantenham consistência ou aumentem o volume de doações. A gamificação ESG introduz um sistema de pontuação automático baseado em eventos de retirada confirmada, sem alterar os fluxos existentes de criação ou cancelamento de doações.

**Stack relevante**: Next.js App Router, Prisma ORM + PostgreSQL, Vanilla CSS, Clerk Auth (papéis: `DONOR`, `ONG`, `ADMIN`).

**Constraints**:
- Pontos são creditados SOMENTE quando `status = COLLECTED` (retirada confirmada e registrada no AuditLog).
- O ranking é público mas exibe apenas nome fantasia do estabelecimento (LGPD).
- Cálculo deve ser determinístico e auditável — nenhum ponto deve ser creditado duas vezes.

## Goals / Non-Goals

**Goals:**
- Calcular e persistir Moedas Verdes no momento da transição `status = COLLECTED`.
- Aplicar multiplicador `1.5x` para categorias `READY_MEAL` e `PROTEIN`.
- Atribuir selos ESG dinâmicos (Bronze/Prata/Ouro) com base no saldo acumulado.
- Expor endpoint público `GET /api/v1/gamification/ranking` com Top 10 do mês.
- Exibir saldo de moedas e selo no painel do doador (`INT-02`).

**Non-Goals:**
- Sistema de troca ou resgate de Moedas Verdes (monetização futura).
- Notificações push ao atingir novo nível de selo.
- Histórico granular de créditos por transação (auditoria detalhada é escopo do `collection-audit`).
- Suporte a múltiplos períodos no ranking (apenas mês corrente na v1).

## Decisions

### D1: Onde persistir o saldo de Moedas Verdes?

**Decisão**: Adicionar campo `greenCoins` (Int, default 0) no model `User` do Prisma (para doadores).

**Alternativas consideradas**:
- Tabela separada `GreenCoinLedger` com uma linha por transação → mais auditável, porém mais complexo para a v1 e requer joins a cada consulta de saldo.
- Campo agregado no `User` → simples, performático para leitura, consistente com a abordagem atual do projeto.

**Rationale**: Dado que o AuditLog já registra o histórico de status, um campo agregado no User é suficiente para v1 sem duplicidade de auditoria.

---

### D2: Quando e como creditar os pontos?

**Decisão**: O crédito ocorre dentro da mesma transação Prisma que muda o status para `COLLECTED` no Route Handler de coleta (parte de `collection-audit`). Usar `prisma.$transaction([...])` para garantir atomicidade.

**Alternativas consideradas**:
- Job assíncrono que lê o AuditLog periodicamente → risco de delay e inconsistência eventual.
- Webhook / event emitter → over-engineering para o escopo atual.

**Rationale**: A transação atômica elimina o risco de duplo crédito e mantém consistência entre o status da doação e o saldo do doador.

---

### D3: Como calcular o selo ESG?

**Decisão**: Função utilitária pura `getESGBadge(greenCoins: number): 'BRONZE' | 'SILVER' | 'GOLD'` em `src/lib/gamification/badges.ts`, chamada on-the-fly na renderização do painel — sem persistir o nível no banco.

**Rationale**: O nível é sempre derivável do saldo, persistir seria redundante e criaria risco de divergência.

---

### D4: Ranking — query ou cache?

**Decisão**: Query direta ao PostgreSQL com agregação mensal via `WHERE createdAt >= início do mês`, com índice em `Donation(status, createdAt)` (já previsto no `admin-dashboard`). Sem cache Redis na v1.

**Rationale**: Top 10 mensal tem baixo volume de dados; o índice já existente é suficiente. Cache pode ser adicionado se telemetria indicar latência.

## Risks / Trade-offs

- **[Risco] Duplo crédito em retry de request** → Mitigação: a transação Prisma verifica se o status já é `COLLECTED` antes de creditar; o handler deve ser idempotente.
- **[Risco] Arredondamento em pesos decimais** → Mitigação: usar `Math.floor` para Moedas Verdes (sempre inteiro); nunca usar `float` no banco para moedas — manter como `Int`.
- **[Trade-off] Saldo agregado vs. ledger** → Aceito para v1; migrar para ledger em v2 se precisar de contestações de pontuação.
- **[Trade-off] Sem cache no ranking** → Pode ser lento com muitos usuários concorrentes; aceitável enquanto base de usuários for pequena.

## Migration Plan

1. Adicionar campo `greenCoins Int @default(0)` no model `User` do Prisma.
2. Executar migração: `npx prisma migrate dev --name gamification-esg`.
3. Implementar lógica de crédito na transação de coleta.
4. Criar endpoint de ranking e componentes de UI.
5. Rollback: campo `greenCoins` pode ser zerado sem impacto funcional nos fluxos existentes; o campo pode ser removido com nova migração se necessário.

## Open Questions

- O ranking deve ser visível para todos os papéis (público geral) ou apenas para usuários autenticados? (Assumido: autenticados apenas, conforme padrão de rotas protegidas do projeto.)
- As categorias de alimentos no Prisma usam enum? Confirmar os valores exatos de `READY_MEAL` e `PROTEIN` no schema atual antes de implementar o multiplicador.
