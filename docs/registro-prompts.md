# Registro de Prompts e Planos de IA — Mesa Justa: Circuito Solidário

Este documento consolida os **prompts, planos e specs usados com apoio de IA generativa** no projeto, atendendo ao requisito de *registrar a spec/plano e os prompts usados* para cada funcionalidade construída com abordagem **spec-driven / agentic coding**.

---

## 1. Abordagem geral: spec-driven (OpenSpec)

Todas as funcionalidades do MVP foram especificadas antes da implementação usando o workflow **OpenSpec** do opencode:

```
/opsx:propose  → gera proposal.md + design.md + spec.md + tasks.md
/opsx:apply    → implementa os tasks com apoio do LLM
/opsx:archive  → movimenta a mudança para openspec/changes/archive/
/opsx:sync     → promove specs delta para openspec/specs/
```

- **Skills/workflows que definem os prompts de cada etapa**: `.agents/skills/openspec-{propose,apply,archive,sync,explore}/SKILL.md` e `.agents/workflows/opsx-*.md`.
- **Estrutura resultante**: `openspec/specs/*` (specs consolidadas) e `openspec/changes/archive/*` (artefatos por mudança).

## 2. Matriz Funcionalidade → Plano/Spec → Prompt registrado → Evidência

| Funcionalidade (mudança) | Plano/Spec (artefato) | Prompt/plan registrado | Evidência de implementação |
|---|---|---|---|
| Autenticação e perfis RBAC | `openspec/changes/archive/2026-06-25-auth-setup/{proposal,design,spec,tasks}.md` | Workers/SKILLs OpenSpec (`/opsx:propose`) | commit `bc84959`; `src/app/api/v1/auth/*`, `src/lib/auth/*` |
| Cadastro de lotes de doação | `openspec/changes/archive/2026-06-23-donor-donations/*` | idem | commit `6ea4f9d`; `src/app/api/v1/donations/route.ts` |
| Busca por proximidade + mapa (Leaflet/PostGIS) | `openspec/changes/archive/2026-06-25-geo-matching-map/*` | idem + decisions D1-D4 | commit `1294dbf`; `src/components/ong/DonationMap.tsx` |
| Reserva exclusiva + token de retirada | `openspec/changes/archive/2026-06-25-reservation-token/*` | idem + decisions D1-D4 | commit `de6c080`; `src/lib/reservation/token.ts` |
| Retirada e Log de Auditoria | `openspec/changes/archive/2026-06-24-collection-audit/*` | idem | commit `5ec474b`; `src/app/api/v1/donations/[id]/status/route.ts` |
| Gamificação Moeda Verde/ESG | `openspec/changes/archive/2026-06-25-gamification-esg/*` | idem | commit `0f0b549`; `src/lib/gamification/formulas.ts` |
| Painel administrativo + relatório ESG | `openspec/changes/archive/2026-06-25-admin-dashboard/*` | idem | commit `5f73d7f`; `src/app/api/v1/admin/*` |
| Wrapper Desktop Electron | `openspec/changes/archive/2026-06-25-electron-wrapper/*` | idem | `electron/*`, `electron-builder.yml` |

## 3. Prompts de prototipagem de UI (Google Stitch)

- `docs/prompt_ux_stitch.md` — prompt estruturado (papel de Designer de UX Sênior) usado em ferramentas de geração de protótipo (Google Stitch / v0.dev). Define tokens de design, telas e fluxos (Glassmorphism, Vanilla CSS).
- Screens importadas do Stitch são referenciadas em `roadmap.md` (mapeamento tela → mudança).

## 4. Prompts de geração/healing de testes E2E (Playwright)

| Agente | Prompt registrado |
|---|---|
| `playwright-test-planner` | `.opencode/prompts/playwright-test-planner.md` |
| `playwright-test-generator` | `.opencode/prompts/playwright-test-generator.md` |
| `playwright-test-healer` | `.opencode/prompts/playwright-test-healer.md` |

Configuração dos agentes (incluindo os tools MCP liberados): `opencode.json` → `agent.*`.

## 5. Prompt de governança do agente (contexto persistente)

- `AGENTS.md` — conjunto de instruções de comportamento e regras do agente para todo trabalho no repositório (não é um prompt de uma funcionalidade específica, mas o *system prompt* efetivo usado em todas as sessões).

## 6. Limitações e mitigação

- **Limitação**: prompts livres digitados no chat de cada sessão não ficam versionados no git (apenas os prompts estruturados em arquivo).
- **Mitigação aplicada**: (a) todo fluxo produtivo passou por prompts estruturados (OpenSpec/agentes Playwright) versionados em arquivo; (b) os artefatos de *design* e *tasks* capturam o raciocínio derivado dos prompts; (c) este documento centraliza o mapeamento prompt → artefato → commit.