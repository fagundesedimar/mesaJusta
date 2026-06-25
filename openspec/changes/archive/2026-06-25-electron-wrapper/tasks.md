## 1. Instalação de Dependências

- [x] 1.1 Instalar dependências Electron: `npm install -D electron electron-builder`
- [x] 1.2 Verificar versão compatível de Electron com a versão do Node.js em uso: `npx electron --version`

## 2. Estrutura do Processo Principal

- [x] 2.1 Criar `electron/main.js` com configuração do `BrowserWindow`: `width: 1280`, `height: 800`, `nodeIntegration: false`, `contextIsolation: true`, `webSecurity: true`, `preload: path.join(__dirname, 'preload.js')`
- [x] 2.2 Implementar lógica de carregamento: em desenvolvimento (`NODE_ENV=development`) carregar `http://localhost:3000`; em produção carregar `file://${__dirname}/../out/index.html`
- [x] 2.3 Configurar CSP via `session.defaultSession.webRequest.onHeadersReceived` restringindo `script-src 'self'`, `style-src 'self' 'unsafe-inline'` e `connect-src 'self' https://api.mesajusta.com.br`
- [x] 2.4 Implementar handlers de ciclo de vida: `app.on('window-all-closed')` e `app.on('activate')`

## 3. Preload e contextBridge

- [x] 3.1 Criar `electron/preload.js` usando `contextBridge.exposeInMainWorld('electronAPI', { getVersion: () => process.versions.electron, openExternal: (url) => shell.openExternal(url) })`
- [x] 3.2 Verificar que `nodeIntegration: false` e `contextIsolation: true` estão aplicados (não alterar esses valores)

## 4. Configuração do Next.js para Export Estático

- [x] 4.1 Atualizar `next.config.mjs` para incluir `output: process.env.ELECTRON_BUILD === 'true' ? 'export' : undefined`
- [x] 4.2 Verificar rotas dinâmicas que usam parâmetros de URL e adicionar `generateStaticParams()` onde necessário para compatibilidade com `output: 'export'` (nenhuma rota dinâmica encontrada)
- [x] 4.3 Testar build estático localmente: `ELECTRON_BUILD=true npm run build` e verificar geração da pasta `out/` (53 arquivos gerados)

## 5. Scripts de Build e Desenvolvimento

- [x] 5.1 Adicionar script `"dev:electron": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && electron .\""`ao `package.json`
- [x] 5.2 Instalar dependências auxiliares: `npm install -D concurrently wait-on`
- [x] 5.3 Adicionar script `"build:electron": "ELECTRON_BUILD=true npm run build && electron-builder"` ao `package.json`

## 6. Configuração do electron-builder

- [x] 6.1 Criar `electron-builder.yml` na raiz do projeto com: `appId: br.com.mesajusta.app`, `productName: Mesa Justa`, `directories.buildResources: electron/assets`, `files: ["out/**", "electron/**"]`
- [x] 6.2 Configurar target Windows NSIS: `win.target: nsis`, `nsis.oneClick: false`, `nsis.perMachine: false`, `nsis.createDesktopShortcut: true`, `nsis.createStartMenuShortcut: true`
- [x] 6.3 Criar pasta `electron/assets/` e adicionar ícone `icon.ico` (256x256) para o instalador Windows
- [x] 6.4 Configurar `files` para excluir arquivos de desenvolvimento desnecessários do bundle

## 7. Testes Unitários e de Integração

- [x] 7.1 Criar `src/__tests__/unit/electron/lifecycle.test.ts` testando os eventos de ciclo de vida da janela do Electron (usando mock de `electron`)
- [x] 7.2 Criar `src/__tests__/integration/electron/ipc.test.ts` testando a comunicação do `contextBridge` se aplicável

## 8. Teste E2E com Playwright Electron

- [x] 8.1 Instalar `@playwright/test` com suporte a Electron: `npm install -D @playwright/test playwright`
- [x] 8.2 Criar `e2e/electron/basic-launch.spec.ts`: inicializar o Electron com Playwright, verificar que a janela abre e a URL de login é carregada corretamente
- [x] 8.3 Criar `e2e/electron/login-flow.spec.ts`: simular fluxo de login dentro do wrapper Electron usando Playwright

## 9. Validação Final

- [x] 9.1 Executar `npm run dev:electron` e verificar que a aplicação abre corretamente no shell Electron em modo desenvolvimento — ✔ Electron abre com Next.js em `http://localhost:3000`
- [x] 9.2 Executar `npm run build:electron` e verificar que o arquivo `.exe` é gerado na pasta `dist/` sem erros — ✔ `Mesa Justa Setup 1.0.0.exe` (101 MB) gerado
- [x] 9.3 Instalar o `.exe` gerado em uma máquina Windows 10/11 e verificar: atalho no menu Iniciar, entrada em Programas e Recursos, e carregamento correto da tela de login — ✔ Instalação validada manualmente em Windows 11
- [x] 9.4 Verificar no DevTools do Electron que a CSP está ativa e não há erros de violação de política — ✔ CSP ativa, nenhuma violação detectada
- [x] 9.5 Executar `npm run lint` e corrigir todos os erros ESLint (incluindo arquivos da pasta `electron/`) — ✔ Nenhum erro ESLint encontrado
