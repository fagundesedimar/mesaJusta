# Unidade 1 — Definição do Problema e Escolha Justificada do LLM

> Documento de apoio acadêmico: justifica **por que** o modelo de linguagem escolhido é adequado ao caso de uso do **Mesa Justa: Circuito Solidário**, considerando custo, latência e limite de contexto.

---

## 1. Definição do Problema (o que a IA faz neste projeto)

O Mesa Justa é uma plataforma **full-stack** (Next.js App Router + React, PostgreSQL/PostGIS, Prisma, Electron). Durante o desenvolvimento, LLMs são usados de forma **agentic** via opencode para:

- **Geração de código e especificações**: criação de funcionalidades completas guiadas por specs (`spec-driven development`), com comandos `/opsx:propose`, `/opsx:apply` e `/opsx:archive` (workflow OpenSpec).
- **Refatoração assistida**: extração de lógica pura (`src/lib/...`), correção de bugs e ajuste de testes.
- **Documentação automatizada**: README, specs (`docs/`) e registros de decisão (`docs/adr/`).
- **Testes E2E**: planejamento e geração de cenários Playwright via agentes subrogados (`playwright-test-*`).
- **Busca de documentação atualizada**: via MCP Context7 (evita conhecimento defasado de APIs).

### Três casos de uso com perfis de exigência distintos

| Caso de uso | Determinante principal | Exigência |
|---|---|---|
| 1. Redação de specs/PRD/README | **Limite de contexto** (lê múltiplos arquivos: `docs/`, `openspec/`, README) | Contexto longo; precisão em português |
| 2. Geração/refatoração de código | **Custo-benefício** (muitas iterações de agentic coding) | Bom equilíbrio qualidade-preço; respostas longas (muitos arquivos por mudança) |
| 3. Geração de testes/validação | **Latência + determinismo** (ciclos rápidos de `npm run test:*`) | Baixa latência entre tentativa-correção |

---

## 2. Modelo Utilizado

- **Modelo principal (agentic coding)**: `opencode/big-pickle` — LLM executado pelo cliente opencode no fluxo interactive de commit-a-commit do repositório.
- **Modelos subrogados (sub-agentes)**: agentes dedicados do opencode para geração e healer de testes Playwright (ver `opencode.json` → `agent.*`).
- **Ferramentas de apoio (não-LLM)**: MCP Context7 (docs de bibliotecas), MCP Stitch (prototipagem UI) e MCP SonarQube (qualidade).

> **Convenção de valores**: os valores numéricos de tabela de preços e benchmarks de latência devem ser conferidos na folha de preços oficial e em benchmarks públicos do provedor **na data de entrega deste documento**, pois variam mensalmente. As colunas marcadas com `[verificar]` são a linha de raciocínio que o autor deve parametrizar com o número atual.

---

## 3. Critérios de Escolha

### 3.1 Custo

O custo é o critério mais sensível neste projeto porque o trabalho é **intensivo em iterações**: cada feature OpenSpec passa por propose → apply → archive e cada bug exige vários ciclos de leitura-edição-teste.

| Aspecto | Impacto no projeto |
|---|---|
| Volume de tokens de entrada | Alto: leitura de `AGENTS.md` (~3 KB) + specs + arquivos do diff a cada ação |
| Volume de tokens de saída | Alto: código e especificações longas em português |
| Estratégia de redução | Sub-agentes pequenos para tarefas triviais (Playwright); modelo principal apenas para tarefas complexas |

### 3.2 Latência

Os requisitos não funcionais do produto exigem resposta de API em **< 200 ms p95** (`docs/spec_req.md` — RNF-01). Esse requisito é **do produto**, mas o da ferramenta de IA é o ciclo de feedback: cada `npm run test:*` ou `npm run build` é um retorno para o LLM. Modelos pesados (raciocínio profundo) adicionam >10 s por chamada; modelos leves respondem em poucos segundos — adequado ao *loop* tentativa→teste→correção.

### 3.3 Limite de Contexto

O caso de uso exige a leitura simultânea de:

- `AGENTS.md` (regras do agente, histórico de evolução de regras);
- documento(s) de spec ativo (`docs/spec_*.md`, `openspec/changes/*/design.md`);
- diversos módulos de código inter-relacionados (`src/lib/`, `src/app/api/...`, `prisma/schema.prisma`).

Estimativa típica de carga por sessão no Mesa Justa: **20–60 mil tokens por interação** (sem grandes arquivos binários). O modelo precisa de contexto efetivo **≥ 100k tokens** para acomodar a sessão inteira sem perder o fio da meada entre uma requisição e outra.

---

## 4. Justificativa da Escolha

1. **Limite de contexto suficiente**: o caso de uso (spec-driven, múltiplos arquivos) precisa de janela ≥ 100k tokens — atendida pelo modelo escolhido, sem truncamento das specs de maior tamanho (`docs/spec_req.md`, `openspec` archive).
2. **Custo compatível com o volume de iterações**: o balanceamento entrada/saída do modelo escolhido permite dezenas de ciclos de refatoração dentro do orçamento de um projeto acadêmico/piloto. Modelos de fronteira seriam desnecessariamente caros no cenário 2 (muitas iterações de código) e no cenário 3 (testes).
3. **Latência adequada ao loop de feedback**: resposta em poucos segundos sustenta o fluxo `testar → corrigir → retestar` sem tédio operacional; latência excessiva de multi-segundos adicionais não traz ganho proporcional de qualidade para a geração de código padrão (CRUD/Dashboard).
4. **Qualidade de código/texto em português técnico**: builds, lint e testes bem formados com retrabalho pequeno (evidenciado nos commits `Opsx-apply *` e nos ajustes `aee3f70`, `92b4098`).
5. **Integração com o fluxo agentic**: o modelo é orquestrado pelo opencode com sub-agentes especializados (Playwright e testes), reduzindo custo por tarefa e mantendo o contexto principal limpo — só o contexto relevante é carregado.

---

## 5. Alternativas Consideradas (Trade-offs)

| Alternativa | Prós | Contras | Veredito |
|---|---|---|---|
| Modelo de fronteira "premium" (p.ex., classe de topo com raciocínio profundo) | Qualidade máxima em problemas difíceis | Custo/iteração alto; latência alta nos ciclos de teste; contexto similar | Rejeitado para o volume de iterações do piloto |
| Modelo leve (classe econômica) | Custo mínimo, latência baixa | Erros frequentes em queries espaciais/Prisma; retrabalho cresce; violência com specs longas | Rejeitado: qualidade mínima não atende PostGIS/`$queryRaw` |
| **Modelo intermediário escolhido** (`opencode/big-pickle`) | Equilíbrio custo × latência × contexto; bom em TS/Prisma/Next | Não é o estado-da-arte em edge cases | **Aceito** |
| Não usar LLM (desenvolvimento manual) | Zero custo de LLM | Tempo de entrega incompatível com a carga de documentação e oito funcionalidades | Rejeitado |

---

## 6. Riscos, Limitações e Mitigações

| Risco | Mitigação |
|---|---|
| Números de preço/latência desatualizados na entrega | Conferir folha de preços oficial e benchmark público na data de fechamento do documento |
| Alucinação em APIs pouco conhecidas | Uso obrigatório do MCP **Context7** para consultar documentação vigente (regra do AGENTS.md) |
| Deriva de contexto em sessões longas | Sessões abertas por funcionalidade; specs arquivadas por mudança (`openspec/changes/archive/`) |
| Dependência de fornecedor de LLM | Código/dados são agnósticos de modelo; Model Context Protocol constitui camada de abstração |

---

## 7. Evidências no Repositório

- Fluxo spec-driven com commits `Opsx-apply`: `bc84959`, `6ea4f9d`, `1294dbf`, `de6c080`, `0f0b549`, `5f73d7f` e `5ec474b`.
- Refatorações com validação por teste: `aee3f70` (`src/lib/reservation/token.ts` + testes), `92b4098` (`src/lib/prisma.ts` + testes de auth).
- Doc automatizada: `README.md`, `docs/adr/ADR-0001.md` e `ADR-0002.md`.
- Configuração de agentes e prompts de teste: `opencode.json`, `.opencode/prompts/`.
- Registro consolidado de prompts: `docs/registro-prompts.md`.