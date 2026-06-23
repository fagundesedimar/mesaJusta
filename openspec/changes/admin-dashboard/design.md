## Context

O Mesa Justa não possui atualmente nenhuma camada analítica nem mecanismo de exportação de relatórios. O Administrador precisa de visibilidade em tempo real sobre o impacto da rede solidária (alimentos salvos, famílias atendidas, carbono evitado), além de acesso auditável ao histórico de transações do sistema. Este change depende do `collection-audit` para que os dados da tabela `AuditLog` já estejam disponíveis para agregação.

**Stakeholders:** Administradores do sistema, equipes de auditoria ESG, parceiros institucionais que recebem relatórios de impacto.

---

## Goals / Non-Goals

**Goals:**
- Criar endpoint `GET /api/v1/admin/dashboard` que agrega métricas de impacto (kg salvos → toneladas, refeições = kg × 2, CO2eq = kg × 2.5) consultando o banco de dados
- Criar endpoint `GET /api/v1/admin/report/esg` que gera e retorna um PDF de relatório com os KPIs filtrados por período
- Implementar página `INT-07` do Dashboard Administrativo com cards de indicadores e tabela de `AuditLog` paginada com filtro por data
- Proteção das rotas `/admin/*` e `/api/v1/admin/*` exigindo papel `ADMIN` (via Middleware de `auth-setup`)

**Non-Goals:**
- Dashboard em tempo real via WebSocket — métricas são calculadas por polling ou on-demand no MVP
- Exportação em formatos alternativos (CSV, XLSX) — apenas PDF no MVP
- Alertas automáticos por e-mail para o administrador — deferido para versão futura
- Painel de gestão de usuários (ativar/desativar contas) — escopo de módulo admin separado

---

## Decisions

### D1: Geração de PDF com `pdfkit` (Node.js stream) vs. `puppeteer` (headless browser)

**Decisão:** Usar `pdfkit` para geração de PDF no servidor.

**Rationale:** `puppeteer` requer uma instância Chromium headless, o que adiciona ~150-300 MB ao bundle do servidor e tem cold-start lento (crítico em ambiente Vercel/serverless). `pdfkit` é uma biblioteca de desenho de documentos em stream puro para Node.js, sem dependências externas, compatível com o runtime Node do Next.js Route Handlers. Para o relatório ESG — que é essencialmente um documento estruturado com tabelas de KPIs e logo — `pdfkit` oferece controle preciso e tamanho de pacote mínimo.

**Alternativa descartada:** `puppeteer` — sobrepeso para o MVP; `@react-pdf/renderer` — requer compilação de componentes React no servidor, incompatível com Edge Runtime.

---

### D2: Agregação de Métricas no Route Handler vs. View Materializada no Postgres

**Decisão:** Aggregação via query Prisma com `_sum` e `_count` no Route Handler, sem view materializada no MVP.

**Rationale:** Views materializadas exigem manutenção de esquema adicional e lógica de refresh. Para o volume esperado do MVP (< 50.000 doações), queries agregadas com índices apropriados nas colunas `status` e `createdAt` da tabela `Donation` são suficientemente rápidas (< 200ms). A view materializada pode ser introduzida como otimização em versão futura quando o volume justificar.

**Alternativa descartada:** View materializada — superdimensionada para o MVP; cache Redis dos KPIs — considerada, mas adiciona invalidação de cache como complexidade extra no MVP.

---

### D3: Paginação da Tabela de AuditLog — Cursor-based vs. Offset-based

**Decisão:** Usar paginação por offset (`skip`/`take` do Prisma) com limite de 50 registros por página.

**Rationale:** Cursor-based pagination é mais eficiente para grandes volumes, mas exige UI de "próxima página" sem salto direto a páginas numeradas. O filtro por período da tabela de AuditLog já restringe o conjunto de dados, tornando offset aceitável para o volume do MVP. A paginação numerada é mais familiar para operadores administrativos que precisam navegar diretamente a períodos específicos.

**Alternativa descartada:** Cursor-based — melhor performance em escala, mas UX de navegação mais limitada para o caso de uso admin.

---

### D4: Fórmulas ESG como Constantes no Código vs. Configuráveis no Banco

**Decisão:** Usar constantes tipadas em `src/lib/esg/formulas.ts` referenciadas do `openspec/config.yaml`.

**Rationale:** Os multiplicadores ESG (`meals_per_kg: 2`, `co2_saved_per_kg: 2.5`, `base_multiplier: 10` para Moedas Verdes) são definidos como regras de negócio estáveis no `openspec/config.yaml`. Centralizá-los em um módulo TypeScript tipado garante reutilização entre o Dashboard, o relatório PDF e os testes unitários sem acoplamento ao banco de dados. Configurabilidade em banco seria overengineering para o MVP.

---

## Risks / Trade-offs

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Lentidão na query de agregação com muitas doações sem índice | Média | Alto | Adicionar índices em `Donation(status, createdAt)` e `AuditLog(createdAt)` na migração |
| Geração de PDF com muitos registros causando timeout no Route Handler | Baixa | Médio | Limitar o período do relatório a no máximo 12 meses por request; usar streaming de resposta Node.js |
| Acesso indevido ao painel admin por falha no Middleware RBAC | Baixa | Crítico | Validar papel `ADMIN` tanto no Middleware quanto no próprio Route Handler (defense in depth) |
| Dados de AuditLog ausentes se `collection-audit` não estiver implementado | Alta | Alto | Este change depende de `collection-audit` estar concluído; o endpoint de dashboard deve retornar zeros graciosamente se não houver logs |

---

## Migration Plan

1. Instalar dependência: `npm install pdfkit` e `npm install -D @types/pdfkit`
2. Criar módulo `src/lib/esg/formulas.ts` com as constantes de cálculo
3. Criar Route Handler `src/app/api/v1/admin/dashboard/route.ts`
4. Criar Route Handler `src/app/api/v1/admin/report/esg/route.ts` com streaming PDF
5. Criar página `src/app/admin/dashboard/page.tsx` com componentes de cards e tabela
6. Rollback: remover arquivos de rota e página; nenhuma migração de schema é necessária (tabelas `AuditLog` e `Donation` são de `collection-audit` e `donor-donations`)
