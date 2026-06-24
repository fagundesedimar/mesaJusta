## 1. Schema de Banco de Dados

- [x] 1.1 Adicionar modelo `AuditLog` ao `prisma/schema.prisma` com campos: `id`, `donationId`, `ongId`, `donorId`, `executorId`, `timestamp DateTime @default(now())` — sem campo `updatedAt` e com `@@map("audit_logs")`
- [x] 1.2 Executar `npx prisma migrate dev --name collection-audit` para criar a tabela no banco local (já incluso na migration `auth-setup`)
- [x] 1.3 Adicionar índice em `AuditLog(donationId)` e `AuditLog(timestamp)` no schema para otimizar queries do dashboard admin

## 2. Route Handler — Confirmação de Entrega

- [x] 2.1 Criar `src/app/api/v1/reservations/confirm/route.ts` com handler `POST`
- [x] 2.2 Validar payload `{ donationId: string, token: string }` com schema Zod
- [x] 2.3 Buscar doação por `donationId` com filtro `status: RESERVED`; retornar `409` se status incorreto
- [x] 2.4 Comparar token recebido com token armazenado na doação; retornar `400` se inválido
- [x] 2.5 Executar `prisma.$transaction([updateDonationStatus, createAuditLog])` atomicamente
- [x] 2.6 Retornar `200 OK` com `{ message: "Entrega confirmada com sucesso." }` em caso de sucesso

## 3. Componente Modal — Confirmar Entrega (INT-02)

- [x] 3.1 Criar `src/components/donations/ConfirmDeliveryModal.tsx` com campo `<input maxLength={6}>` para o token
- [x] 3.2 Implementar validação client-side: bloquear submit se token tiver menos de 6 caracteres, exibir mensagem `"O token deve ter exatamente 6 caracteres."`
- [x] 3.3 Implementar chamada ao `POST /api/v1/reservations/confirm` ao clicar em "Confirmar"
- [x] 3.4 Tratar resposta: fechar modal e atualizar status do lote na tabela em caso de sucesso (200); exibir mensagem de erro inline em caso de falha (400/409)
- [x] 3.5 Criar `src/components/donations/ConfirmDeliveryModal.css` com estilos Vanilla CSS para o modal e campo de token

## 4. Integração com Dashboard do Doador (INT-02)

- [x] 4.1 Adicionar coluna "Ação" na tabela de doações do Dashboard do Doador que exibe o botão "Confirmar Entrega" apenas para lotes com status `RESERVED`
- [x] 4.2 Conectar o botão ao componente `ConfirmDeliveryModal` passando o `donationId` como prop
- [x] 4.3 Implementar atualização otimista do status na tabela após confirmação bem-sucedida (sem reload da página)

## 5. Testes Unitários

- [x] 5.1 Criar `src/__tests__/unit/components/ConfirmDeliveryModal.test.tsx` cobrindo: renderização do modal, validação de token < 6 chars, mensagem de erro e comportamento do botão cancelar

## 6. Testes de Integração

- [x] 6.1 Criar `src/__tests__/integration/reservations/confirm.test.ts` cobrindo:
  - Token correto com doação RESERVED → 200 + status COLLECTED + AuditLog criado
  - Token incorreto → 400 com mensagem correta
  - Doação em status AVAILABLE/COLLECTED/EXPIRED → 409
  - Verificação dos campos obrigatórios no registro AuditLog criado no banco

## 7. Testes E2E

- [x] 7.1 Criar `e2e/collection/confirm-delivery.spec.ts`: ONG reserva uma doação disponível → Doador acessa dashboard, clica em "Confirmar Entrega", insere o token correto → verificar que status na tabela muda para "Retirada"

## 8. Validação Final

- [x] 8.1 Executar `npm run lint` e corrigir todos os erros ESLint
- [x] 8.2 Executar `npm run test:unit` e verificar testes do modal de confirmação
- [x] 8.3 Executar `npm run test:integration` e verificar todos os cenários do endpoint de confirmação
- [x] 8.4 Executar `npm run test:e2e` e verificar o fluxo E2E de confirmação de entrega
- [x] 8.5 Verificar manualmente no Prisma Studio que o registro `AuditLog` foi criado com todos os campos obrigatórios após uma confirmação de teste
