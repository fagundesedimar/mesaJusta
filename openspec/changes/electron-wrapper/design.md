## Context

O Mesa Justa é desenvolvido como uma aplicação web Next.js, mas seu público-alvo primário são operadores de estabelecimentos comerciais que trabalham em Windows (caixas, expedições, sistemas de ponto de venda). O Electron wrapper encapsula a aplicação dentro de uma janela nativa do Windows, eliminando a necessidade de instalação de navegadores ou dependência de conectividade para a camada de UI local.

**Dependência:** Este change deve ser executado após a estabilização das telas web — todos os outros changes (auth-setup → admin-dashboard) devem estar concluídos antes do build final do Electron.

**Stakeholders:** Equipe de produto (experiência desktop), Doadores comerciais (usuários finais no Windows), equipe de DevOps (pipeline de build do instalador `.exe`).

---

## Goals / Non-Goals

**Goals:**
- Criar estrutura `electron/` com o processo principal (`main.js`) configurado com `BrowserWindow` e CSP restrita
- Configurar `package.json` com scripts `dev:electron` (Next.js dev + Electron) e `build:electron` (Next.js export + electron-builder)
- Configurar `electron-builder` para gerar instalador NSIS `.exe` para Windows 10/11
- Configurar o Next.js para suportar export estático (`output: 'export'`) para o modo embedded do Electron
- Implementar persistência offline de sessão via `localStorage` no wrapper (fallback quando servidor não disponível)
- Configurar CSP no `BrowserWindow` para permitir apenas origens confiáveis

**Non-Goals:**
- Suporte a macOS ou Linux — apenas Windows no MVP
- Auto-update automático (`electron-updater`) — deferido para pós-MVP
- Notificações nativas do sistema operacional (Electron `Notification`) — módulo separado
- IPC complexo entre Electron main e renderer — apenas `contextBridge` básico para APIs de sistema

---

## Decisions

### D1: Next.js Static Export (`output: 'export'`) vs. Servidor Node Embarcado

**Decisão:** Usar modo servidor Next.js local (`npm run dev`) apontado pelo Electron em desenvolvimento; gerar build estático com `output: 'export'` para o instalador de produção.

**Rationale:** O App Router do Next.js 14 suporta `output: 'export'` para geração de HTML/JS/CSS estático. No modo desktop, o Electron carrega os arquivos estáticos locais via `file://` protocol, eliminando dependência de servidor externo para a UI. Os Route Handlers (API) que requerem Node.js runtime **não são servidos no modo estático** — no MVP Electron, as APIs apontam para o servidor web hospedado (Vercel/servidor local), não são embarcadas no instalador.

**Alternativa descartada:** Servidor Next.js embarcado — requer empacotar o runtime Node.js inteiro no instalador (~50MB extra); inicia mais lento; complexo de gerenciar como processo filho.

---

### D2: Protocolo de Carregamento — `file://` vs. `http://localhost`

**Decisão:** Em produção (build estático), carregar via `file://` protocol com `webSecurity: false` **apenas para arquivos locais**. Em desenvolvimento, apontar para `http://localhost:3000`.

**Rationale:** `file://` é o protocolo natural para carregar arquivos estáticos empacotados no instalador sem iniciar um servidor HTTP. O App Router com `output: 'export'` gera rotas como `index.html` por diretório, compatíveis com carregamento direto por `file://`. A flag `webSecurity: false` é necessária apenas para assets locais e deve ser combinada com CSP restrita via `session.defaultSession.webRequest` para compensar.

**Alternativa descartada:** Servidor `http-server` local embutido — adiciona processo extra, latência de inicialização e porta TCP a gerenciar.

---

### D3: electron-builder — NSIS (instalador) vs. Portable (zip)

**Decisão:** Gerar instalador NSIS (`.exe`) como formato primário de distribuição.

**Rationale:** NSIS cria um instalador Windows padrão que registra a aplicação no menu Iniciar, Painel de Controle (Programas) e cria atalho na área de trabalho — comportamento esperado por operadores comerciais não técnicos. O formato portable (`.zip`) seria mais simples de gerar, mas requer que o usuário descompacte e gerencie o executável manualmente, o que é inadequado para o público-alvo.

**Alternativa descartada:** MSI — requer certificado de assinatura de código pago para distribuição corporativa; AppX/MSIX — para distribuição via Microsoft Store, fora do escopo MVP.

---

### D4: `contextBridge` e `preload.js` vs. `nodeIntegration: true`

**Decisão:** Usar `contextBridge` com `preload.js` e manter `nodeIntegration: false` e `contextIsolation: true`.

**Rationale:** `nodeIntegration: true` expõe toda a API Node.js ao código da página web, criando vetores de ataque XSS críticos (um script malicioso poderia ler o sistema de arquivos). O modelo `contextBridge` expõe apenas as APIs específicas necessárias via `window.electronAPI`, mantendo isolamento de contexto. No MVP, o preload expõe apenas `getVersion()` e `openExternal(url)` para links externos.

---

## Risks / Trade-offs

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Rotas dinâmicas do Next.js App Router incompatíveis com `output: 'export'` | Alta | Alto | Garantir que todas as rotas dinâmicas usem `generateStaticParams()` ou sejam servidas via API remota |
| CSP muito restrita bloqueando Leaflet.js ou assets de mapas | Média | Médio | Testar CSP com `Content-Security-Policy` header habilitando `blob:` e `data:` URIs necessários para o canvas do Leaflet |
| Tamanho excessivo do instalador `.exe` (> 150MB) | Média | Médio | Configurar `files` no `electron-builder.yml` para excluir `node_modules` de desenvolvimento e arquivos de cache |
| `file://` protocol causando CORS errors nas chamadas às APIs remotas | Alta | Alto | Configurar `BrowserWindow.webPreferences.webSecurity` corretamente e usar CORS policy no servidor Next.js aceitando a origem Electron |

---

## Migration Plan

1. Instalar dependências: `npm install -D electron electron-builder`
2. Criar `electron/main.js` com configuração de `BrowserWindow` e CSP
3. Criar `electron/preload.js` com `contextBridge` expondo APIs mínimas
4. Atualizar `next.config.js` adicionando `output: 'export'` (condicional por variável de ambiente `ELECTRON_BUILD=true`)
5. Adicionar scripts ao `package.json`: `"dev:electron"` e `"build:electron"`
6. Criar `electron-builder.yml` com configuração de NSIS e targets Windows
7. Testar build com `npm run build:electron` e validar instalador gerado
8. Rollback: remover pasta `electron/`, reverter `next.config.js` e remover scripts do `package.json`
