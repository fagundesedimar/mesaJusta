## Purpose

TBD - Gamificação e indicadores ESG do Mesa Justa.

## Requirements

### Requirement: Cálculo de Moedas Verdes por retirada confirmada

O sistema SHALL calcular e creditar Moedas Verdes automaticamente na conta do Doador sempre que uma doação transicionar para o status `COLLECTED`, usando a fórmula: `Moedas = floor(weightKg × 10 × multiplicador)`, onde o multiplicador é `1.5` para categorias `READY_MEAL` e `PROTEIN`, e `1.0` para demais categorias.

#### Scenario: Crédito padrão para categoria comum
- **WHEN** uma doação de 5kg da categoria `VEGETABLE` é confirmada como `COLLECTED`
- **THEN** o sistema credita `50` Moedas Verdes na conta do Doador (`floor(5 × 10 × 1.0)`)

#### Scenario: Crédito com multiplicador para proteínas
- **WHEN** uma doação de 10kg da categoria `PROTEIN` é confirmada como `COLLECTED`
- **THEN** o sistema credita `150` Moedas Verdes na conta do Doador (`floor(10 × 10 × 1.5)`)

#### Scenario: Crédito com multiplicador para refeições prontas
- **WHEN** uma doação de 4kg da categoria `READY_MEAL` é confirmada como `COLLECTED`
- **THEN** o sistema credita `60` Moedas Verdes na conta do Doador (`floor(4 × 10 × 1.5)`)

#### Scenario: Idempotência — sem duplo crédito
- **WHEN** o Route Handler de coleta recebe uma segunda requisição para uma doação já com status `COLLECTED`
- **THEN** o sistema retorna `409 Conflict` e NÃO credita Moedas Verdes novamente

### Requirement: Atribuição dinâmica de selos ESG

O sistema SHALL atribuir selos ESG ao Doador com base no total acumulado de Moedas Verdes, seguindo as faixas: Bronze (0–1.000), Prata (1.001–5.000), Ouro (> 5.000).

#### Scenario: Doador na faixa Bronze
- **WHEN** um Doador possui 800 Moedas Verdes acumuladas
- **THEN** o painel exibe o selo `Bronze`

#### Scenario: Doador na faixa Prata
- **WHEN** um Doador possui 3.500 Moedas Verdes acumuladas
- **THEN** o painel exibe o selo `Prata`

#### Scenario: Doador na faixa Ouro
- **WHEN** um Doador possui 7.200 Moedas Verdes acumuladas
- **THEN** o painel exibe o selo `Ouro`

#### Scenario: Atualização imediata após nova coleta
- **WHEN** uma coleta eleva o saldo de 980 para 1.050 Moedas Verdes
- **THEN** o painel do Doador exibe o novo selo `Prata` na próxima visualização

### Requirement: Ranking público Top 10 do mês

O sistema SHALL expor o endpoint `GET /api/v1/gamification/ranking` retornando os 10 Doadores com maior saldo de Moedas Verdes no mês corrente (calculado pelas doações coletadas no período), ordenados de forma decrescente.

#### Scenario: Retorno do ranking com dados
- **WHEN** uma requisição autenticada é feita para `GET /api/v1/gamification/ranking`
- **THEN** o sistema retorna JSON com array de até 10 itens contendo `{ rank, establishmentName, greenCoins, badge }`

#### Scenario: Ranking vazio no início do mês
- **WHEN** nenhuma doação foi coletada no mês corrente
- **THEN** o sistema retorna array vazio `{ data: [] }`

#### Scenario: Apenas nome fantasia no ranking (LGPD)
- **WHEN** o ranking é retornado
- **THEN** o sistema exibe apenas o nome fantasia do estabelecimento, SEM CPF, CNPJ, e-mail ou outros dados pessoais

### Requirement: Exibição de Moedas Verdes e selo no painel do Doador

O sistema SHALL exibir no painel do Doador (`INT-02`) o saldo atual de Moedas Verdes e o selo ESG correspondente, além dos 10 primeiros colocados do ranking do mês.

#### Scenario: Painel carrega saldo e selo do doador logado
- **WHEN** um Doador autenticado acessa seu painel
- **THEN** o componente exibe o saldo de Moedas Verdes e o ícone/badge do nível ESG correspondente

#### Scenario: Painel carrega ranking do mês
- **WHEN** um Doador autenticado acessa seu painel
- **THEN** uma lista com até 10 posições do ranking mensal é exibida, com destaque visual para a posição do próprio Doador caso ele esteja entre os top 10
