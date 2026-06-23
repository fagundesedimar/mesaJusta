## 1. Preparação e Dependências

- [ ] 1.1 Instalar dependência de geração de PDF: `npm install pdfkit` e `npm install -D @types/pdfkit`
- [ ] 1.2 Confirmar que `collection-audit` e `donor-donations` estão implementados (tabelas `AuditLog` e `Donation` existem no banco)

## 2. Módulo de Cálculo ESG

- [ ] 2.1 Criar `src/lib/esg/formulas.ts` com constantes e funções: `calcMeals(kg)`, `calcCO2eq(kg)`, `calcTons(kg)` baseadas em `meals_per_kg: 2` e `co2_saved_per_kg: 2.5` do `openspec/config.yaml`
- [ ] 2.2 Criar testes unitários em `src/__tests__/unit/esg/formulas.test.ts` cobrindo os cálculos para 0 kg, 1 kg, 100 kg e valores decimais

## 3. Route Handler — Dashboard de Métricas

- [ ] 3.1 Criar `src/app/api/v1/admin/dashboard/route.ts` com handler `GET`: agregar `_sum(weightKg)` e `_count` de doações com `status: COLLECTED` via Prisma; calcular KPIs com `src/lib/esg/formulas.ts`; retornar JSON `{ totalKgSaved, totalTonsSaved, totalMeals, totalCO2eqKg, totalDonations, totalONGs }`
- [ ] 3.2 Validar papel `ADMIN` no Route Handler (defense in depth além do Middleware)
- [ ] 3.3 Adicionar índices em `Donation(status, createdAt)` no schema Prisma e executar migração `npx prisma migrate dev --name admin-dashboard-indexes`

## 4. Route Handler — Listagem de AuditLog

- [ ] 4.1 Criar `src/app/api/v1/admin/audit-logs/route.ts` com handler `GET`: aceitar query params `startDate`, `endDate`, `page` (default 1); paginar com `skip`/`take = 50`; filtrar por `timestamp` entre `startDate` e `endDate`; retornar `{ data, total, page, totalPages }`
- [ ] 4.2 Adicionar índice em `AuditLog(timestamp)` no schema Prisma e executar migração

## 5. Route Handler — Geração de PDF ESG

- [ ] 5.1 Criar `src/app/api/v1/admin/report/esg/route.ts` com handler `GET`: reutilizar a lógica de cálculo de KPIs do endpoint de dashboard filtrado por período; gerar PDF com `pdfkit` em stream Node.js; retornar com `Content-Type: application/pdf` e `Content-Disposition: attachment; filename="relatorio-esg.pdf"`
- [ ] 5.2 Criar função auxiliar `src/lib/pdf/esg-report.ts` com `generateESGReport(metrics, period): Buffer` para isolar a lógica de geração do PDF e facilitar testes

## 6. Página — Dashboard Administrativo (INT-07)

- [ ] 6.1 Criar `src/app/admin/dashboard/page.tsx` (Server Component) que faz fetch do endpoint de métricas e passa os dados para componentes de UI
- [ ] 6.2 Criar componente `src/components/admin/KPICard.tsx` (Vanilla CSS) para exibição dos cards de indicadores com ícone, valor formatado e label
- [ ] 6.3 Criar componente `src/components/admin/AuditLogTable.tsx` com tabela paginada, filtros de data e integração com `/api/v1/admin/audit-logs`
- [ ] 6.4 Adicionar botão "Exportar Relatório ESG" no Dashboard que chama `GET /api/v1/admin/report/esg` com o período selecionado e dispara o download do arquivo PDF
- [ ] 6.5 Criar `src/components/admin/AdminDashboard.css` com estilos Vanilla CSS para cards, tabela e filtros

## 7. Testes de Integração

- [ ] 7.1 Criar `src/__tests__/integration/admin/dashboard.test.ts` cobrindo: resposta com métricas corretas quando há doações coletadas, resposta com zeros quando não há dados, retorno 403 para papel não-ADMIN
- [ ] 7.2 Criar `src/__tests__/integration/admin/audit-logs.test.ts` cobrindo: paginação, filtro de período, resposta vazia em página além do total
- [ ] 7.3 Criar `src/__tests__/integration/admin/esg-report.test.ts` verificando `Content-Type: application/pdf` e cabeçalho `Content-Disposition` na resposta

## 8. Testes E2E

- [ ] 8.1 Criar `e2e/admin/dashboard-export.spec.ts`: Admin faz login, acessa `/admin/dashboard`, visualiza cards, seleciona período no filtro da tabela e clica em "Exportar Relatório ESG" — verificar que o download do arquivo PDF é iniciado sem erros

## 9. Validação Final

- [ ] 9.1 Executar `npm run lint` e corrigir todos os erros ESLint
- [ ] 9.2 Executar `npm run test:unit` e garantir que os testes de cálculo ESG passam
- [ ] 9.3 Executar `npm run test:integration` e verificar os três testes de integração do admin
- [ ] 9.4 Executar `npm run test:e2e` e verificar o fluxo E2E do dashboard admin
