## Why

Garantir exclusividade temporária na retirada de um lote de alimentos para a ONG interessada, gerando um token de autenticação física que comprova o direito à coleta e evita duplicidade de coletas ou deslocamentos frustrados das equipes operacionais.

## What Changes

- Lógica de transição de status de "Disponível" para "Reservada" na doação, com tratamento de concorrência para evitar reservas simultâneas do mesmo lote.
- Geração automatizada de token de retirada alfanumérico único de 6 caracteres (ex: `MJ-A94D`).
- Painel de Reservas Ativas da ONG (`INT-06`, com base na screen Stitch `ba7e9a72e8374015862ad60aba832470`) exibindo os tokens, endereço de retirada e contatos.
- Cronômetro regressivo com alerta visual (vermelho piscante) caso falte menos de 2 horas para expirar a validade do lote reservado.
- Opção para a ONG cancelar a reserva, fazendo com que o lote retorne a ficar "Disponível" para toda a rede.

## Capabilities

### New Capabilities
- `reservation-token`: Sistema de reserva exclusiva de lotes de alimentos com geração de tokens alfanuméricos de retirada, contagem regressiva de validade, e cancelamento de reservas.

### Modified Capabilities
<!-- Nenhuma capacidade existente será modificada nesta etapa -->

## Impact

- Database updates (atualização do model `Donation` para incluir `token`, `reserved_at`, e relacionamento com a ONG).
- API Route Handlers: `POST /api/v1/reservations` e `POST /api/v1/reservations/cancel`.
- Tela de Reservas Ativas da ONG.

---

## Detalhes do Planejamento de Execução

### Escopo Funcional
- Botão "Reservar Lote" dentro do popup do mapa ou lista lateral.
- Bloqueio concorrente (database-level locks ou transação no Prisma) no momento da reserva.
- Exibição de token em fonte monoespaçada em destaque.
- Rotas externas do Google Maps integradas ("Ver Rota de Retirada").
- Cronômetro regressivo atualizado dinamicamente em tempo real na interface da ONG.

### Dependências
- `geo-matching-map` (a ONG necessita do mapa e lista lateral de doações próximas para escolher qual lote reservar).

### Riscos
- Risco Médio: Condições de corrida (race conditions) em que duas ONGs reservem o mesmo lote no mesmo milissegundo, resultando em insatisfação logística. Mitigado usando transações isoladas (`Serializable` ou locks pessimistas) no Prisma/Postgres.

### Execução de Linter Necessária
- Validação completa via ESLint (`npm run lint`).

### Testes Unitários Necessários
- Validação de formato da função geradora de token de 6 caracteres.
- Teste do componente de contagem regressiva em tempo real com mudanças visuais de cor abaixo do limite de 2 horas.

### Testes de Integração Necessários
- Teste de chamadas HTTP para o endpoint `POST /api/v1/reservations`.
- Simulação de concorrência com 10 requisições simultâneas para reservar um único lote, garantindo que apenas 1 seja aceita e 9 falhem com status `409 Conflict`.
- Teste de cancelamento de reserva verificando a liberação do lote de volta para "Disponível".

### Testes E2E Necessários
- ONG logada acessa o mapa, clica para reservar uma doação, confirma, é redirecionada ao Painel de Reservas Ativas, vê o token correspondente gerado, e cancela a reserva (verificando que a doação volta a ficar "Disponível" no mapa).
