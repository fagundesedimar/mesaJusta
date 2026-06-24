## 1. Dependências e Schema de Banco de Dados

- [x] 1.1 Instalar dependências: `npm install jose bcryptjs zod` e `npm install -D @types/bcryptjs`
- [x] 1.2 Adicionar o enum `Role` (`DONOR`, `ONG`, `ADMIN`) ao `prisma/schema.prisma`
- [x] 1.3 Adicionar o modelo `User` ao schema com campos: `id`, `email`, `passwordHash`, `role`, `deletedAt`, `createdAt`, `updatedAt`
- [x] 1.4 Adicionar o modelo `Profile` ao schema com campos: `id`, `userId`, `name`, `document`, `zipCode`, `state`, `profileType`
- [ ] 1.5 Executar `npx prisma migrate dev --name auth-setup` para aplicar a migração no banco local

## 2. Utilitários de Validação

- [x] 2.1 Criar `src/lib/validators/document.ts` com funções `validateCPF(doc: string): boolean` e `validateCNPJ(doc: string): boolean` (validação de comprimento e caracteres numéricos)
- [x] 2.2 Criar `src/lib/validators/zipcode.ts` com função `validateZipCodeState(cep: string): Promise<'SP' | 'MG' | null>` consultando a API ViaCEP como fallback
- [x] 2.3 Criar schemas Zod em `src/lib/schemas/auth.schema.ts`: `RegisterSchema` e `LoginSchema` com validação de `role`, `document`, `zipCode`, `email` e `password`

## 3. Utilitários de Autenticação (JWT + Bcrypt)

- [x] 3.1 Criar `src/lib/auth/password.ts` com funções `hashPassword(plain: string): Promise<string>` e `verifyPassword(plain: string, hash: string): Promise<boolean>` usando `bcryptjs` (salt = 10)
- [x] 3.2 Criar `src/lib/auth/token.ts` com funções `signToken(payload: TokenPayload): Promise<string>` e `verifyToken(token: string): Promise<TokenPayload | null>` usando `jose` (HS256, TTL 8h)
- [x] 3.3 Criar `src/lib/auth/cookie.ts` com funções `setAuthCookie(response: NextResponse, token: string)` e `clearAuthCookie(response: NextResponse)` configurando flags `HttpOnly; Secure; SameSite=Strict; Max-Age=28800`

## 4. API Route Handlers

- [x] 4.1 Criar `src/app/api/v1/auth/register/route.ts` com handler `POST`: validar payload com `RegisterSchema`, verificar e-mail duplicado (409), validar documento por papel, validar CEP (400), hash senha, criar `User` + `Profile` via Prisma, retornar `201 { id, email, role }`
- [x] 4.2 Criar `src/app/api/v1/auth/login/route.ts` com handler `POST`: validar payload com `LoginSchema`, buscar `User` por email com filtro `deletedAt: null`, comparar senha via `verifyPassword`, em caso de falha retornar `401 "Credenciais inválidas."`, em sucesso emitir JWT via `signToken`, setar cookie via `setAuthCookie`, retornar `200 { id, email, role, name }`
- [x] 4.3 Criar `src/app/api/v1/auth/logout/route.ts` com handler `POST`: chamar `clearAuthCookie` e retornar `200 { message: "Logout realizado." }`

## 5. Next.js Middleware (RBAC)

- [x] 5.1 Criar `src/middleware.ts` com lógica de extração e verificação do cookie `auth_token` via `verifyToken`
- [x] 5.2 Configurar `matcher` no middleware para proteger `/dashboard/:path*`, `/admin/:path*` e `/api/v1/:path*` excluindo `/api/v1/auth/:path*`
- [x] 5.3 Implementar redirecionamento para `/login` (302) quando token ausente ou inválido em rotas protegidas
- [x] 5.4 Implementar retorno `403 Forbidden` quando papel do token é insuficiente para a rota acessada (ex: `DONOR` tentando `/admin/*`)

## 6. Páginas de UI (Auth)

- [x] 6.1 Criar layout `src/app/(auth)/layout.tsx` para agrupar as rotas públicas de autenticação
- [x] 6.2 Criar página `src/app/(auth)/login/page.tsx` com formulário controlado: campos `email` e `password`, validação client-side e chamada ao `POST /api/v1/auth/login`
- [x] 6.3 Criar página `src/app/(auth)/register/page.tsx` com formulário multi-step: campos `name`, `email`, `password`, `role` (seletor), `document` (dinâmico por papel), `zipCode`, com validação CPF/CNPJ em tempo real e feedback de restrição geográfica
- [x] 6.4 Criar componente `src/components/auth/AuthForm.css` com estilos Vanilla CSS para os formulários de login e cadastro

## 7. Testes Unitários

- [x] 7.1 Criar `src/__tests__/unit/validators/document.test.ts` cobrindo CPF válido (11 dígitos), CPF inválido (< 11), CNPJ válido (14 dígitos), CNPJ com letras
- [x] 7.2 Criar `src/__tests__/unit/auth/password.test.ts` cobrindo `hashPassword` gera hash diferente do plain e `verifyPassword` retorna `true`/`false` corretamente
- [x] 7.3 Criar `src/__tests__/unit/auth/token.test.ts` cobrindo `signToken` gera string e `verifyToken` retorna payload correto e `null` para token inválido

## 8. Testes de Integração

- [x] 8.1 Criar `src/__tests__/integration/auth/register.test.ts` cobrindo: cadastro bem-sucedido (201), e-mail duplicado (409), CEP inválido (400), CPF em formato errado (422)
- [x] 8.2 Criar `src/__tests__/integration/auth/login.test.ts` cobrindo: login bem-sucedido com cookie setado (200), senha errada (401), usuário inexistente (401), usuário com soft delete (401)
- [x] 8.3 Criar `src/__tests__/integration/middleware/auth.middleware.test.ts` cobrindo: rota protegida sem token (302 → /login), rota protegida com token válido (pass-through), rota admin com papel DONOR (403), rota pública /login sem token (pass-through)

## 9. Testes E2E (Playwright)

- [x] 9.1 Criar `e2e/auth/register-donor.spec.ts`: fluxo completo de cadastro de Doador com CEP de SP e login subsequente com acesso ao dashboard
- [x] 9.2 Criar `e2e/auth/register-blocked-state.spec.ts`: tentativa de cadastro com CEP de RJ deve exibir mensagem de erro no formulário
- [x] 9.3 Criar `e2e/auth/protected-route.spec.ts`: acesso direto à URL `/dashboard` sem sessão ativa deve redirecionar para `/login`

## 10. Validação Final

- [x] 10.1 Executar `npm run lint` e corrigir todos os erros ESLint reportados
- [x] 10.2 Executar `npm run test:unit` e garantir 100% de passagem nos testes de auth
- [x] 10.3 Executar `npm run test:integration` e garantir 100% de passagem nos testes de integração de auth
- [x] 10.4 Executar `npm run test:e2e` e verificar os três fluxos E2E de autenticação
- [x] 10.5 Verificar manualmente o fluxo de login/logout no browser com DevTools: confirmar flags do cookie (`HttpOnly`, `Secure`, `SameSite=Strict`) e ausência do token em `localStorage`
