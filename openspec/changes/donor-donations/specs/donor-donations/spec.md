## ADDED Requirements

### Requirement: Modelo de banco de dados Donation com enum de status
O sistema SHALL criar o modelo `Donation` no Prisma com os campos: `id`, `donorId`, `name`, `category`, `weightKg`, `expiresAt`, `status` (enum `DonationStatus`), `notes`, `moedasVerdes`, `createdAt`, `updatedAt`. O enum `DonationStatus` SHALL ter os valores `AVAILABLE`, `RESERVED`, `COLLECTED`, `EXPIRED`.

#### Scenario: Doação é criada com status inicial AVAILABLE
- **WHEN** uma nova doação é salva no banco via endpoint de cadastro
- **THEN** o campo `status` SHALL ser `AVAILABLE` e `moedasVerdes` SHALL ser calculado conforme a categoria

#### Scenario: Enum impede status inválido no banco
- **WHEN** uma tentativa de gravar um status fora dos valores do enum `DonationStatus` é feita
- **THEN** o Prisma/PostgreSQL SHALL lançar erro de constraint impedindo a gravação

---

### Requirement: Cadastro de novo lote de doação (INT-03)
O sistema SHALL aceitar requisições `POST /api/v1/donations` de usuários autenticados com papel `DONOR`, validar o payload com Zod e persistir o lote no banco com status `AVAILABLE`.

#### Scenario: Cadastro bem-sucedido de lote com dados válidos
- **WHEN** um Doador envia `POST /api/v1/donations` com `{ name, category, weightKg, expiresAt, notes }` onde `expiresAt >= hoje`
- **THEN** o sistema SHALL retornar `201 Created` com o objeto `Donation` criado incluindo `id`, `status: "AVAILABLE"` e `moedasVerdes` calculado

#### Scenario: Cadastro rejeitado com data de validade retroativa
- **WHEN** o campo `expiresAt` do payload contém uma data anterior ao dia atual (UTC)
- **THEN** o sistema SHALL retornar `422 Unprocessable Entity` com mensagem `"A data de validade não pode ser anterior a hoje."`

#### Scenario: Cadastro rejeitado com categoria inválida
- **WHEN** o campo `category` do payload contém um valor fora das categorias permitidas
- **THEN** o sistema SHALL retornar `422 Unprocessable Entity` descrevendo o campo `category` com os valores permitidos

#### Scenario: Acesso negado para papel não-DONOR
- **WHEN** uma requisição `POST /api/v1/donations` é feita com token de papel `ONG` ou sem token
- **THEN** o sistema SHALL retornar `403 Forbidden`

---

### Requirement: Listagem de doações do Doador com expiração automática
O sistema SHALL disponibilizar `GET /api/v1/donations` para o Doador logado, retornando apenas seus lotes. Antes de retornar, SHALL executar uma atualização de status para `EXPIRED` em todos os lotes `AVAILABLE` ou `RESERVED` cujo `expiresAt < now()`.

#### Scenario: Lotes vencidos são marcados como EXPIRED antes da listagem
- **WHEN** o Doador acessa `GET /api/v1/donations` e existem lotes com `expiresAt` anterior ao momento atual e status `AVAILABLE` ou `RESERVED`
- **THEN** o sistema SHALL atualizar esses lotes para `status: EXPIRED` e retornar a lista atualizada com os novos status

#### Scenario: Listagem retorna apenas lotes do Doador logado
- **WHEN** o Doador faz `GET /api/v1/donations`
- **THEN** o sistema SHALL retornar apenas os lotes cujo `donorId` corresponde ao `id` do usuário do token JWT

---

### Requirement: Alerta de expiração no dia corrente (INT-03 Modal)
O sistema SHALL exibir um alerta laranja em destaque no Modal de Nova Doação (`INT-03`) quando a data de validade selecionada for igual ao dia corrente.

#### Scenario: Alerta aparece para lote que expira hoje
- **WHEN** o Doador seleciona uma data de validade igual à data atual no campo do formulário
- **THEN** o modal SHALL exibir o banner `"Atenção: Este lote expira hoje. A retirada deve ser imediata!"` com estilo de alerta laranja

#### Scenario: Alerta não aparece para datas futuras
- **WHEN** o Doador seleciona uma data de validade superior ao dia atual
- **THEN** nenhum alerta de expiração iminente SHALL ser exibido no formulário

---

### Requirement: Dashboard do Doador com métricas e tabela (INT-02)
O sistema SHALL renderizar a página `/dashboard/donor` para usuários com papel `DONOR`, exibindo cards de métricas e a tabela de lotes cadastrados.

#### Scenario: Dashboard exibe cards de métricas do Doador
- **WHEN** o Doador acessa `/dashboard/donor`
- **THEN** a página SHALL exibir cards com: total de Kg doados (soma de `weightKg` de lotes `COLLECTED`), saldo de Moedas Verdes acumuladas e número de doações ativas (status `AVAILABLE` ou `RESERVED`)

#### Scenario: Tabela de lotes exibe status correto em tempo real
- **WHEN** a página é carregada
- **THEN** cada linha da tabela SHALL exibir o status atualizado do lote (`Disponível`, `Reservada`, `Retirada` ou `Expirada`) com a cor correspondente definida no Design System
