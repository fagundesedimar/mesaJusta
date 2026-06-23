## 1. Schema de Banco de Dados

- [ ] 1.1 Adicionar enum `DonationStatus` ao `prisma/schema.prisma` com valores: `AVAILABLE`, `RESERVED`, `COLLECTED`, `EXPIRED`
- [ ] 1.2 Adicionar modelo `Donation` ao schema com campos: `id`, `donorId`, `name`, `category`, `weightKg Decimal`, `expiresAt DateTime`, `status DonationStatus @default(AVAILABLE)`, `notes String?`, `moedasVerdes Decimal`, `createdAt`, `updatedAt`
- [ ] 1.3 Adicionar relação `Donation` → `User` (donorId referencia User.id)
- [ ] 1.4 Executar `npx prisma migrate dev --name donor-donations` para criar a tabela e enum no banco local
- [ ] 1.5 Adicionar índice em `Donation(donorId, status)` e `Donation(expiresAt)` para otimizar queries de listagem e expiração

## 2. Módulo de Cálculo ESG (Moedas Verdes)

- [ ] 2.1 Criar `src/lib/esg/formulas.ts` (caso não exista de `admin-dashboard`) com função `calcMoedasVerdes(weightKg: number, category: string): number` usando `base_multiplier: 10` e bonus de `1.5x` para `Proteínas` e `Refeições Prontas`
- [ ] 2.2 Criar `src/__tests__/unit/esg/formulas.test.ts` cobrindo cálculo para todas as 6 categorias com diferentes pesos

## 3. Route Handler — Cadastro de Doação

- [ ] 3.1 Criar `src/lib/schemas/donation.schema.ts` com `CreateDonationSchema` (Zod): `name`, `category` (enum de 6 valores), `weightKg` (positivo), `expiresAt` (>= hoje), `notes` (opcional)
- [ ] 3.2 Criar `src/app/api/v1/donations/route.ts` com handler `POST`: validar payload com Zod, extrair `donorId` do token JWT, calcular `moedasVerdes`, persistir via Prisma, retornar `201 Created` com objeto `Donation`
- [ ] 3.3 Retornar `422` com detalhes do Zod para payload inválido (data retroativa, categoria inválida, peso negativo)

## 4. Route Handler — Listagem de Doações do Doador

- [ ] 4.1 Adicionar handler `GET` ao `src/app/api/v1/donations/route.ts`: buscar `donorId` do token, executar `updateMany` para expirar lotes vencidos antes da query principal, retornar lista de doações do doador ordenada por `createdAt DESC`
- [ ] 4.2 Garantir que o `updateMany` de expiração use filtro `{ status: { in: ['AVAILABLE', 'RESERVED'] }, expiresAt: { lt: new Date() } }` antes de retornar os dados

## 5. Modal de Nova Doação (INT-03)

- [ ] 5.1 Criar componente `src/components/donations/NewDonationModal.tsx` com formulário controlado: campos nome, categoria (select), peso em kg, data de validade (input date, min = hoje), observações (textarea opcional)
- [ ] 5.2 Implementar lógica de alerta laranja: detectar se `expiresAt === today` e exibir banner `"Atenção: Este lote expira hoje. A retirada deve ser imediata!"`
- [ ] 5.3 Bloquear submissão client-side se `expiresAt < today` (atributo `min` no input date)
- [ ] 5.4 Integrar chamada ao `POST /api/v1/donations` e fechar modal + atualizar lista ao receber `201`
- [ ] 5.5 Criar `src/components/donations/NewDonationModal.css` com estilos Vanilla CSS incluindo estilo de alerta laranja

## 6. Dashboard do Doador (INT-02)

- [ ] 6.1 Criar página `src/app/dashboard/donor/page.tsx` que faz fetch de `GET /api/v1/donations` e exibe a lista de lotes
- [ ] 6.2 Criar componente `src/components/donor/DonorMetricsCards.tsx` exibindo: total de Kg doados (soma de COLLECTED), Moedas Verdes acumuladas e contagem de doações ativas (AVAILABLE + RESERVED)
- [ ] 6.3 Criar componente `src/components/donor/DonationsTable.tsx` com tabela de lotes, badge de status colorido e botão "+ Nova Doação" que abre o `NewDonationModal`
- [ ] 6.4 Criar `src/components/donor/DonorDashboard.css` com estilos Vanilla CSS para cards e tabela de doações

## 7. Testes Unitários

- [ ] 7.1 Criar `src/__tests__/unit/components/NewDonationModal.test.tsx` cobrindo: validação de data retroativa (client-side), exibição do alerta laranja para data de hoje, formulário sem alerta para datas futuras

## 8. Testes de Integração

- [ ] 8.1 Criar `src/__tests__/integration/donations/create.test.ts` cobrindo: cadastro bem-sucedido (201 + `moedasVerdes` calculado), data retroativa (422), categoria inválida (422), acesso sem token (403)
- [ ] 8.2 Criar `src/__tests__/integration/donations/list.test.ts` cobrindo: expiração automática de lotes vencidos antes do retorno, isolamento por doador (não retorna lotes de outro usuário)

## 9. Testes E2E

- [ ] 9.1 Criar `e2e/donations/create-donation.spec.ts`: Login como Doador → clicar em "+ Nova Doação" → preencher formulário com dados válidos e data futura → salvar → verificar novo lote na tabela com status "Disponível"

## 10. Validação Final

- [ ] 10.1 Executar `npm run lint` e corrigir todos os erros ESLint
- [ ] 10.2 Executar `npm run test:unit` e verificar testes do modal e cálculos ESG
- [ ] 10.3 Executar `npm run test:integration` e verificar todos os cenários de cadastro e listagem
- [ ] 10.4 Executar `npm run test:e2e` e verificar fluxo de criação de doação
