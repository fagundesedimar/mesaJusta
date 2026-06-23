## Why

Registrar formalmente a finalização do ciclo de doação no momento da entrega presencial dos alimentos. A validação por token e o registro de auditoria imutável evitam fraudes, garantem conformidade com as regras de segurança alimentar (Lei 14.016/2020) e servem de base para métricas de impacto e gamificação.

## What Changes

- Criação do modelo de banco de dados `AuditLog` no Prisma para registros imutáveis de transações críticas.
- Nova rota de API `POST /api/v1/reservations/confirm` para validar o token de retirada.
- Transição de status da doação de "Reservada" para "Retirada" após validação bem-sucedida do token.
- Botão "Confirmar Entrega" na tabela de doações do doador (`INT-02`) que abre popup para inserção do token de 6 caracteres.

## Capabilities

### New Capabilities
- `collection-audit`: Registro de coletas validadas fisicamente por tokens e persistência de trilhas de auditoria imutáveis com registros de executor, data/hora e doações.

### Modified Capabilities
<!-- Nenhuma capacidade existente será modificada nesta etapa -->

## Impact

- Schema do banco de dados (tabela `AuditLog` com campos obrigatórios: `donation_id`, `ong_id`, `donor_id`, `timestamp`, `executor_id`).
- Route Handler `POST /api/v1/reservations/confirm`.
- Componentes e tabela do Dashboard do Doador (`INT-02`).

---

## Detalhes do Planejamento de Execução

### Escopo Funcional
- Inserção de token de 6 caracteres fornecido pela ONG no ato da retirada.
- Validação no servidor se o token confere com o da doação ativa e se o status é "Reservada".
- Atualização atômica (em transação de banco de dados) do status da doação para "Retirada" e gravação no Log de Auditoria.
- Gravação imutável dos campos requeridos: `donation_id`, `ong_id`, `donor_id`, `timestamp` (data/hora da transação), e `executor_id` (usuário logado que acionou a confirmação).

### Dependências
- `reservation-token` (necessita de lotes reservados que já possuam um token ativo).

### Riscos
- Risco Médio: Perda ou falha de consistência ao salvar o log de auditoria durante falha temporária no banco de dados. Mitigado executando a alteração de status e a criação do log de auditoria dentro de uma transação isolada (`Prisma transaction`), falhando ambas se qualquer uma falhar.

### Execução de Linter Necessária
- Validação completa via ESLint (`npm run lint`).

### Testes Unitários Necessários
- Teste do popup/campo de confirmação de entrega para testar o input e mensagens de validação locais de formato do token.

### Testes de Integração Necessários
- Teste do endpoint `POST /api/v1/reservations/confirm` enviando token correto (verificar transição de status para "Retirada" e criação correspondente do registro de log de auditoria).
- Teste enviando token inválido ou doação em status incorreto (garantir retorno de erro de validação).
- Verificação de integridade dos campos da tabela `AuditLog` no PostgreSQL local.

### Testes E2E Necessários
- Fluxo integrado: ONG reserva doação e obtém o token. Doador faz login, clica em "Confirmar Entrega" no seu painel, insere o token exato da ONG, confirma e visualiza a doação atualizada na tabela com status "Retirada" em tempo real.
