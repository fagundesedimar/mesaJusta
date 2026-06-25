## Purpose

TBD - Sistema de reserva e token de retirada do Mesa Justa.

## Requirements

### Requirement: Reserva exclusiva de lote com token de retirada

O sistema SHALL permitir que uma ONG autenticada reserve um lote de doação disponível via `POST /api/v1/reservations`, transitando o status de `AVAILABLE` para `RESERVED` e gerando um token alfanumérico único no formato `MJ-XXXX`.

#### Scenario: Reserva bem-sucedida
- **WHEN** uma ONG autenticada envia `POST /api/v1/reservations` com `donationId` de uma doação com status `AVAILABLE`
- **THEN** o sistema retorna `201 Created` com `{ donationId, reservationToken, reservedAt, expiresAt }` e a doação passa para status `RESERVED`

#### Scenario: Tentativa de reservar lote já reservado
- **WHEN** uma ONG tenta reservar uma doação que já está com status `RESERVED`
- **THEN** o sistema retorna `409 Conflict` com mensagem `"Lote já reservado por outra ONG"`

#### Scenario: Exclusividade em requisições simultâneas
- **WHEN** 10 requisições simultâneas são feitas para reservar o mesmo lote
- **THEN** exatamente 1 reserva é aceita com `201 Created` e as demais 9 retornam `409 Conflict`

#### Scenario: ONG não autenticada não pode reservar
- **WHEN** uma requisição sem token de autenticação é feita para `POST /api/v1/reservations`
- **THEN** o sistema retorna `401 Unauthorized`

#### Scenario: Papel não-ONG não pode reservar
- **WHEN** um usuário com papel `DONOR` ou `ADMIN` tenta reservar um lote
- **THEN** o sistema retorna `403 Forbidden`

### Requirement: Unicidade e formato do token de retirada

O sistema SHALL garantir que cada token de retirada gerado seja único no banco de dados e siga o formato `MJ-XXXX` onde `XXXX` são 4 caracteres alfanuméricos maiúsculos.

#### Scenario: Token gerado com formato correto
- **WHEN** uma reserva é criada com sucesso
- **THEN** o campo `reservationToken` corresponde à expressão regular `^MJ-[A-Z0-9]{4}$`

#### Scenario: Unicidade garantida em caso de colisão
- **WHEN** o sistema gera um token que já existe no banco
- **THEN** o sistema regenera o token e tenta novamente (até 3 tentativas) antes de retornar erro interno

### Requirement: Cancelamento de reserva pela ONG

O sistema SHALL permitir que a ONG que realizou a reserva cancele-a via `POST /api/v1/reservations/cancel`, transitando o status da doação de `RESERVED` para `AVAILABLE` e removendo os dados de reserva.

#### Scenario: Cancelamento bem-sucedido
- **WHEN** a ONG que realizou a reserva envia `POST /api/v1/reservations/cancel` com `donationId` válido
- **THEN** o sistema retorna `200 OK`, a doação volta ao status `AVAILABLE`, e os campos `reservationToken`, `reservedAt`, `reservedByOngId` são nulificados

#### Scenario: ONG diferente não pode cancelar reserva alheia
- **WHEN** uma ONG tenta cancelar a reserva de um lote reservado por outra ONG
- **THEN** o sistema retorna `403 Forbidden`

#### Scenario: Cancelamento registrado no AuditLog
- **WHEN** uma reserva é cancelada
- **THEN** o sistema registra uma entrada no `AuditLog` com a ação `RESERVATION_CANCELLED` e o `donationId` correspondente

### Requirement: Painel de Reservas Ativas da ONG (INT-06)

O sistema SHALL exibir no painel da ONG (`INT-06`) todas as suas reservas ativas, com token de retirada em destaque, endereço de retirada, contatos do Doador, cronômetro regressivo até a expiração e opção de cancelamento.

#### Scenario: Painel exibe reservas ativas da ONG logada
- **WHEN** uma ONG autenticada acessa o painel de reservas
- **THEN** são exibidas apenas as doações com status `RESERVED` associadas à ONG logada

#### Scenario: Token exibido em fonte monoespaçada em destaque
- **WHEN** o painel de reservas é renderizado
- **THEN** o `reservationToken` é exibido em elemento com fonte monoespaçada (`font-family: monospace`) e destaque visual

#### Scenario: Cronômetro regressivo ativo
- **WHEN** a ONG visualiza uma reserva ativa no painel
- **THEN** um contador em tempo real exibe o tempo restante até `expiresAt` atualizado a cada segundo

#### Scenario: Alerta visual quando faltam menos de 2 horas
- **WHEN** o tempo restante para expiração é menor que 2 horas (7.200 segundos)
- **THEN** o cronômetro exibe animação de piscar em vermelho (`color: red; animation: blink`)

#### Scenario: Botão de cancelamento visível no painel
- **WHEN** a ONG visualiza uma reserva ativa
- **THEN** um botão "Cancelar Reserva" está disponível e ao ser clicado exibe confirmação antes de executar o cancelamento
