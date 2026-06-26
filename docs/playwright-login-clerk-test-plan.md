# Plano de Testes Playwright — Fluxo de Login com Clerk

## Objetivo
Planejar a suíte de testes E2E para o fluxo de login do Mesa Justa com foco na autenticação baseada em Clerk / JWT em cookie, proteção de rotas e recuperação de sessão.

## Escopo
- Login via formulário de autenticação em `/login`
- Validação de erros no fluxo de login
- Emissão de cookie de sessão `auth_token`
- Acesso a rotas protegidas após autenticação
- Redirecionamento de rotas públicas e protegidas
- Compatibilidade com a arquitetura de autenticação descrita no spec de auth disponível em `openspec/specs/auth-setup/spec.md`

> Nota: O arquivo `openspec/specs/user-authentication.md` não foi encontrado no repositório. O planejamento foi baseado na especificação de autenticação existente em `openspec/specs/auth-setup/spec.md`.

## Premissas
- O ambiente de teste inicia com estado limpo, sem sessão ativa e sem dados de usuário criados.
- A aplicação está rodando em `http://localhost:3000` ou em `PLAYWRIGHT_BASE_URL` configurado.
- Os endpoints relevantes são:
  - `GET /login`
  - `POST /api/v1/auth/login`
  - `GET /dashboard`, `GET /admin/dashboard`
  - `GET /register` (rota pública)
- O login bem-sucedido deve definir o cookie `auth_token` com flags `HttpOnly`, `Secure`, `SameSite=Strict`, `Max-Age=28800`.

## Critérios de Sucesso
- O usuário consegue autenticar com credenciais válidas e acessar `/dashboard`.
- O endpoint de login devolve erro genérico para credenciais inválidas.
- Um usuário sem sessão não pode acessar rotas protegidas e é redirecionado para `/login`.
- Rotas públicas permanecem acessíveis sem autenticação.
- Usuários com soft delete ativo não conseguem se autenticar.

## Cenários de Teste

### 1. Login bem-sucedido com credenciais válidas
**Objetivo:** Verificar que um usuário válido é autenticado e recebe sessão.

**Passos:**
1. Criar ou usar um usuário de teste existente com email e senha válidos.
2. Navegar para `/login`.
3. Preencher o campo `#email` com o e-mail do usuário.
4. Preencher o campo `#password` com a senha correta.
5. Clicar em `Entrar`.
6. Verificar que a página redireciona para `/dashboard` ou rota equivalente.
7. Verificar que o cookie `auth_token` existe no contexto do navegador.
8. Verificar que o cookie possui as flags `HttpOnly`, `Secure`, `SameSite=Strict`.

**Resultado esperado:**
- Redirecionamento para dashboard.
- Sessão autenticada ativa.
- Cookie de sessão definido corretamente.

### 2. Login falha com senha incorreta
**Objetivo:** Assegurar que senha incorreta não permite login.

**Passos:**
1. Navegar para `/login`.
2. Inserir email válido e senha inválida.
3. Submeter o formulário.
4. Verificar que a página permanece em `/login`.
5. Verificar que uma mensagem de erro genérica é exibida.

**Resultado esperado:**
- Login bloqueado.
- Mensagem de erro genérica como `Credenciais inválidas.`.
- Nenhum cookie de sessão é definido.

### 3. Login falha com usuário inexistente
**Objetivo:** Garantir que e-mail não cadastrado retorna erro genérico.

**Passos:**
1. Navegar para `/login`.
2. Inserir um e-mail que não existe e qualquer senha.
3. Submeter o formulário.
4. Verificar mensagem de erro genérica.
5. Verificar que o cookie `auth_token` não é definido.

**Resultado esperado:**
- Login rejeitado com `401 Unauthorized` ou mensagem equivalente.
- Nenhuma sessão criada.

### 4. Login bloqueado para soft-deleted user
**Objetivo:** Confirmar que usuários marcados como excluídos não conseguem entrar.

**Passos:**
1. Ter um usuário de teste com `deletedAt` preenchido no banco.
2. Tentar logar com suas credenciais.
3. Verificar que o login falha com erro genérico.

**Resultado esperado:**
- A autenticação é recusada como se o usuário não existisse.
- Nenhuma sessão é criada.

### 5. Acesso a rota protegida com sessão ativa
**Objetivo:** Validar que sessão válida permite navegar a páginas protegidas.

**Passos:**
1. Autenticar via fluxo de login ou API (`POST /api/v1/auth/login`).
2. Navegar para `/dashboard` ou `/admin/dashboard` conforme papel.
3. Verificar que a página carrega normalmente e não redireciona para `/login`.

**Resultado esperado:**
- Acesso liberado a rotas protegidas.
- Conteúdo de dashboard visível.

### 6. Acesso a rota protegida sem autenticação
**Objetivo:** Confirmar proteção de rotas e redirecionamento para login.

**Passos:**
1. Limpar cookies e garantir sessão vazia.
2. Navegar diretamente para `/dashboard`.
3. Verificar redirecionamento para `/login`.
4. Repetir para `/admin/dashboard`.

**Resultado esperado:**
- Redirecionamento 302 para `/login`.
- Conteúdo protegido não disponível.

### 7. Rotas públicas permanecem acessíveis sem sessão
**Objetivo:** Garantir que páginas públicas não são bloqueadas pela middleware.

**Passos:**
1. Garantir sessão zerada.
2. Navegar para `/register`.
3. Navegar para `/login`.
4. Navegar para `/api/v1/auth/login` via chamada API.

**Resultado esperado:**
- Cada rota pública abre normalmente.
- `/api/v1/auth/login` responde sem exigir autenticação prévia.

### 8. Verificação de flags de segurança do cookie de autenticação
**Objetivo:** Garantir que as políticas de cookie de sessão seguem a especificação.

**Passos:**
1. Realizar login bem-sucedido.
2. Inspecionar os cookies definidos pela aplicação.
3. Confirmar os atributos `HttpOnly`, `Secure`, `SameSite=Strict`, `Max-Age=28800`.

**Resultado esperado:**
- Cookie de sessão seguro e compatível com arquitetura.

### 9. Fluxo de login usando API e contexto Playwright (auxiliar)
**Objetivo:** Permitir testes confiáveis do backend sem depender apenas da UI.

**Passos:**
1. Fazer `POST /api/v1/auth/login` diretamente via `page.request`.
2. Coletar `Set-Cookie` da resposta.
3. Aplicar os cookies ao contexto de navegador.
4. Navegar para rota protegida.

**Resultado esperado:**
- A sessão é restaurada corretamente no browser.
- A rota protegida carrega como em um login UI.

## Observações para implementação
- Caso a integração com Clerk venha a ser efetivamente adicionada, o plano deve ser estendido para cobrir:
  - login via sessão Clerk/SAML/OAuth, se aplicável
  - fluxos de logout e refresh de token
  - tokens JWT públicos do Clerk e validação do `CLERK_JWT_KEY`
- Este plano prioriza o fluxo de autenticação atual da aplicação e o comportamento de middleware descrito no spec de autenticação.

## Recomendações de automação
- Criar fixtures Playwright para:
  - `loginWithApi(page, email, password)`
  - `createTestUser(role)`
  - `clearSession(page)`
- Manter cada cenário independente e iniciar com estado limpo.
- Executar os testes de login antes dos testes de navegação protegida.
