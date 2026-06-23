## Why

Permite que os estabelecimentos doadores gerenciem e cadastrem seus lotes de alimentos excedentes de forma rápida e segura, alimentando a rede de matching do circuito solidário e permitindo a rastreabilidade inicial de cada doação.

## What Changes

- Criação do modelo de banco de dados `Donation` no Prisma com relacionamento para o usuário doador.
- Dashboard do Doador (`INT-02`, com base na screen Stitch `00ee87a028e1470e9529aedefd3409f1`) listando seus lotes e indicadores.
- Modal de cadastro de novo lote (`INT-03`, com base na screen Stitch `5be298a758ba4f508178e1035ace7301`) contendo descrição, categoria, peso, validade e recomendações.
- Bloqueio de datas de validade retroativas e alerta laranja para vencimento no dia corrente.
- Rotina para expiração automática de lotes (status transiciona para "Expirada" se a data passar do dia atual).

## Capabilities

### New Capabilities
- `donor-donations`: Gestão de doações por estabelecimentos, incluindo cadastro de lotes com validações de data de vencimento e alertas visuais, além de rotina automática de expiração de lotes.

### Modified Capabilities
<!-- Nenhuma capacidade existente será modificada nesta etapa -->

## Impact

- Banco de dados (tabela `Donation` associada ao doador).
- Route Handler `POST /api/v1/donations` e `GET /api/v1/donations` (para o doador logado).
- Página de Dashboard do Doador e componentes React associados.

---

## Detalhes do Planejamento de Execução

### Escopo Funcional
- Exibição de cards de métricas (kg doados, saldo de moedas verdes, selo ESG) no painel do doador.
- Formulário modal com campos: nome do alimento, categoria (hortifrúti, panificados, laticínios, mercearia, proteínas, refeições prontas), peso total em kg, data de validade, recomendações.
- Alerta em destaque caso o lote expire no dia atual ("Atenção: Este lote expira hoje. A retirada deve ser imediata!").
- Lotes salvos com status inicial "Disponível".
- Mecanismo que verifica o vencimento de lotes e atualiza o status de "Disponível" ou "Reservada" para "Expirada" se vencido.

### Dependências
- `auth-setup` (para autenticação de Doador e amarração com a chave do estabelecimento).

### Riscos
- Risco Médio: Alimentos vencidos continuarem disponíveis para reservas devido a falhas no timer/script de expiração. Minimizável rodando verificações automáticas no carregamento do dashboard das ONGs e no backend na listagem ativa.

### Execução de Linter Necessária
- Validação completa via ESLint (`npm run lint`).

### Testes Unitários Necessários
- Validação de data no formulário (bloqueio de data retroativa).
- Exibição do Modal `INT-03` (`5be298a758ba4f508178e1035ace7301`) e seu alerta de expiração no dia de hoje.

### Testes de Integração Necessários
- Teste do endpoint `POST /api/v1/donations` enviando corpo de dados completo e validando no banco de dados.
- Teste da rotina de expiração: salvar lotes com data de validade vencida e rodar o job para garantir a transição de status para "Expirada".

### Testes E2E Necessários
- Login como Doador, clique em "+ Nova Doação", preenchimento de formulário com dados corretos, salvamento e exibição do novo lote na tabela do Dashboard com status "Disponível".
