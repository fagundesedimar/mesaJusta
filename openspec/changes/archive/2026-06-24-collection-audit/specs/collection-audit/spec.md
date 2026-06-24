## ADDED Requirements

### Requirement: Modelo de banco de dados AuditLog imutável
O sistema SHALL criar o modelo `AuditLog` no Prisma com os campos obrigatórios: `id`, `donationId`, `ongId`, `donorId`, `executorId`, `timestamp`. O modelo SHALL ser configurado sem campo `updatedAt` para comunicar imutabilidade e mapeado para a tabela `audit_logs`.

#### Scenario: AuditLog é criado com todos os campos preenchidos
- **WHEN** uma confirmação de entrega bem-sucedida ocorre
- **THEN** o registro `AuditLog` criado SHALL conter `donationId`, `ongId`, `donorId`, `executorId` e `timestamp` preenchidos e não SHALL ter campo `updatedAt`

#### Scenario: AuditLog não pode ser atualizado via API
- **WHEN** qualquer cliente tenta fazer `PUT` ou `PATCH` em `/api/v1/audit-logs/:id`
- **THEN** o sistema SHALL retornar `405 Method Not Allowed`

---

### Requirement: Confirmação de entrega via token com transação atômica
O sistema SHALL processar confirmações de entrega via `POST /api/v1/reservations/confirm` de forma atômica: validar o token, atualizar o status da doação para `COLLECTED` e criar o registro `AuditLog` — tudo em uma única transação Prisma. Se qualquer etapa falhar, nenhuma alteração SHALL ser persistida.

#### Scenario: Confirmação bem-sucedida com token correto e doação reservada
- **WHEN** o Doador envia `POST /api/v1/reservations/confirm` com `{ donationId, token }` corretos e a doação está com status `RESERVED`
- **THEN** o sistema SHALL retornar `200 OK`, atualizar `donation.status` para `COLLECTED` e criar um registro `AuditLog` com os dados da transação — ambos de forma atômica

#### Scenario: Falha com token incorreto
- **WHEN** o Doador envia um `token` que não corresponde ao token associado à doação
- **THEN** o sistema SHALL retornar `400 Bad Request` com mensagem `"Token inválido. Verifique com a ONG."` e nenhuma alteração SHALL ser persistida

#### Scenario: Falha com doação em status diferente de RESERVED
- **WHEN** o Doador tenta confirmar uma doação com status `AVAILABLE`, `COLLECTED` ou `EXPIRED`
- **THEN** o sistema SHALL retornar `409 Conflict` com mensagem `"Esta doação não está disponível para confirmação de entrega."`

#### Scenario: Rollback em caso de falha de banco durante a transação
- **WHEN** ocorre um erro de banco de dados durante a criação do `AuditLog` (após o update de status)
- **THEN** o sistema SHALL reverter a atualização de status da doação e retornar `500 Internal Server Error`, sem registro parcial no banco

---

### Requirement: Modal de Confirmação de Entrega no Dashboard do Doador (INT-02)
O sistema SHALL exibir um botão "Confirmar Entrega" na linha de cada doação com status `RESERVED` na tabela do Dashboard do Doador. Ao clicar, SHALL abrir um modal com campo de 6 caracteres para inserção do token fornecido pela ONG.

#### Scenario: Modal abre ao clicar em "Confirmar Entrega"
- **WHEN** o Doador clica no botão "Confirmar Entrega" de uma doação com status `RESERVED`
- **THEN** um modal SHALL aparecer com um campo de texto de exatamente 6 caracteres e os botões "Confirmar" e "Cancelar"

#### Scenario: Modal exibe erro para token em formato incorreto localmente
- **WHEN** o Doador clica em "Confirmar" com um token de menos de 6 caracteres no campo
- **THEN** o modal SHALL exibir a mensagem de validação `"O token deve ter exatamente 6 caracteres."` sem fazer chamada à API

#### Scenario: Modal fecha e tabela atualiza após confirmação bem-sucedida
- **WHEN** a confirmação é bem-sucedida (API retorna 200)
- **THEN** o modal SHALL fechar e a linha da doação confirmada SHALL atualizar seu status para "Retirada" na tabela sem recarregar a página inteira
