# Segurança do Código Gerado por IA, Política de Revisão Humana e Arquitetura GenAI

> Inventário verificado no código-fonte do **Mesa Justa** (15/09/2026). Todo item cita `arquivo:linha` como evidência. Refere-se aos três elementos cobrados nas entregas acadêmicas: análise de segurança do código gerado por IA, política de revisão humana e justificativa da arquitetura GenAI.

---

## 1. Análise de segurança do código gerado por IA

### 1.1 Riscos identificados e tratamento

| # | Risco identificado | Evidência no código | Como foi tratado |
|---|---|---|---|
| S1 | **Segredos expostos (chaves de API)** | `.env` local com credenciais reais; template em `.env.example` | `.env` gitignorado (`.gitignore:23-27`); `.env.example` com apenas placeholders (`[CONTEXT7_API_KEY]`, `change-me-...`) e instrução de geração de chave JWT via `openssl` (`.env.example:38-40`); regra testável no AGENTS.md ("nunca comite .env com chaves reais"); `.env` nunca aparece em `git status` |
| S2 | **Dependências sugeridas incorretamente (cadeia de suprimentos)** | `npm audit` → 29 vulns (17 high, 2 critical) em dependências transitivas de tooling | Auditado e documentado neste arquivo. Causas: `brace-expansion` (plugin de bundle do Sentry), `browserslist`, `prisma→@prisma/dev→@hono/node-server` (path traversal `serveStatic`, CVE via advisory GHSA). Correção existe mas exige downgrade breaking (`prisma@6.x`) → **risco residual assumido** |
| S3 | **Versionamento divergente de dependências** | `package.json` usa React 18 com `@types/react@19` (pacotes de tipos gerados por IA) | Detecção via `npm audit`/build; compensado por tipagem forte e testes; ajuste pendente de alinhar versões de tipos |
| S4 | **SQL injection (A03)** | Único SQL cru com PostGIS em `src/app/api/v1/donations/route.ts:109-133` | Query usa **parâmetros ligados** do Prisma (`${lng}`, `${lat}`, `${radius*1000}`) — sem concatenação; inputs validados com `zod` e checagem `isNaN→422` |
| S5 | **Quebra de controle de acesso (A01)** | Rotas `/dashboard`, `/admin`, `/ong`, `/api/v1/*` | RBAC centralizado em `src/middleware.ts` (`ROLE_LEVELS:13-17`, checagens `403`/`401` em `39-67`) + checagem de papel por rota de API (ex.: `donations/route.ts:90`) |
| S6 | **Falhas de autenticação (A07)** | Login em `src/app/api/v1/auth/login/route.ts` | `bcryptjs` para hash/compare (`src/lib/auth/password.ts`); JWT via `jose`; cookies `httpOnly + secure + sameSite:lax` (`src/lib/auth/cookie.ts:8-26`); mensagem única "Credenciais inválidas." evita enumeração de usuário (linhas `27-40`) |
| S7 | **Falta de logging/monitoramento (A09)** | Mudanças de status de doação | `auditLog.create` obrigatório dentro de transações (`reservations/route.ts:140`, `confirm/route.ts:79`, `cancel/route.ts:63`, `donations/[id]/status/route.ts:73`); Sentry integrado para erros de runtime |
| S8 | **XSS (A03)** | `src/components/ong/DonationMap.tsx` interpola dados do doador em popup | **Tratado em 15/09/2026**: helper `escapeHtml` escapa `name`, `category` e `id` (entidades HTML) aplicado ao conteúdo do popup; seletor do botão por `dataset.id` (sem concatenação de HTML); teste anti-XSS em `DonationMap.test.tsx` |
| S9 | **Falta de rate limiting (A04)** | Endpoint de login sem throttling | **Tratado em 15/09/2026**: `src/lib/auth/rate-limit.ts` aplica janela fixa de 15 min (`EMAIL_MAX_ATTEMPTS=10`, `IP_MAX_ATTEMPTS=30`); Redis quando `REDIS_URL` configurado, fallback em memória (fail-open se indisponível); integrado em `login/route.ts` com `Retry-After` e `429`; testes em `rate-limit.test.ts` |
| S10 | **TLS relaxado** | `NODE_TLS_REJECT_UNAUTHORIZED=0` apenas no script `dev` (`package.json:10`) | Risco aceito e delimitado ao ambiente local (integração com TLS self-signed de dev); produção não usa esse env |

### 1.2 OWASP Top 10 — cobertura atual

| Categoria OWASP | Status |
|---|---|
| A01 Controle de acesso | Cobrido (middleware + RBAC por papel) |
| A02 Falhas criptográficas | Cobrido (bcryptjs + jose + cookies seguros) |
| A03 Injection | Coberto (SQL/inputs via parâmetros ligados e zod; **XSS do popup corrigido** — escape + teste anti-XSS) |
| A04 Design inseguro | Coberto após **rate limit de login implementado** (Redis/memória, 429 + `Retry-After`) |
| A09 Registro e monitoramento | Cobrido (AuditLog + Sentry) |
| A10 SSRF | Não avaliado explicitamente (renderização server-side é própria) |

---

## 2. Política de revisão humana aplicada ao longo do projeto

Mecanismos versionados de revisão **obrigatória** de sugestões da IA:

| Mecanismo | Evidência | O que exige revisão humana obrigatória | Por quê |
|---|---|---|---|
| Regras do agente (AGENTS.md) | `AGENTS.md` seções 1 e 5 | Comandos **destrutivos** (`git clean`, reset de banco, exclusão de pastas) — confirmação explícita no chat; **ambiguidade** de requisito — parar e perguntar | Erro destrutivo é irreversível; requisito mal-entendido gera retrabalho e código que mascara intenção |
| Auditoria de status (AGENTS.md, regra de segurança) | `AGENTS.md` §4 + `auditLog.create` nas rotas | Qualquer mudança de status de doação | Rastreabilidade é requisito negocial/regulatório do produto (ADR-0001) |
| Workflow OpenSpec | `openspec/changes/` (propose → apply → archive) | Toda mudança gera `design.md` aprovado **antes** da implementação | Sugestão de IA só é aceita após o design ser revisado/aceito; impede "agente avulso" alterando escopo |
| Skill de revisão de código | `.agents/skills/code-review-and-quality/` | Gate multi-eixo pré-merge | Qualidade (arquitetura, testes, dependências, segurança) antes de entrar na branch principal |
| Revisão de testes gerados por IA | `docs/testes-execucao.md` §4 | Os 2 testes que só validavam *shape* foram detectados, reescritos (comportamento real) e revalidados | Teste fraco dá falsa sensação de cobertura; comportamento correto só é validado exercitando o fluxo real |
| Rastreabilidade prompt→código | `docs/registro-prompts.md` | Mapeamento funcionalidade → spec → prompt → commit | Permite auditar o que a IA propôs e onde foi aceito/rejeitado |
| Lições de produção aplicadas | `AGENTS.md` seções V1.2 e V1.3 | Corrigir erros reais de auth/middleware em produção antes de aceitar novas sugestões de infra | Bugs de deploy (pooler IPv6/`sslmode`) e de cache de middleware provaram que sugestões de infra precisam de revisão humana |

**Resumo**: a revisão humana é obrigatória em ao menos 3 frentes — **segurança/auth** (maior incidência de erro real registrada), **comandos destrutivos** (irreversíveis) e **mudanças de estado negociais** (auditoria).

---

## 3. Justificativa da arquitetura GenAI da solução

Fato verificado no código: o **runtime não consome nenhuma API de IA** (busca por `openai|anthropic|gemini|vertex|bedrock|llm` no código = 0 ocorrências). Toda a GenAI está no **processo de desenvolvimento** (opencode + modelo + skills MCP/OpenSpec/context7).

### Enquadramento: AI-as-a-Commodity (o que existe hoje)

- LLM tratado como **commodity** embutido na ferramenta de desenvolvimento (opencode), sem modelos próprios, sem agentes em produção.
- **Custo**: ~fixo por uso de desenvolvimento; sem tokens consumidos em runtime.
- **Latência**: irrelevante — assistência ao dev, não resposta ao usuário.
- **Controle**: via AGENTS.md (regras), `.agents/skills`, workflows OpenSpec e Git (histórico de sugestões aceitas).
- Artefato de apoio: `docs/unidade1-modelo-llm.md` justifica a escolha do modelo com trade-offs de custo, latência e contexto.

### AI-as-a-Service (cenário futuro, não presente)

- Aplicar-se-ia se o produto consumisse IA por API paga em runtime (ex.: categorização automática de doações, moderação/saneamento de textos).
- **Trade-offs**: custo proporcional ao volume de tokens; latência p95 impactaria o RNF-01 (<200 ms) se no caminho crítico; controle de dados pessoais (LGPD) via APIs de terceiros exige revisão de compliance.

### AI Gateway (não justificado hoje)

- Um gateway central (roteamento multi-provedor, fallback, cache de prompts, orçamento, observabilidade) **só compensa** quando há múltiplos provedores e tráfego real em produção.
- Para o uso dev-only atual seria over-engineering — mesmo argumento do `ADR-0001` (evitar complexidade no piloto; separação é refatoração futura viável).

### Conclusão

A arquitetura GenAI atual da solução é **AI-as-a-Commodity**, com custo, latência e controle documentados. AI-as-a-Service e AI Gateway são evoluções possíveis — o ponto de decisão é o dia em que o **produto em runtime** precisar de IA; aí o gateway passa a ser avaliado com base em volume, custo por token e latência.

---

## 4. Riscos residuais registrados (pendências de tratamento)

- S2 — Vulnerabilidades transitivas de tooling: reavaliar `npm audit fix` quando houver versão estável compatível (correção atual exige breaking em `prisma@6.x`).
- S3 — Alinhar tipos (`@types/react`) à versão real do React.
- S10 — TLS relaxado é dev-only por design (produção não usa); revisar antes de subir Desktop para uso real.
- Nota: no rate limit, o fallback em memória é por-processo — em Vercel multi-lambda, a proteção consolidada exige `REDIS_URL` configurado (integrado e testado).