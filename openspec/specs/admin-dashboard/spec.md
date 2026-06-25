## Purpose

TBD - Painel administrativo do Mesa Justa.

## Requirements

### Requirement: Endpoint de métricas agregadas do Dashboard Administrativo

O sistema SHALL disponibilizar um endpoint `GET /api/v1/admin/dashboard` que retorna os indicadores consolidados de impacto calculados a partir dos registros de doações com status `COLLECTED`. Acesso SHALL ser restrito ao papel `ADMIN`.

#### Scenario: Admin obtém métricas consolidadas com dados existentes
- **WHEN** um usuário com papel `ADMIN` faz `GET /api/v1/admin/dashboard` e existem doações com status `COLLECTED` no banco
- **THEN** o sistema SHALL retornar `200 OK` com payload `{ totalKgSaved, totalTonsSaved, totalMeals, totalCO2eqKg, totalDonations, totalONGs }` calculados com as fórmulas: `totalMeals = totalKgSaved * 2`, `totalCO2eqKg = totalKgSaved * 2.5`

#### Scenario: Admin obtém métricas zeradas sem doações coletadas
- **WHEN** um usuário com papel `ADMIN` faz `GET /api/v1/admin/dashboard` e não há doações com status `COLLECTED`
- **THEN** o sistema SHALL retornar `200 OK` com todos os valores numéricos zerados (não erro)

#### Scenario: Acesso negado para papel não-ADMIN
- **WHEN** uma requisição ao endpoint `/api/v1/admin/dashboard` é feita com token de papel `DONOR` ou `ONG`
- **THEN** o sistema SHALL retornar `403 Forbidden`

---

### Requirement: Tabela de AuditLog paginada com filtro por período

O sistema SHALL disponibilizar um endpoint `GET /api/v1/admin/audit-logs` que retorna registros da tabela `AuditLog` paginados (máximo 50 por página) e filtrável por período de data (`startDate` e `endDate` como query params).

#### Scenario: Admin lista logs com filtro de período
- **WHEN** um usuário `ADMIN` faz `GET /api/v1/admin/audit-logs?startDate=2025-01-01&endDate=2025-12-31&page=1`
- **THEN** o sistema SHALL retornar `200 OK` com `{ data: AuditLog[], total, page, totalPages }` contendo apenas registros cujo `timestamp` está dentro do período informado

#### Scenario: Admin lista logs sem filtro de período
- **WHEN** um usuário `ADMIN` faz `GET /api/v1/admin/audit-logs` sem parâmetros de data
- **THEN** o sistema SHALL retornar os 50 registros mais recentes ordenados por `timestamp DESC`

#### Scenario: Paginação retorna página vazia ao ultrapassar total
- **WHEN** o parâmetro `page` enviado ultrapassa o número total de páginas
- **THEN** o sistema SHALL retornar `200 OK` com `data: []` e `total` correto

---

### Requirement: Geração e download de relatório ESG em PDF

O sistema SHALL gerar e retornar um PDF contendo os KPIs de impacto ESG via `GET /api/v1/admin/report/esg` com parâmetros opcionais `startDate` e `endDate`.

#### Scenario: Admin gera relatório PDF com período definido
- **WHEN** um usuário `ADMIN` faz `GET /api/v1/admin/report/esg?startDate=2025-01-01&endDate=2025-12-31`
- **THEN** o sistema SHALL retornar resposta com `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="relatorio-esg-2025.pdf"` e o conteúdo binário do PDF contendo os KPIs calculados

#### Scenario: PDF contém todos os indicadores obrigatórios
- **WHEN** o PDF é gerado com dados existentes
- **THEN** o documento SHALL conter: título "Mesa Justa — Relatório de Impacto ESG", período analisado, total de Kg salvos, toneladas métricas, refeições complementadas, CO2eq evitado (kg) e número total de doações coletadas

#### Scenario: Acesso ao endpoint de relatório negado para não-ADMIN
- **WHEN** uma requisição ao `/api/v1/admin/report/esg` é feita sem token ou com papel `DONOR`/`ONG`
- **THEN** o sistema SHALL retornar `403 Forbidden`

---

### Requirement: Página de Dashboard Administrativo (INT-07)

O sistema SHALL renderizar a página `/admin/dashboard` acessível apenas para usuários com papel `ADMIN`, exibindo cards de KPIs e a tabela de AuditLog com filtros de período e botão de exportação.

#### Scenario: Admin visualiza KPIs em cards na página do Dashboard
- **WHEN** um usuário `ADMIN` acessa `/admin/dashboard`
- **THEN** a página SHALL exibir pelo menos 4 cards de indicadores: "Kg Salvos", "Refeições Complementadas", "CO2 Evitado" e "Doações Coletadas", com os valores numéricos formatados

#### Scenario: Admin filtra tabela de auditoria por período e baixa PDF
- **WHEN** o Admin seleciona datas de início e fim no filtro e clica em "Exportar Relatório ESG"
- **THEN** o navegador SHALL iniciar o download de um arquivo PDF com os dados do período selecionado
