## Why

Permite que o administrador monitore a integridade operacional da rede, extraia relatórios ESG consolidados para auditoria de sustentabilidade e analise o histórico imutável de transações do sistema de forma segura.

## What Changes

- Dashboard Administrativo (`INT-07`, com base na screen Stitch `69c24ea7ca4b41fbb13b8ea6593b7bb5`).
- Cards de indicadores consolidados de impacto em tempo real (Toneladas salvas, Famílias alimentadas, CO2 evitado).
- Tabela de Logs de Auditoria com paginação assíncrona (infinite scroll ou paginação tradicional) e filtros por período.
- Funcionalidade de exportação de relatório ESG formatado em PDF para download no backend.

## Capabilities

### New Capabilities
- `admin-dashboard`: Painel analítico de indicadores sociais e ecológicos (refeições, carbono equivalente, peso), tabela de registros de auditoria paginada com buscas temporais, e geração de PDF de relatórios ESG.

### Modified Capabilities
<!-- Nenhuma capacidade existente será modificada nesta etapa -->

## Impact

- Route Handlers `GET /api/v1/admin/dashboard` e `GET /api/v1/admin/report/esg` (geração de PDF).
- Páginas e componentes do Dashboard Administrativo.
- Integração de biblioteca de geração de PDF (ex: `pdfkit` ou `puppeteer` no lado servidor).

---

## Detalhes do Planejamento de Execução

### Escopo Funcional
- Cálculo de métricas:
  - Total Kg Salvos (convertidos para toneladas métricas).
  - Refeições: $1\text{ kg} = 2 \text{ refeições}$.
  - CO2 Evitado: $1\text{ kg} = 2.5\text{ kg CO2eq}$.
- Filtro duplo de data para listagem de auditoria.
- Geração assíncrona e download do PDF estilizado contendo os KPIs da pesquisa selecionada.

### Dependências
- `collection-audit` (necessita de dados da tabela `AuditLog` e tabelas de doações para compilação das métricas).

### Riscos
- Risco Médio: Lentidão e consumo excessivo de memória no servidor Next.js ao compilar grandes relatórios PDF ou ao paginar milhões de linhas de logs de auditoria. Mitigado usando paginação e queries otimizadas no Postgres e streams de PDF no Node.js.

### Execução de Linter Necessária
- Validação completa via ESLint (`npm run lint`).

### Testes Unitários Necessários
- Teste isolado das funções de conversão matemática de impacto ESG.
- Teste do componente de paginação da tabela de logs de auditoria.

### Testes de Integração Necessários
- Teste do endpoint `/api/v1/admin/dashboard` validando a agregação de dados no banco local PostgreSQL.
- Teste do endpoint `/api/v1/admin/report/esg` validando o retorno com mimeType `application/pdf` e cabeçalhos de download.

### Testes E2E Necessários
- Administrador faz login, acessa o painel admin, visualiza os KPIs e a tabela de auditoria, seleciona um período e clica no botão "Exportar Relatório ESG", verificando que o download do PDF é iniciado e concluído com sucesso.
