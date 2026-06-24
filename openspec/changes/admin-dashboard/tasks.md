## 1. Preparação e Dependências

- [x] 1.1 Instalar dependência de geração de PDF: `npm install pdfkit` e `npm install -D @types/pdfkit`
- [x] 1.2 Confirmar que `collection-audit` e `donor-donations` estão implementados (tabelas `AuditLog` e `Donation` existem no banco)

## 2. Módulo de Cálculo ESG

- [x] 2.1 Adicionar funções `calcMeals`, `calcCO2eq`, `calcTons` a `src/lib/esg/formulas.ts`
- [x] 2.2 Adicionar testes unitários em `src/__tests__/unit/esg/formulas.test.ts` para os novos cálculos

## 3. Route Handler — Dashboard de Métricas

- [x] 3.1 Criar `src/app/api/v1/admin/dashboard/route.ts` com handler `GET`: agregar `_sum(weightKg)` e `_count` de doações com `status: COLLECTED` via Prisma; calcular KPIs com `src/lib/esg/formulas.ts`; retornar JSON `{ totalKgSaved, totalTonsSaved, totalMeals, totalCO2eqKg, totalDonations, totalONGs }`
- [x] 3.2 Validar papel `ADMIN` no Route Handler (defense in depth além do Middleware)
- [x] 3.3 Adicionar índices em `Donation(status, createdAt)` no schema Prisma e executar `npx prisma db push`

## 4. Route Handler — Listagem de AuditLog

- [x] 4.1 Criar `src/app/api/v1/admin/audit-logs/route.ts` com handler `GET`
- [x] 4.2 Index `AuditLog(timestamp)` já existia no schema (pré-criado pelo change `collection-audit`)

## 5. Route Handler — Geração de PDF ESG

- [x] 5.1 Criar `src/app/api/v1/admin/report/esg/route.ts` com handler `GET`
- [x] 5.2 Criar `src/lib/pdf/esg-report.ts` com `generateESGReport(metrics, period): Buffer`

## 6. Página — Dashboard Administrativo (INT-07)

- [x] 6.1 Criar `src/app/admin/dashboard/page.tsx` (Server Component)
- [x] 6.2 Criar componente `src/components/admin/KPICard.tsx`
- [x] 6.3 Criar componente `src/components/admin/AuditLogTable.tsx`
- [x] 6.4 Botão "Exportar Relatório ESG" integrado na tabela de auditoria
- [x] 6.5 Criar `src/components/admin/AdminDashboard.css`

## 7. Testes de Integração

- [x] 7.1 Criar `src/__tests__/integration/admin/dashboard.test.ts`
- [x] 7.2 Criar `src/__tests__/integration/admin/audit-logs.test.ts`
- [x] 7.3 Criar `src/__tests__/integration/admin/esg-report.test.ts`

## 8. Testes E2E

- [x] 8.1 Criar `e2e/admin/dashboard-export.spec.ts`

## 9. Validação Final

- [x] 9.1 Executar `npm run lint` e corrigir todos os erros ESLint — *0 erros*
- [x] 9.2 Executar `npm run test:unit` e garantir que os testes de cálculo ESG passam — *59/59 pass*
- [ ] 9.3 Executar `npm run test:integration` e verificar os três testes de integração do admin
- [ ] 9.4 Executar `npm run test:e2e` e verificar o fluxo E2E do dashboard admin
