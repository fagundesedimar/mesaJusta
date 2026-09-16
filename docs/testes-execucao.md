# Registro de Execução Real — Suíte de Testes Automatizados

> Resultado real de execução das suítes de teste do **Mesa Justa**, registrado conforme requisito de *"resultado real da execução registrado"*.

---

## 1. Suíte de Testes Unitários (Vitest)

- **Comando executado**: `npm run test:unit` (→ `vitest run src/__tests__/unit/`)
- **Data/hora**: 15/09/2026, 21:27 (BRT)
- **Ambiente**: Windows (PowerShell 5.1), Node via npm, Vitest `v4.1.9`; globalSetup inicializou o Next.js dev server (`Ready in 2.8s`).
- **Resultado**: ✔ (13/13 arquivos, 73/73 testes)

```
 Test Files  13 passed (13)
      Tests  73 passed (73)
   Start at  21:27:26
   Duration  11.67s (transform 2.00s, setup 828ms, import 3.42s, tests 1.35s, environment 5.56s)
```

> Nota operacional: após o término, o runner emitiu `close timed out after 10000ms` porque um handle do Vite (dev server do globalSetup) impede a saída do processo. **Não afeta o resultado**: "Tests closed successfully". Por isso, entre runs, o processo `next start-server` órfão na porta 3000 deve ser encerrado antes de nova execução da suíte.

### Histórico de execuções da suíte unitária

| Data/hora | Resultado | Observação |
|---|---|---|
| 15/09/2026 20:21 | 12 arquivos / **63 testes** PASS | Suíte original (antes do fortalecimento) |
| 15/09/2026 20:51 | 12 arquivos / **61 testes** PASS | `DonationMap.test.tsx` fortalecido (3 testes); `lifecycle.test.ts` ainda falhava (mock não interceptava `require('electron')`) |
| 15/09/2026 20:59 | 12 arquivos / **66 testes** PASS | `lifecycle.test.ts` corrigido executando o `main.js` real com `require` mockado (+5 testes) |
| 15/09/2026 21:27 | 13 arquivos / **73 testes** PASS | Correção dos gaps de segurança: rate limit de login (`rate-limit.test.ts`, +6 testes) e escape anti-XSS no popup (`DonationMap.test.tsx`, +1 teste) |

## 2. Suíte de Testes E2E (Playwright)

- **Artefato registrado**: `playwright-report/index.html` presente no repositório (execução anterior de Playwright).
- **Specs E2E versionadas**: `e2e/**` (auth, donations, reservation-token, geo-matching-map, gamification, admin, electron, collection).

## 3. Cobertura das suítes por camada

| Camada | Cobertura principal | Status |
|---|---|---|
| Unit (Vitest) | Helpers/regras puras: `gamification`, `reservation/token`, `geo/nominatim`, `auth`, `esg`, validators, componentes (com mock de `leaflet`), ciclo de vida do Electron (módulo real) e rate limit de login | ✔ 73/73 |
| Contrato (Pact) | `src/__tests__/contract/donations-api.pact.test.ts` (mock server Pact) | Configurado |
| Integração (Vitest + Next dev + Postgres) | Reservas, auth, donations espaciais, admin, gamificação | Configurado (`npm run test:integration`) |
| E2E (Playwright) | Jornadas completas em `e2e/**` | Execução registrada em `playwright-report/` |

## 4. Testes com mock/fixture (evidências de comportamento validado)

- **`src/__tests__/unit/geo/nominatim.test.ts`** — mocka `globalThis.fetch` (via `vi.spyOn`) e valida **comportamento correto** também nos casos de erro (falha de rede, endereço não encontrado, HTTP 429/rate-limit → `null`).
- **`src/__tests__/unit/components/DonationMap.test.tsx`** — mock de `leaflet` com `vi.hoisted`; valida o **comportamento real** do componente: criação do mapa centrado na sede com zoom 13 e tiles OSM, um marcador por doação com popup detalhado (categoria, peso, distância), disparo de `onReserve(id)` no clique em "Reservar Lote", remoção do mapa/marcadores no unmount e **escape anti-XSS** do conteúdo do doador no popup.
- **`src/__tests__/unit/auth/rate-limit.test.ts`** — valida o **rate limit de login** (store em memória com `REDIS_URL` vazio): permite abaixo do limite, bloqueia após `EMAIL_MAX_ATTEMPTS`, libera após a janela de 15 min, independência por IP e reset no login bem-sucedido.
- **`src/__tests__/unit/electron/lifecycle.test.ts`** — executa o **`electron/main.js` real** dentro de um wrapper CommonJS com `require('electron')` mockado; valida: registro dos handlers de ciclo de vida, `webPreferences` seguros (nodeIntegration/contextIsolation/webSecurity) e preload correto, injeção de CSP restritiva (`connect-src https://api.mesajusta.com.br`) no fluxo não-dev, não abertura de DevTools em produção e chamada a `app.quit()` em `window-all-closed` (fora do macOS).
- **`src/__tests__/contract/donations-api.pact.test.ts`** — mock server Pact (contrato consumidor-provedor).

## 5. Smoke test do Servidor MCP da Solução

- **Artefato executado**: `node server/index.mjs` (via `npm run mcp`).
- **Protocolo**: JSON-RPC 2.0 sobre stdio (handshake `initialize` + `tools/list`).
- **Resultado**: servidor responde ao `initialize` e publica as tools da solução (`list_adrs`, `read_adr`, `run_script`) — ver `docs/mcp-servidor.md`.

## 6. Resultado consolidado

- Suíte unitária executada e registrada: **PASS (73/73)** — inclui os 2 testes antes considerados fracos (comportamento real do Electron e do mapa) e os testes dos gaps de segurança corrigidos (rate limit + anti-XSS).
- Suite E2E com relatório gerado em `playwright-report/`.
- Servidor MCP da solução criado e smoke testado (register em `opencode.json` + script `npm run mcp`), documentado em `docs/mcp-servidor.md`.