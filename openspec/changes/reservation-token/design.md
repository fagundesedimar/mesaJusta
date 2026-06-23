## Context

O Mesa Justa já terá (`geo-matching-map`) o mapa interativo com lista de doações próximas. O próximo passo é permitir que a ONG reserve exclusivamente um lote, recebendo um token físico de retirada e gerenciando suas reservas ativas. O modelo `Donation` no Prisma atualmente não possui campos de reserva (`token`, `reservedAt`, `reservedBy`).

**Stack relevante**: Next.js App Router, Prisma ORM + PostgreSQL, Vanilla CSS, Clerk Auth (papel `ONG`).

**Constraints**:
- Apenas ONGs autenticadas (`ONG`) podem reservar lotes.
- A reserva deve ser exclusiva: dois acessos simultâneos ao mesmo lote não podem resultar em duas reservas bem-sucedidas.
- O token de retirada é alfanumérico, único, com prefixo `MJ-` e 4 caracteres (ex: `MJ-A94D`).
- A expiração do lote é baseada no campo `expiresAt` já existente na doação (assumido), não em um novo campo de expiração de reserva.

## Goals / Non-Goals

**Goals:**
- Permitir que ONG reserve um lote via `POST /api/v1/reservations`.
- Gerar token alfanumérico único `MJ-XXXX` no momento da reserva.
- Transicionar o status da doação de `AVAILABLE` para `RESERVED`.
- Garantir exclusividade via transação Prisma com lock pessimista.
- Exibir Painel de Reservas Ativas da ONG (`INT-06`) com token, endereço, contatos e cronômetro regressivo.
- Permitir cancelamento da reserva via `POST /api/v1/reservations/cancel`, retornando o lote a `AVAILABLE`.
- Alerta visual (vermelho piscante) quando faltam menos de 2 horas para expirar.

**Non-Goals:**
- Cancelamento automático por timeout (cron job — escopo futuro).
- Notificações push ao Doador quando o lote é reservado.
- Histórico de tokens expirados ou cancelados (registrado no AuditLog existente).
- Geração de QR Code para o token (v2).

## Decisions

### D1: Como garantir exclusividade na reserva (race condition)?

**Decisão**: Usar `prisma.$transaction` com `isolationLevel: 'Serializable'` ou SELECT FOR UPDATE via `$queryRaw`. A transação verifica se `status = AVAILABLE` e faz o update atomicamente.

**Alternativas consideradas**:
- Lock otimista (versioning/campo `updatedAt`) → mais leve, mas requer retry no cliente em caso de conflito; aumenta complexidade.
- Redis lock (Redlock) → over-engineering para v1, adiciona dependência de infraestrutura.
- Unique constraint no DB → não previne race condition de leitura/escrita.

**Rationale**: Transação serializável no Postgres é o mecanismo mais simples e correto para este cenário sem adicionar dependências externas. Aceita maior latência em caso de contenção (baixo risco no volume esperado da v1).

---

### D2: Onde armazenar os dados de reserva?

**Decisão**: Adicionar campos diretamente no model `Donation`: `reservationToken String?`, `reservedAt DateTime?`, `reservedByOngId String?` (FK para `User`).

**Alternativas consideradas**:
- Tabela separada `Reservation` → mais normalizado, facilita histórico; porém adiciona join em todas as queries de doações disponíveis.
- Campos inline no `Donation` → mais simples, sem join, adequado para v1.

**Rationale**: Dados inline no `Donation` são suficientes para a v1. Uma tabela separada pode ser extraída em refatoração futura se o histórico de reservas se tornar requisito.

---

### D3: Formato do token de retirada?

**Decisão**: Prefixo `MJ-` + 4 caracteres alfanuméricos maiúsculos gerados com `crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 4)` (24 bits de entropia = ~16 milhões de combinações). Verificar unicidade via query antes de persistir (retry em colisão — improvável).

**Rationale**: Curto o suficiente para digitação manual, longo o suficiente para unicidade operacional. O prefixo `MJ-` identifica o sistema.

---

### D4: Como implementar o cronômetro regressivo?

**Decisão**: Client Component com `setInterval` a cada segundo, calculando `expiresAt - Date.now()` no cliente. Exibir alerta vermelho piscante (CSS `animation: blink`) quando `timeLeft < 2 * 60 * 60 * 1000`.

**Rationale**: Lógica puramente client-side, sem WebSocket ou Server-Sent Events. Adequado para v1 dado que o dado de expiração já está no payload carregado na montagem.

## Risks / Trade-offs

- **[Risco] Colisão de token** → Mitigação: query de unicidade antes de persistir com retry; colisão esperada < 0,0001% para o volume da v1.
- **[Risco] Transação serializável com alto volume de ONGs** → Possível gargalo em contenção; aceitável para v1; Redis lock como plano de upgrade.
- **[Risco] Cronômetro dessincronizado em clocks de cliente diferentes** → Mitigação: usar `expiresAt` do servidor como referência absoluta, não contagem relativa; comunicar claramente no UI que o horário é UTC do servidor.
- **[Trade-off] Campos inline no Donation** → Facilita query mas aumenta o tamanho da tabela; aceitável na escala esperada.

## Migration Plan

1. Adicionar `reservationToken String?`, `reservedAt DateTime?`, `reservedByOngId String?` no model `Donation`.
2. Adicionar `@@unique([reservationToken])` para garantir unicidade no banco.
3. Executar `npx prisma migrate dev --name reservation-token`.
4. Rollback: campos são `nullable`; remover com nova migração sem impacto em dados existentes.

## Open Questions

- O campo `expiresAt` já existe no model `Donation`? Confirmar no schema atual — é a referência para o cronômetro e o alerta de 2 horas.
- O cancelamento de reserva deve registrar entrada no `AuditLog`? (Assumido: sim, para rastreabilidade.)
