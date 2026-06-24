## Purpose

O Mesa Justa é uma aplicação web Next.js, mas seu público-alvo primário são operadores de estabelecimentos comerciais que trabalham em Windows. O Electron wrapper encapsula a aplicação dentro de uma janela nativa, eliminando a dependência de navegadores externos e fornecendo uma experiência desktop integrada.

## Requirements

### Requirement: Processo principal Electron com BrowserWindow e CSP restrita

O sistema SHALL implementar o arquivo `electron/main.js` configurando um `BrowserWindow` com `nodeIntegration: false`, `contextIsolation: true` e `webSecurity: true`. A CSP SHALL ser configurada via `session.defaultSession.webRequest.onHeadersReceived` para restringir origens de scripts e estilos.

#### Scenario: Aplicação inicializa com janela do Electron em modo desenvolvimento
- **WHEN** o comando `npm run dev:electron` é executado
- **THEN** o Electron SHALL abrir uma janela carregando `http://localhost:3000` e o DevTools SHALL estar disponível para inspeção

#### Scenario: Aplicação inicializa em modo produção com build estático
- **WHEN** o instalador `.exe` gerado é executado em Windows 10/11
- **THEN** o Electron SHALL carregar o `index.html` do build estático via `file://` protocol sem erros de console

#### Scenario: CSP bloqueia execução de scripts de origens não autorizadas
- **WHEN** a página carregada tenta executar um script inline não autorizado pela CSP
- **THEN** o Chromium do Electron SHALL bloquear a execução e registrar o erro de CSP no console

---

### Requirement: `contextBridge` e `preload.js` para APIs expostas ao renderer

O sistema SHALL implementar `electron/preload.js` usando `contextBridge.exposeInMainWorld('electronAPI', {...})` para expor apenas as APIs necessárias ao renderer, sem habilitar `nodeIntegration`.

#### Scenario: Renderer acessa `window.electronAPI.getVersion()` corretamente
- **WHEN** o código da página chama `window.electronAPI.getVersion()`
- **THEN** SHALL retornar a string de versão do Electron sem lançar exceção

#### Scenario: Renderer não tem acesso direto a módulos Node.js
- **WHEN** o código da página tenta acessar `require('fs')` diretamente
- **THEN** SHALL lançar `ReferenceError: require is not defined` confirmando que `nodeIntegration` está desabilitado

---

### Requirement: Build de instalador `.exe` via electron-builder com NSIS

O sistema SHALL gerar um instalador Windows NSIS (`.exe`) ao executar `npm run build:electron`, contendo a aplicação Next.js em build estático, registrando a aplicação no menu Iniciar e criando atalho na área de trabalho.

#### Scenario: Script build:electron gera arquivo .exe sem erros
- **WHEN** o comando `npm run build:electron` é executado em ambiente com Node.js e dependências instaladas
- **THEN** o processo SHALL concluir sem erros e gerar um arquivo `Mesa Justa Setup x.y.z.exe` no diretório `dist/`

#### Scenario: Instalador registra a aplicação corretamente no Windows
- **WHEN** o arquivo `.exe` gerado é executado em Windows 10/11 com permissões de administrador
- **THEN** a aplicação SHALL aparecer em "Programas e Recursos" do Painel de Controle e SHALL criar atalho no menu Iniciar

---

### Requirement: Suporte a `output: 'export'` no Next.js para build estático do Electron

O sistema SHALL configurar o `next.config.js` para suportar geração de HTML/CSS/JS estático quando a variável de ambiente `ELECTRON_BUILD=true` estiver definida, sem quebrar o servidor Next.js em modo web normal.

#### Scenario: Build estático gerado corretamente para o Electron
- **WHEN** `ELECTRON_BUILD=true npm run build` é executado
- **THEN** o Next.js SHALL gerar a pasta `out/` com todos os arquivos estáticos e o Electron SHALL ser capaz de carregar `out/index.html` via `file://` sem erros de roteamento

#### Scenario: Servidor Next.js web não é afetado pela configuração do Electron
- **WHEN** `npm run build` é executado sem a variável `ELECTRON_BUILD`
- **THEN** o Next.js SHALL gerar o bundle de servidor padrão sem o flag `output: 'export'`, mantendo Route Handlers funcionais
