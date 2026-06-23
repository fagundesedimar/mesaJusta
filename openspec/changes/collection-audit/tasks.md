## 1. Schema de Banco de Dados

- [ ] 1.1 Adicionar modelo `AuditLog` ao `prisma/schema.prisma` com campos: `id`, `donationId`, `ongId`, `donorId`, `executorId`, `timestamp DateTime @default(now())` — sem campo `updatedAt` e com `@@map("audit_logs")`
- [ ] 1.2 Executar `npx prisma migrate dev --name collection-audit` para criar a tabela no banco local
- [ ] 1.3 Adicionar índice em `AuditLog(donationId)` e `AuditLog(timestamp)` no schema para otimizar queries do dashboard admin

## 2. Route Handler — Confirmação de Entrega

- [ ] 2.1 Criar `src/app/api/v1/reservations/confirm/route.ts` com handler `POST`
- [ ] 2.2 Validar payload `{ donationId: string, token: string }` com schema Zod
- [ ] 2.3 Buscar doação por `donationId` com filtro `status: RESERVED`; retornar `409` se status incorreto
- [ ] 2.4 Comparar token recebido com token armazenado na doação; retornar `400` se inválido
- [ ] 2.5 Executar `prisma.$transaction([updateDonationStatus, createAuditLog])` atomicamente
- [ ] 2.6 Retornar `200 OK` com `{ message: "Entrega confirmada com sucesso." }` em caso de sucesso

## 3. Componente Modal — Confirmar Entrega (INT-02)

- [ ] 3.1 Criar `src/components/donations/ConfirmDeliveryModal.tsx` com campo `<input maxLength={6}>` para o token
- [ ] 3.2 Implementar validação client-side: bloquear submit se token tiver menos de 6 caracteres, exibir mensagem `"O token deve ter exatamente 6 caracteres."`
- [ ] 3.3 Implementar chamada ao `POST /api/v1/reservations/confirm` ao clicar em "Confirmar"
- [ ] 3.4 Tratar resposta: fechar modal e atualizar status do lote na tabela em caso de sucesso (200); exibir mensagem de erro inline em caso de falha (400/409)
- [ ] 3.5 Criar `src/components/donations/ConfirmDeliveryModal.css` com estilos Vanilla CSS para o modal e campo de token

## 4. Integração com Dashboard do Doador (INT-02)

- [ ] 4.1 Adicionar coluna "Ação" na tabela de doações do Dashboard do Doador que exibe o botão "Confirmar Entrega" apenas para lotes com status `RESERVED`
- [ ] 4.2 Conectar o botão ao componente `ConfirmDeliveryModal` passando o `donationId` como prop
- [ ] 4.3 Implementar atualização otimista do status na tabela após confirmação bem-sucedida (sem reload da página)

## 5. Testes Unitários

- [ ] 5.1 Criar `src/__tests__/unit/components/ConfirmDeliveryModal.test.tsx` cobrindo: renderização do modal, validação de token < 6 chars, mensagem de erro e comportamento do botão cancelar

## 6. Testes de Integração

- [ ] 6.1 Criar `src/__tests__/integration/reservations/confirm.test.ts` cobrindo:
  - Token correto com doação RESERVED → 200 + status COLLECTED + AuditLog criado
  - Token incorreto → 400 com mensagem correta
  - Doação em status AVAILABLE/COLLECTED/EXPIRED → 409
  - Verificação dos campos obrigatórios no registro AuditLog criado no banco

## 7. Testes E2E

- [ ] 7.1 Criar `e2e/collection/confirm-delivery.spec.ts`: ONG reserva uma doação disponível → Doador acessa dashboard, clica em "Confirmar Entrega", insere o token correto → verificar que status na tabela muda para "Retirada"

## 8. Validação Final

- [ ] 8.1 Executar `npm run lint` e corrigir todos os erros ESLint
- [ ] 8.2 Executar `npm run test:unit` e verificar testes do modal de confirmação
- [ ] 8.3 Executar `npm run test:integration` e verificar todos os cenários do endpoint de confirmação
- [ ] 8.4 Executar `npm run test:e2e` e verificar o fluxo E2E de confirmação de entrega
- [ ] 8.5 Verificar manualmente no Prisma Studio que o registro `AuditLog` foi criado com todos os campos obrigatórios após uma confirmação de teste
