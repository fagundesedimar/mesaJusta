# Servidor MCP da Solução — Mesa Justa

Servidor MCP (**Model Context Protocol**) que expõe funcionalidades **da própria solução** para agentes de IA, seguindo o padrão das atividades de MCP (Encontro 4): servidor stdio + JSON-RPC 2.0 via SDK oficial `@modelcontextprotocol/sdk`.

## Funcionalidades expostas (tools)

| Tool | Descrição | Input |
|---|---|---|
| `list_adrs` | Lista o histórico de decisões de arquitetura (`docs/adr/`) | — |
| `read_adr` | Retorna o conteúdo integral de um ADR (`ADR-0001`) | `id` (regex `ADR-\d{4}`) |
| `run_script` | Executa script interno homologado da solução (whitelist) | `script` ∈ `test-db` \| `sonar` |

### Scripts internos expostos (whitelist)
- `test-db` → `scripts/test-db.mjs` (diagnóstico de conexão com o banco via Prisma `user.findMany`).
- `sonar` → `scripts/sonar.js` (análise estática SonarQube).

A whitelist impede execução arbitrária de comandos a partir do agente.

## Como executar

```bash
# Standalone (modo stdio, interage por JSON-RPC em stdin/stdout)
npm run mcp

# Ou diretamente
node server/index.mjs
```

> Em desenvolvimento, o servidor é registrado automaticamente no opencode via `opencode.json` → `mcp["mesa-justa"]` (comando `node server/index.mjs`).

## Protocolo (padrão MCP / Encontro 4)

O servidor usa transporte `stdio` com mensagens JSON-RPC 2.0 (uma por linha). Exemplos:

**1. Inicialização (handshake)**
```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}
```

**2. Listar tools**
```json
{"jsonrpc":"2.0","id":2,"method":"tools/list"}
```

**3. Chamar tool `read_adr`**
```json
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"read_adr","arguments":{"id":"ADR-0002"}}}
```

## Implementação

- `server/index.mjs` — servidor MCP (registro das tools + transporte stdio).
- Dependência: `@modelcontextprotocol/sdk` (devDependency) + `zod` (schemas de input já presentes no projeto).

## Validação

- Registro no `opencode.json` (`mcp["mesa-justa"]`) com `enabled: true`.
- Smoke test via stdio: enviar `initialize` e `tools/list` por linha única em `stdin` (ver resultado na seção de testes/execução do projeto).