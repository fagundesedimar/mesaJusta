## Context

O Mesa Justa não possui nenhuma camada de autenticação implementada. Todas as rotas e funcionalidades estão atualmente acessíveis sem qualquer controle de identidade, o que inviabiliza o processamento de dados pessoais (LGPD), a proteção de coordenadas geográficas de ONGs e a segregação de fluxos entre Doadores, ONGs e Administradores.

A implementação de autenticação é o pré-requisito bloqueante para todos os demais módulos funcionais (Doações, Reservas, Gamificação, Dashboard Admin). Esta mudança estabelece a fundação de segurança do sistema sobre a stack já definida: Next.js App Router, Prisma ORM, PostgreSQL e cookies HttpOnly.

**Stakeholders:** Doadores (CPF), ONGs (CNPJ), Administradores (email interno), equipe de desenvolvimento.

---

## Goals / Non-Goals

**Goals:**
- Criar modelos `User` e `Profile` no Prisma com suporte a exclusão lógica (campo `deletedAt`)
- Implementar endpoints `POST /api/v1/auth/register` e `POST /api/v1/auth/login` com validação Zod
- Validar CPF (11 dígitos), CNPJ (14 dígitos) e CEP restrito aos estados SP e MG no cadastro
- Emitir tokens JWT (`jose`) armazenados em cookies `HttpOnly`, `Secure`, `SameSite=Strict` com TTL de 8h
- Implementar Next.js Middleware para interceptar rotas protegidas e validar o token JWT via edge runtime
- Estabelecer RBAC com três papéis (`DONOR`, `ONG`, `ADMIN`) para segregação de acesso por rota
- Fazer hash de senhas com `bcryptjs` (salt rounds = 10)

**Non-Goals:**
- Login social (OAuth, Google, Facebook) — fora do escopo do MVP
- Autenticação multi-fator (MFA) — previsto para versão futura
- Reset de senha por e-mail — requisito separado, sem dependência de infra de e-mail neste change
- Gerenciamento de sessões concorrentes / revogação de tokens em Redis — deferido para auth v2
- Verificação algorítmica completa de dígito verificador de CPF/CNPJ — validação de formato/comprimento apenas no MVP

---

## Decisions

### D1: JWT com `jose` em Edge Runtime vs. NextAuth.js

**Decisão:** Implementar JWT manualmente com a biblioteca `jose` (Web Crypto API compatível com Edge Runtime).

**Rationale:** NextAuth.js adiciona acoplamento a provedores OAuth e complexidade de configuração desnecessária para um MVP com apenas login por email/senha. A biblioteca `jose` é nativa do Edge, leve e permite controle total sobre o payload e as claims do token. O `jsonwebtoken` (alternativa) usa APIs Node.js e não roda no Edge Runtime do Next.js Middleware, o que seria um bloqueio técnico para a interceptação de rotas.

**Alternativa descartada:** `jsonwebtoken` — incompatível com Edge Runtime; NextAuth — superdimensionado para o escopo.

---

### D2: Armazenamento do JWT em Cookie HttpOnly vs. localStorage

**Decisão:** Armazenar o JWT exclusivamente em cookie `HttpOnly; Secure; SameSite=Strict`.

**Rationale:** Cookies HttpOnly são inacessíveis ao JavaScript do lado do cliente, eliminando o vetor de ataque XSS para roubo de token. Isso é mandatório pela política de segurança definida no `openspec/config.yaml` (`jwt.storage: HttpOnly Cookies`) e pela conformidade com LGPD para dados de usuários cadastrados. localStorage seria vulnerável a ataques XSS e não é adequado para dados de autenticação sensíveis.

**Alternativa descartada:** `localStorage` — vulnerável a XSS; `sessionStorage` — não persiste entre abas, UX degradado.

---

### D3: Validação de Requisições com Zod vs. Validação Manual

**Decisão:** Usar Zod para validação de payloads nos endpoints de auth.

**Rationale:** Zod fornece tipagem estática TypeScript e runtime validation em conjunto, evitando o tipo `any` (regra do AGENTS.md: `no_any: true`). Permite definir schemas de validação declarativos para CPF, CNPJ e CEP com mensagens de erro estruturadas e reutilizáveis em testes de integração.

---

### D4: Middleware de Autorização no Edge vs. em cada Route Handler

**Decisão:** Implementar proteção de rotas no `src/middleware.ts` via Next.js Edge Middleware.

**Rationale:** Centralizar a lógica de autenticação no Middleware evita duplicação de código em cada Route Handler e garante que *nenhuma* rota protegida seja acessível antes da validação do token, mesmo que um handler seja adicionado no futuro sem verificação manual. O Edge Middleware executa antes de qualquer Server Component ou Route Handler, reduzindo latência e evitando vazamento de dados.

**Alternativa descartada:** Verificação por HOC em cada página — propenso a omissões; verificação em cada Route Handler — verboso e sujeito a erros humanos.

---

### D5: Soft Delete no modelo `User`

**Decisão:** Adicionar campo `deletedAt DateTime?` ao modelo `User` para exclusão lógica.

**Rationale:** Dados de usuários vinculados a doações e logs de auditoria não devem ser apagados fisicamente, pois comprometem a rastreabilidade de transações (requisito de auditoria do `openspec/config.yaml`). Soft Delete preserva a integridade referencial no banco e permite reativação de conta administrativa futura.

---

## Risks / Trade-offs

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Brechas no Middleware (rota não mapeada no `matcher`) | Média | Alto | Revisar o `matcher` config via testes de integração cobrindo todas as rotas protegidas com token ausente, expirado e inválido |
| Token JWT expirado sem fluxo de refresh | Baixa | Médio | TTL de 8h é adequado para sessão de trabalho; refresh token deferido para auth v2 — usuário será redirecionado ao login |
| Validação de CEP por estado falhar para CEPs atípicos | Baixa | Baixo | Consulta à API ViaCEP como fallback para confirmar o estado quando o prefixo do CEP for ambíguo |
| Vazamento de informação via mensagens de erro distintas para "usuário não encontrado" vs. "senha incorreta" | Alta | Médio | Retornar sempre `401 Credenciais inválidas` genérico, sem diferenciar causa do erro |
| Desempenho do `bcryptjs` com salt rounds = 10 em ambiente Electron | Baixa | Baixo | Salt 10 resulta em ~100ms de hash em hardware moderno; aceitável para auth. Aumentar para 12 apenas se migrar para servidor dedicado |

---

## Migration Plan

1. **Prisma Schema**: Adicionar modelos `User`, `Profile` e enum `Role` ao `prisma/schema.prisma`
2. **Migração**: Executar `npx prisma migrate dev --name auth-setup` para criar as tabelas no banco local
3. **Dependências**: Instalar `jose`, `bcryptjs`, `zod` e `@types/bcryptjs`
4. **API Routes**: Criar `src/app/api/v1/auth/register/route.ts` e `src/app/api/v1/auth/login/route.ts`
5. **Middleware**: Criar `src/middleware.ts` com lógica de verificação JWT e config de `matcher`
6. **UI**: Criar páginas `src/app/(auth)/login/page.tsx` e `src/app/(auth)/register/page.tsx` com formulários validados
7. **Rollback**: Em caso de falha, reverter migração com `npx prisma migrate reset` e remover arquivos de rota; não há dados de produção nesta fase inicial
