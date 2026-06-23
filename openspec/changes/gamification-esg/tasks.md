## 1. Preparação e Schema

- [ ] 1.1 Verificar enum de categorias de alimentos no `prisma/schema.prisma` e confirmar os valores exatos de `READY_MEAL` e `PROTEIN`
- [ ] 1.2 Adicionar campo `greenCoins Int @default(0)` no model `User` do Prisma
- [ ] 1.3 Executar migração `npx prisma migrate dev --name gamification-esg`

## 2. Módulo de Gamificação — Helpers

- [ ] 2.1 Criar `src/lib/gamification/formulas.ts` com função `calcGreenCoins(weightKg: number, category: FoodCategory): number` aplicando multiplicador `1.5` para `READY_MEAL` e `PROTEIN`
- [ ] 2.2 Criar `src/lib/gamification/badges.ts` com função pura `getESGBadge(greenCoins: number): 'BRONZE' | 'SILVER' | 'GOLD'` baseada nas faixas: Bronze ≤ 1.000, Prata ≤ 5.000, Ouro > 5.000
- [ ] 2.3 Criar testes unitários em `src/__tests__/unit/gamification/formulas.test.ts` cobrindo: categoria padrão (1x), categoria `PROTEIN` (1.5x), categoria `READY_MEAL` (1.5x), peso zero, peso decimal
- [ ] 2.4 Criar testes unitários em `src/__tests__/unit/gamification/badges.test.ts` cobrindo todas as faixas de selo e valores limítrofes (0, 1.000, 1.001, 5.000, 5.001)

## 3. Integração com Fluxo de Coleta

- [ ] 3.1 Localizar o Route Handler responsável pela transição de status para `COLLECTED` (provavelmente em `src/app/api/v1/donations/[id]/collect/route.ts` ou similar)
- [ ] 3.2 Encapsular a transição de status e o crédito de Moedas Verdes em `prisma.$transaction([...])` para garantir atomicidade
- [ ] 3.3 Adicionar verificação de idempotência: retornar `409 Conflict` se a doação já estiver com status `COLLECTED`
- [ ] 3.4 Garantir que o crédito de `greenCoins` usa `prisma.user.update({ where: { id: donorId }, data: { greenCoins: { increment: coins } } })`

## 4. Route Handler — Ranking

- [ ] 4.1 Criar `src/app/api/v1/gamification/ranking/route.ts` com handler `GET` que agrega Moedas Verdes por Doador no mês corrente via query Prisma com `_sum` em doações `COLLECTED`, ordena de forma decrescente e retorna Top 10
- [ ] 4.2 Garantir que o retorno contenha apenas `{ rank, establishmentName, greenCoins, badge }` — sem CPF, CNPJ, e-mail ou outros dados sensíveis (conformidade LGPD)
- [ ] 4.3 Proteger a rota com validação de autenticação Clerk (usuário deve estar logado para acessar o ranking)

## 5. Componentes de UI — Painel do Doador (INT-02)

- [ ] 5.1 Criar componente `src/components/donor/GreenCoinsCard.tsx` exibindo saldo de Moedas Verdes e ícone do selo ESG (Bronze/Prata/Ouro) com Vanilla CSS
- [ ] 5.2 Criar componente `src/components/donor/ESGRankingTable.tsx` com lista dos Top 10 do mês, destacando visualmente a posição do doador logado caso ele esteja no ranking
- [ ] 5.3 Criar `src/components/donor/Gamification.css` com estilos para cards de moedas, badges e tabela de ranking
- [ ] 5.4 Integrar `GreenCoinsCard` e `ESGRankingTable` na página do painel do doador (`src/app/donor/dashboard/page.tsx`)

## 6. Testes de Integração

- [ ] 6.1 Criar `src/__tests__/integration/gamification/ranking.test.ts` validando: retorno ordenado do ranking, máximo de 10 itens, campos retornados, resposta 401 sem autenticação
- [ ] 6.2 Criar `src/__tests__/integration/gamification/collect-coins.test.ts` validando: saldo incrementado após coleta, idempotência (segundo POST não credita novamente), atomicidade em caso de falha da transação

## 7. Teste E2E

- [ ] 7.1 Criar `e2e/gamification/esg-badge-flow.spec.ts`: fazer login como Doador, confirmar coleta de 10kg de proteínas, verificar que o saldo de Moedas Verdes no painel aumentou em 150 pontos, e verificar que o selo ESG foi atualizado corretamente caso mude de faixa

## 8. Validação Final

- [ ] 8.1 Executar `npm run lint` e corrigir todos os erros ESLint
- [ ] 8.2 Executar `npm run test:unit` e garantir que todos os testes de fórmulas e badges passam
- [ ] 8.3 Executar `npm run test:integration` e verificar os testes de gamificação
- [ ] 8.4 Executar `npm run test:e2e` e verificar o fluxo E2E de gamificação
