## Why

Fornecer suporte nativo ao ambiente desktop Windows, facilitando a adesão e o uso recorrente por parte de operadores comerciais que trabalham com sistemas de ponto de venda ou computadores dedicados nos caixas e expedições, sem necessidade de dependência direta de navegadores externos.

## What Changes

- Criação do diretório e estrutura do Electron (`electron/`) contendo o processo principal (`main.js` ou equivalente).
- Configuração de scripts de empacotamento com `electron-builder` para geração de instalador `.exe` (Windows).
- Configuração de build estático do Next.js (SSG via `output: 'export'`) ou integração de servidor local do Next.js para rodar embarcado no shell do Electron.
- Integração e persistência offline de sessão local no LocalStorage do wrapper.

## Capabilities

### New Capabilities
- `electron-wrapper`: Empacotamento desktop nativo (Windows 10 e 11) com suporte a carregamento offline de sessões, persistência de dados em LocalStorage e geração de instalador executável.

### Modified Capabilities
<!-- Nenhuma capacidade existente será modificada nesta etapa -->

## Impact

- Estrutura do projeto (criação da pasta `/electron`).
- Scripts de compilação em `package.json` (`npm run build:electron` e `npm run dev:electron`).
- Configurações de rotas dinâmicas (que precisam suportar caminhos estáticos locais).

---

## Detalhes do Planejamento de Execução

### Escopo Funcional
- Carregamento seguro da interface do Next.js dentro do shell do Chromium do Electron.
- Script de instalação para Windows 10/11 contendo todas as dependências nativas.
- Configuração de segurança CSP (Content Security Policy) restrita no navegador interno do Electron.

### Dependências
- Estabilização de todas as telas e APIs da aplicação web (do `auth-setup` ao `admin-dashboard`).

### Riscos
- Risco Médio: Incompatibilidade do roteamento do Next.js App Router ao rodar em ambiente local (`file://` protocol do Electron). Mitigado utilizando configuração adequada de caminhos relativos ou rodando um servidor Node webview local embarcado sob demanda.

### Execução de Linter Necessária
- Validação completa via ESLint (`npm run lint`).

### Testes Unitários Necessários
- Teste de ciclo de vida da janela do Electron (validação do processo principal e eventos de fechar/abrir janela).

### Testes de Integração Necessários
- Teste de comunicação IPC (se aplicável) e carregamento de páginas estáticas locais.

### Testes E2E Necessários
- Execução automatizada com Playwright Electron simulando o executável e testando o fluxo básico de login.
