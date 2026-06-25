## Why

Estabelecer um sistema seguro de autenticação e credenciamento de usuários para segregar o acesso entre Doadores, ONGs e Administradores. Sem isso, as funcionalidades logísticas e de monitoramento não possuem garantia de segurança, privacidade de geolocalização (LGPD) e integridade de transações.

## What Changes

- Criação dos modelos de banco de dados (`User`, `Profile`) via Prisma ORM com suporte a exclusão lógica (Soft Delete).
- Endpoints de API para cadastro (`POST /api/v1/auth/register`) e login (`POST /api/v1/auth/login`).
- Validação no cadastro do formato de CNPJ (14 dígitos), CPF (11 dígitos) e limitação geográfica (endereço de CEP restrito a SP e MG).
- Next.js Middleware para autenticação via Cookies HttpOnly e autorização baseada em papéis (RBAC).

## Capabilities

### New Capabilities
- `auth-setup`: Sistema de cadastro, login e controle de acesso baseado em papéis (RBAC) com isolamento lógico de perfil (Doador, ONG, Administrador) e validações geográficas preliminares.

### Modified Capabilities
<!-- Nenhuma capacidade existente será modificada nesta etapa inicial -->

## Impact

- Schema do banco de dados Prisma (tabelas de usuários e sessões).
- Novas rotas de API `/api/v1/auth/*`.
- Configuração de Next.js Middleware para interceptação de rotas protegidas.

---

## Detalhes do Planejamento de Execução

### Escopo Funcional
- Tela de login e formulário expandido de cadastro (`INT-01`, com base na screen Stitch `8cac23cd060946ff81762496d5609d69`).
- Hashing de senhas via Bcrypt (salt rounds = 10).
- Emissão de tokens JWT com expiração curta e armazenamento seguro em cookies com flags `Secure`, `HttpOnly`, e `SameSite=Strict`.
- Restrição de cadastro baseada nos estados de SP e MG e validação de CNPJ/CPF em tempo real.

### Dependências
- Nenhuma (estrutura inicial do projeto).

### Riscos
- Risco Médio: Brechas na lógica de interceptação do middleware podem permitir acessos indevidos. Minimizável através de testes de integração rigorosos cobrindo todas as rotas com/sem tokens JWT.

### Execução de Linter Necessária
- Validação completa via ESLint (`npm run lint`).

### Testes Unitários Necessários
- Validação de funções utilitárias de formatação e verificação de CNPJ/CPF.
- Teste do formulário de login/cadastro (`INT-01` / `8cac23cd060946ff81762496d5609d69`) para testar validações locais de inputs e exibição de mensagens de erro.

### Testes de Integração Necessários
- Chamadas de integração nos endpoints `POST /api/v1/auth/register` e `POST /api/v1/auth/login` validando payloads válidos e inválidos.
- Teste de interceptação do Next.js Middleware em rotas protegidas simulando cookies válidos, inválidos e ausentes.

### Testes E2E Necessários
- Fluxo de ponta a ponta de cadastro de um Doador com endereço válido de SP, login correspondente e acesso seguro ao Dashboard.
- Fluxo de bloqueio ao tentar cadastrar com CEP de outro estado (ex: RJ).
- Acesso bloqueado a rotas restritas por usuários sem login ativo.
