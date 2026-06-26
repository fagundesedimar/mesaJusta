# Guia do Agente IA (AGENTS.md) - Mesa Justa

Este documento define as regras de comportamento, comandos essenciais, diretrizes de qualidade, governança de terminal e regras de aprendizado contínuo para qualquer Agente de IA que atue no desenvolvimento da plataforma **Mesa Justa: Circuito Solidário**.

---

## 🧠 1. Comportamento Geral (Diretrizes CLAUDE.md)

Ao atuar no desenvolvimento deste projeto, o agente deve seguir rigorosamente as seguintes diretrizes:

-   **Pense antes de Codificar (Think Before Coding)**: Analise os arquivos envolvidos, formule uma linha de raciocínio lógico e declare suas premissas antes de propor ou injetar novos blocos de código.
-   **Gerencie Ambiguidades**: Se um requisito ou instrução de alteração for ambíguo, pare imediatamente e solicite esclarecimento ao usuário, expondo as opções identificadas. Não assuma decisões em silêncio.
-   **Precisão Cirúrgica (Surgical Precision)**: Modifique estritamente as linhas necessárias para resolver o problema proposto. Não limpe trechos de código alheios à sua tarefa, a menos que solicitado. Minimize o volume de alterações para manter o diff limpo.
-   **Exposição de Trade-offs**: Sempre justifique decisões arquiteturais complexas e exponha os prós e contras das alternativas técnicas antes de implementá-las.
-   **Comunicação Transparente**: Se encontrar erros ou confusão durante a leitura do código, reporte diretamente sem tentar mascarar falhas do sistema.

---

## 💻 2. Stack Tecnológica & Estrutura do Monorepo

O Mesa Justa é desenvolvido sob um formato de **Full-Stack Monolith** integrado a um invólucro de Desktop nativo.

### Stack Resumida:
-   **Frontend**: Next.js 14+ (App Router) + React 18+ (Vanilla CSS, Leaflet.js).
-   **Backend**: API Route Handlers do Next.js (Node.js runtime) + Server Actions.
-   **Persistência**: PostgreSQL com extensão espacial PostGIS e ORM Prisma. Redis para cache.
-   **Wrapper Desktop**: Electron.
-   **Testes**: Jest (RTL) para UI, Vitest para helpers/API, Pact.io para contrato, Playwright para E2E.

### Estrutura do Monorepo:
```text
├── docs/                      # Documentação técnica e especificações (Referência obrigatória)
│   ├── prd.md                 # Requisitos de Produto
│   ├── visao-de-produto.md    # Visão Geral e Personas
│   ├── spec_req.md            # Especificação de Requisitos (SRS)
│   ├── spec_tech.md           # Especificação Técnica da Arquitetura
│   ├── spec_ui.md             # Especificação e Fluxos de Interface
│   └── prompt_ux_stitch.md    # Prompt para ferramentas de prototipagem (Google Stitch)
├── electron/                  # Código do Wrapper Desktop (Main Process)
├── prisma/                    # Schema do banco de dados e arquivos de migração
├── src/                       # Código Fonte do Next.js
│   ├── app/                   # Rotas de páginas e API Route Handlers (Next.js App Router)
│   ├── components/            # Componentes React de UI (Vanilla CSS)
│   └── services/              # Serviços de banco de dados e utilitários
├── .env.example               # Template de variáveis de ambiente
├── .env                       # Variáveis de ambiente locais (Não commitar!)
├── AGENTS.md                  # Este documento de regras do agente
└── README.md                  # Manual do desenvolvedor
```

---

## 🛠️ 3. Comandos de Terminal Homologados

Qualquer comando de execução deve ser executado no diretório raiz e de acordo com as seguintes sintaxes:

### Setup Inicial:
```bash
# Instalação de dependências
npm install
# Criação do arquivo de ambiente (caso não exista)
copy .env.example .env
```

### Banco de Dados:
```bash
# Execução das migrações do Prisma no banco de dados local
npx prisma migrate dev
# Inicialização do visualizador de banco (Prisma Studio)
npx prisma studio
```

### Rodar em Desenvolvimento:
```bash
# Iniciar o servidor web Next.js
npm run dev
# Iniciar o ambiente desktop (Next.js integrado com Electron)
npm run dev:electron
```

### Build da Aplicação:
```bash
# Compilar build estático/servidor do Next.js
npm run build
# Gerar instalador executável (.exe) do Electron
npm run build:electron
```

### Deploy (Vercel):
```bash
# Fazer deploy direto via CLI (não depende de push GitHub)
vercel deploy --token $VERCEL_TOKEN --prod --yes
```

---

## 🧪 4. Regras de Qualidade e Testes

-   **Vanilla CSS Estrito**: É proibida a adição de Tailwind CSS ou frameworks de estilo utilitários, exceto se explicitamente ordenado pelo usuário. Toda estilização deve usar CSS puro via variáveis em `src/index.css`.
-   **Tipagem Forte em TypeScript**: Evitar o tipo `any` nas funções, payloads de API e layouts de componentes.
-   **Segurança de Status**: Toda alteração de status de doação deve, obrigatoriamente, registrar a ação no Log de Auditoria.
-   **Execução de Testes Automatizados**:
    *   *Testes Unitários*: `npm run test:unit` (Jest/Vitest).
    *   *Testes de Contrato*: `npm run test:contract` (Pact.io).
    *   *Testes de Integração*: `npm run test:integration` (Vitest + Postgres Local).
    *   *Testes E2E*: `npm run test:e2e` (Playwright).

---

## 🚦 5. Governança e Autonomia no Terminal

-   **Autonomia para Leitura e Escrita de Arquivos**: O agente possui autonomia completa para criar, ler, editar e remover arquivos locais de documentação (na pasta `docs/`) e arquivos de código-fonte (nas pastas `src/`, `electron/` e `prisma/`), bem como aplicar correções estáticas diretas ou de sintaxe, sem necessidade de solicitar aprovação prévia para cada operação individual de arquivo.
-   **Aprovação para Comandos do Sistema**:
    *   *Comandos Gerais*: Comandos de compilação (`npm run build`), testes locais (`npm run test:*`) ou visualização (`npx prisma studio`) podem ser propostos de forma direta.
    *   *Comandos Destrutivos*: É obrigatório pedir confirmação explícita no chat antes de rodar comandos destrutivos (como exclusão de pastas críticas, `git clean` ou formatações/resets de banco de dados).
-   **Uso de Ferramentas de Comando**: Sempre proponha comandos estruturados em linha única e configure o diretório de trabalho (`Cwd`) de maneira adequada para evitar erros de execução.
-   **Segurança de Segredos**: Nunca comite arquivos `.env` contendo chaves reais. Sempre utilize o `.env.example` para documentar novas variáveis que devam ir para o repositório remoto.

---

## 📚 6. Referências de Documentação do Projeto

Ao trabalhar em uma tarefa, leia antes os respectivos guias:
-   Requisitos do Produto: [docs/prd.md](file:///C:/Users/Edimar/.gemini/antigravity/scratch/mesa-justa/docs/prd.md)
-   Estrutura Técnica e Banco: [docs/spec_tech.md](file:///C:/Users/Edimar/.gemini/antigravity/scratch/mesa-justa/docs/spec_tech.md)
-   Comportamento de Interface: [docs/spec_ui.md](file:///C:/Users/Edimar/.gemini/antigravity/scratch/mesa-justa/docs/spec_ui.md)
-   Detalhamento de Fluxos: [docs/spec_req.md](file:///C:/Users/Edimar/.gemini/antigravity/scratch/mesa-justa/docs/spec_req.md)

*Para buscas atualizadas de credenciais e integrações externas, use as chaves do context7 no console de desenvolvimento.*

---

## 🔄 7. Aprendizado Contínuo e Evolução de Regras

Ao final de cada ciclo de alteração de código ou de documentação, o agente deve:
1.  **Refletir sobre o processo**: Identificar o que deu certo e quais dificuldades foram encontradas na arquitetura do monorepo.
2.  **Sugerir Atualização de Regras**: Caso identifique um padrão repetitivo de erro, uma limitação do compilador, ou uma regra de estilo não mapeada, deve propor e inserir uma nova diretriz de desenvolvimento neste arquivo (`AGENTS.md`) sob a seção **"Histórico de Evolução de Regras"** abaixo.

### Histórico de Evolução de Regras:
-   *(V1.2 - 26/06/2026)*: Aprendizados de deploy Vercel + Supabase: (1) Sempre usar `POSTGRES_URL` da integração Supabase-Vercel pois contém pooler host IPv4 — `DATABASE_URL` e `POSTGRES_HOST` têm host direto IPv6 (inacessível da Vercel). (2) `pg` v8 trata `sslmode=require` como `verify-full` — substituir por `sslmode=no-verify`. (3) Supavisor pooler exige o param `supa=base-pooler.x` na URL para identificar tenant — conexões com host/port/user isolados falham. (4) Deploy confiável via `vercel deploy --token --prod --yes` (CLI, não push GitHub). (5) `vercel logs` pode não exibir erros de runtime — manter endpoint de diagnóstico (`/api/v1/auth/test-db`).
-   *(V1.1 - 15/06/2026)*: Aumento de autonomia do agente para operações locais de leitura, escrita e edição de arquivos (como correção de sintaxe e documentação), mantendo regras restritas para comandos destrutivos.
-   *(V1.0 - 15/06/2026)*: Criação inicial das diretrizes de comportamento, arquitetura Next.js + Electron, governança de terminal e testes.
