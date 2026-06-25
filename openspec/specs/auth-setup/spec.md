## Purpose

TBD - Autenticação e cadastro do Mesa Justa.

## Requirements

### Requirement: Cadastro de usuário com validação de papel e restrição geográfica

O sistema SHALL permitir o cadastro de novos usuários via `POST /api/v1/auth/register` com os campos obrigatórios `name`, `email`, `password`, `role` (`DONOR` | `ONG` | `ADMIN`), `document` (CPF para DONOR, CNPJ para ONG) e `zipCode`. O endpoint SHALL validar o formato do documento conforme o papel declarado e rejeitar registros com CEP de estados diferentes de SP e MG.

#### Scenario: Doador se cadastra com CPF válido e CEP de SP
- **WHEN** uma requisição `POST /api/v1/auth/register` é enviada com `role: "DONOR"`, um CPF de 11 dígitos válido e um CEP com prefixo de SP (01000-099999)
- **THEN** o sistema SHALL criar o registro `User` e `Profile` no banco, retornar `201 Created` com o payload `{ id, email, role }` e NÃO incluir senha ou hash na resposta

#### Scenario: ONG se cadastra com CNPJ válido e CEP de MG
- **WHEN** uma requisição `POST /api/v1/auth/register` é enviada com `role: "ONG"`, um CNPJ de 14 dígitos numéricos e um CEP com prefixo de MG (30000-039999)
- **THEN** o sistema SHALL criar o registro, retornar `201 Created` e associar `profileType: "ONG"` ao perfil criado

#### Scenario: Cadastro rejeitado com CEP fora de SP/MG
- **WHEN** uma requisição de cadastro contém um CEP de estado diferente de SP ou MG (ex: RJ, RS)
- **THEN** o sistema SHALL rejeitar com `400 Bad Request` e mensagem `"Cadastro restrito aos estados de SP e MG."`

#### Scenario: Cadastro rejeitado com CPF em formato inválido
- **WHEN** uma requisição de cadastro com `role: "DONOR"` contém um documento com comprimento diferente de 11 dígitos ou com caracteres não numéricos
- **THEN** o sistema SHALL rejeitar com `422 Unprocessable Entity` e mensagem de validação Zod descrevendo o campo `document`

#### Scenario: Cadastro rejeitado com e-mail já existente
- **WHEN** uma requisição de cadastro usa um e-mail já registrado no banco de dados
- **THEN** o sistema SHALL retornar `409 Conflict` com mensagem `"E-mail já cadastrado."`

---

### Requirement: Login com emissão de JWT em cookie HttpOnly

O sistema SHALL autenticar usuários via `POST /api/v1/auth/login` com `email` e `password`. Em caso de sucesso, SHALL emitir um token JWT assinado com `jose`, armazenado em cookie `HttpOnly; Secure; SameSite=Strict` com TTL de 8 horas.

#### Scenario: Login bem-sucedido com credenciais válidas
- **WHEN** uma requisição `POST /api/v1/auth/login` é enviada com `email` e `password` corretos
- **THEN** o sistema SHALL retornar `200 OK`, definir o cookie `auth_token` com flags `HttpOnly; Secure; SameSite=Strict; Max-Age=28800` e incluir no body `{ id, email, role, name }`

#### Scenario: Login falha com senha incorreta
- **WHEN** uma requisição `POST /api/v1/auth/login` é enviada com e-mail existente mas senha incorreta
- **THEN** o sistema SHALL retornar `401 Unauthorized` com mensagem genérica `"Credenciais inválidas."` sem diferenciar a causa do erro

#### Scenario: Login falha com usuário inexistente
- **WHEN** uma requisição `POST /api/v1/auth/login` é enviada com e-mail não cadastrado no banco
- **THEN** o sistema SHALL retornar `401 Unauthorized` com a mesma mensagem genérica `"Credenciais inválidas."` (sem revelar que o e-mail não existe)

#### Scenario: Login bloqueado para usuário com soft delete ativo
- **WHEN** uma requisição de login corresponde a um `User` com `deletedAt` preenchido
- **THEN** o sistema SHALL tratar o usuário como inexistente e retornar `401 Unauthorized`

---

### Requirement: Proteção de rotas via Next.js Middleware (RBAC)

O sistema SHALL implementar um `src/middleware.ts` que intercepte todas as requisições para rotas protegidas e valide o cookie `auth_token`. Rotas sem token válido SHALL ser redirecionadas para `/login`. Rotas com papel insuficiente SHALL retornar `403 Forbidden`.

#### Scenario: Requisição autenticada acessa rota autorizada
- **WHEN** uma requisição com cookie `auth_token` válido e papel `DONOR` acessa `/dashboard/donor`
- **THEN** o Middleware SHALL permitir o acesso sem redirecionamento

#### Scenario: Requisição sem token é redirecionada para login
- **WHEN** uma requisição sem o cookie `auth_token` tenta acessar qualquer rota em `/dashboard/*` ou `/api/v1/*` (exceto `/api/v1/auth/*`)
- **THEN** o Middleware SHALL redirecionar para `/login` com status `302`

#### Scenario: Requisição com token de papel insuficiente é bloqueada
- **WHEN** um usuário com papel `DONOR` tenta acessar uma rota restrita a `ADMIN` (ex: `/admin/*`)
- **THEN** o Middleware SHALL retornar `403 Forbidden`

#### Scenario: Rotas públicas não são interceptadas
- **WHEN** uma requisição acessa `/login`, `/register` ou `/api/v1/auth/*`
- **THEN** o Middleware SHALL permitir o acesso sem verificar token

---

### Requirement: Persistência segura de senhas com Bcrypt

O sistema SHALL armazenar senhas dos usuários como hash produzido por `bcryptjs` com salt rounds = 10. Senhas em texto plano NUNCA SHALL ser armazenadas, logadas ou transmitidas em respostas de API.

#### Scenario: Senha é hasheada antes de persistir no banco
- **WHEN** um novo `User` é criado via endpoint de registro
- **THEN** o campo `passwordHash` no banco SHALL conter um hash Bcrypt e NÃO a senha original

#### Scenario: Verificação de senha no login usa comparação Bcrypt
- **WHEN** o endpoint de login recebe uma senha em texto plano
- **THEN** o sistema SHALL usar `bcryptjs.compare(password, passwordHash)` para verificar sem revelar o hash

---

### Requirement: Soft Delete de usuários

O sistema SHALL suportar exclusão lógica de usuários via o campo `deletedAt DateTime?` no modelo `User` do Prisma. Usuários com `deletedAt` preenchido SHALL ser tratados como inexistentes em todas as operações de autenticação e consulta pública.

#### Scenario: Usuário inativo não aparece em consultas de autenticação
- **WHEN** o sistema busca um usuário por e-mail para login ou qualquer consulta autenticada
- **THEN** a query Prisma SHALL incluir o filtro `deletedAt: null` para excluir registros com soft delete ativo
