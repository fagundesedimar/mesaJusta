## 1. Preparação e Schema

- [ ] 1.1 Verificar no `prisma/schema.prisma` se o campo `expiresAt` já existe no model `Donation` (pré-requisito para o cronômetro)
- [ ] 1.2 Adicionar campos no model `Donation`: `reservationToken String?`, `reservedAt DateTime?`, `reservedByOngId String?`
- [ ] 1.3 Adicionar `@@unique([reservationToken])` no model `Donation` para garantir unicidade no banco
- [ ] 1.4 Executar migração `npx prisma migrate dev --name reservation-token`

## 2. Utilitário de Geração de Token

- [ ] 2.1 Criar `src/lib/reservation/token.ts` com função `generateReservationToken(): string` que gera token no formato `MJ-XXXX` usando `crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 4)`
- [ ] 2.2 Criar testes unitários em `src/__tests__/unit/reservation/token.test.ts` cobrindo: formato correto (`^MJ-[A-Z0-9]{4}$`), unicidade entre 1.000 chamadas consecutivas

## 3. Route Handler — Criação de Reserva

- [ ] 3.1 Criar `src/app/api/v1/reservations/route.ts` com handler `POST` que: valida papel `ONG` via Clerk, verifica `donationId` na body, executa `prisma.$transaction` com `isolationLevel: 'Serializable'` para verificar status `AVAILABLE` e atualizar para `RESERVED`
- [ ] 3.2 Implementar geração do token dentro da transação com verificação de unicidade (retry até 3x em caso de colisão)
- [ ] 3.3 Retornar `201 Created` com `{ donationId, reservationToken, reservedAt, expiresAt }` em caso de sucesso
- [ ] 3.4 Retornar `409 Conflict` quando a doação não estiver com status `AVAILABLE`
- [ ] 3.5 Retornar `401 Unauthorized` para requisições sem autenticação e `403 Forbidden` para papéis não-ONG

## 4. Route Handler — Cancelamento de Reserva

- [ ] 4.1 Criar `src/app/api/v1/reservations/cancel/route.ts` com handler `POST` que: valida papel `ONG`, verifica se `reservedByOngId` corresponde à ONG logada, atualiza status para `AVAILABLE` e nulifica `reservationToken`, `reservedAt`, `reservedByOngId`
- [ ] 4.2 Registrar entrada no `AuditLog` com ação `RESERVATION_CANCELLED` e `donationId` dentro da mesma transação do cancelamento
- [ ] 4.3 Retornar `403 Forbidden` quando a ONG logada não for a detentora da reserva

## 5. Componentes de UI — Painel de Reservas Ativas (INT-06)

- [ ] 5.1 Criar componente `src/components/ong/ReservationCard.tsx` exibindo: token em `<span style={{ fontFamily: 'monospace' }}>`, endereço de retirada, nome e contato do Doador, e botão "Cancelar Reserva" com modal de confirmação
- [ ] 5.2 Criar componente `src/components/ong/ReservationCountdown.tsx` como Client Component com `setInterval` calculando `expiresAt - Date.now()` e aplicando classe CSS de alerta piscante quando `timeLeft < 7200000` (2 horas em ms)
- [ ] 5.3 Criar `src/components/ong/Reservations.css` com estilos Vanilla CSS para o card, token destacado, cronômetro e animação `@keyframes blink` em vermelho
- [ ] 5.4 Criar `src/app/ong/reservations/page.tsx` (Server Component) que busca as reservas ativas da ONG logada e renderiza lista de `ReservationCard`
- [ ] 5.5 Adicionar botão "Reservar Lote" no popup do mapa (`DonationMap`) e nos cartões da lista lateral (`DonationListSidebar`) que abre modal de confirmação e chama `POST /api/v1/reservations`

## 6. Testes de Integração

- [ ] 6.1 Criar `src/__tests__/integration/reservation/create.test.ts` cobrindo: reserva bem-sucedida, `409` em lote já reservado, `403` para papel não-ONG, `401` sem autenticação
- [ ] 6.2 Criar `src/__tests__/integration/reservation/concurrency.test.ts` simulando 10 requisições simultâneas para o mesmo lote, garantindo que exatamente 1 é aceita e 9 retornam `409`
- [ ] 6.3 Criar `src/__tests__/integration/reservation/cancel.test.ts` cobrindo: cancelamento bem-sucedido retorna lote a `AVAILABLE`, `403` para ONG diferente, registro no AuditLog

## 7. Teste E2E

- [ ] 7.1 Criar `e2e/ong/reservation-token.spec.ts`: ONG faz login, acessa o mapa, clica em "Reservar Lote" em uma doação disponível, confirma no modal, é redirecionada ao Painel de Reservas Ativas, verifica o token `MJ-XXXX` em destaque, verifica o cronômetro ativo, e cancela a reserva verificando que a doação volta ao status "Disponível" no mapa

## 8. Validação Final

- [ ] 8.1 Executar `npm run lint` e corrigir todos os erros ESLint
- [ ] 8.2 Executar `npm run test:unit` e garantir que os testes de geração de token passam
- [ ] 8.3 Executar `npm run test:integration` e verificar os testes de reserva, concorrência e cancelamento
- [ ] 8.4 Executar `npm run test:e2e` e verificar o fluxo E2E de reserva e cancelamento
