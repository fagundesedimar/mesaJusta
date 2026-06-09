# Especificação Técnica - Mesa Justa: Circuito Solidário

## Visão Geral Técnica

Este documento tem como objetivo definir as diretrizes arquiteturais, a stack tecnológica, as políticas de segurança e a modelagem técnica do sistema **Mesa Justa: Circuito Solidário**. 

O público-alvo deste documento inclui desenvolvedores de software, engenheiros de DevOps, especialistas em segurança, analistas de garantia de qualidade (QA) e ferramentas de Inteligência Artificial assistidas que atuarão na codificação e implantação do sistema. O escopo técnico abrange tanto a estrutura do MVP (com persistência simulada em LocalStorage e empacotamento via Electron) quanto a arquitetura de produção escalável voltada para nuvem.

---

## Arquitetura de Referência

O sistema adota um padrão arquitetural baseado em **Monolito Modular** para a API de produção, otimizando o custo operacional e simplificando o deployment na fase piloto, mantendo baixo acoplamento entre os domínios para facilitar uma futura migração para microsserviços se necessário.

```mermaid
graph TD
    subgraph Cliente (Frontend)
        A[Electron App - Desktop Shell] -->|Carrega localmente| B[Vite + React SPA]
        C[Navegador Web / Mobile] -->|Acessa via HTTPS| B
    end

    subgraph API Gateway / Servidor (Backend)
        B -->|Chamadas HTTPS REST| D[API Node.js + Express/NestJS]
    end

    subgraph Camada de Dados
        D -->|ORM Prisma| E[(PostgreSQL + PostGIS)]
        D -->|Cache/Filas| F[(Redis)]
    end

    subgraph Serviços Externos
        D -->|Geocodificação| G[OpenStreetMap / Nominatim API]
        D -->|E-mail / Push| H[Serviço Notificações]
    end
```

### Decisões Técnicas Resumidas:

- **Estilo Arquitetural**: Monolito Modular com separação clara de pastas por domínio (usuários, doações, gamificação, logística e auditoria).
- **Componentes Principais**:
  - **Front-end**: SPA React empacotado localmente com Electron (para fins de desktop) ou servido como Web App responsivo.
  - **Back-end**: Servidor Node.js em TypeScript expondo APIs RESTful.
  - **Banco de Dados**: PostgreSQL com extensão espacial PostGIS para armazenamento de localizações exatas e consultas eficientes de proximidade por coordenadas.
- **Serviço de Observabilidade**: Logging centralizado no backend com a biblioteca Winston formatando logs em JSON. Em produção, integração com Sentry para captura de erros no frontend e backend, e métricas via Prometheus/Grafana.
- **Autenticação e Autorização**: Mecanismo de autenticação stateless via tokens JWT (JSON Web Tokens). O controle de acesso é baseado em perfis de acesso (RBAC - Role-Based Access Control) diferenciando Doador, ONG e Administrador.
- **Protocolos de Comunicação**: HTTPS para requisições síncronas RESTful API. Emissão de tokens de retirada e alertas em tempo real suportados via WebSockets (Socket.io).
- **Infraestrutura de Deployment**: Empacotamento do backend em contêineres Docker executados em serviços de container de nuvem (como AWS ECS Fargate). O frontend web será hospedado em plataformas de Edge Hosting (como Vercel ou AWS CloudFront).

---

## Stack Tecnológica

### Frontend

- **Linguagem**: JavaScript (ES6+) / TypeScript.
- **Framework web**: React (estruturado através do Vite para builds ultra-rápidos).
- **Estilização**: Vanilla CSS (CSS puro utilizando Variáveis CSS para tokens de design, Flexbox e Grid Layouts).
- **Biblioteca de Mapas**: Leaflet.js para renderização do mapa interativo com tiles livres do OpenStreetMap.
- **Wrapper Desktop**: Electron (encapsula o build estático do React em uma janela nativa do sistema operacional).

### Backend

- **Linguagem**: TypeScript.
- **Runtime**: Node.js (v18 ou superior).
- **Framework**: Express.js (simplificado para MVP) ou NestJS (para estrutura modular robusta).
- **Persistência**: PostgreSQL (produção) com extensão espacial PostGIS. LocalStorage simulado (MVP).
- **ORM**: Prisma ORM para mapeamento objeto-relacional estruturado e migrações tipadas.

### Stack de Desenvolvimento

- **IDE**: Visual Studio Code (VS Code) com extensões de ESLint, Prettier e Prisma.
- **Gerenciamento de pacotes**: npm (Node Package Manager).
- **Ambiente de desenvolvimento local**: Docker Compose contendo contêineres do PostgreSQL/PostGIS e do Redis.
- **Infraestrutura como Código (IaC)**: Terraform para provisionamento de recursos de produção na AWS.
- **Pipeline CI/CD**: GitHub Actions para execução de testes automatizados, checagens estáticas (Linter), build do instalador Electron e deployment automático na nuvem.

### Integrações

- **Persistência**: LocalStorage (MVP) / Banco de dados relacional PostgreSQL remoto.
- **Deployment**: Electron Builder (para empacotar em `.exe` no Windows) e Vercel / AWS Amplify (para o frontend Web).
- **Segurança (Autenticação e Autorização)**: Biblioteca nativa `bcryptjs` no backend para hashing de senhas e `jsonwebtoken` para emissão e assinatura de chaves de acesso.
- **Observabilidade**: Console logging formatado + Sentry SDK integrado no frontend e backend.

---

## Segurança

### Autenticação e Gestão de Sessão

- **Senhas Seguras**: O armazenamento de senhas de usuários no banco de dados exige criptografia de via única por meio do algoritmo Bcrypt com fator de custo (Salt) de no mínimo 10.
- **Tokens de Acesso**: Utilização de JSON Web Tokens (JWT) com assinatura assimétrica (RS256) ou simétrica forte (HS256). Os tokens devem possuir tempo de expiração curto (ex: 15 minutos) acompanhados por um sistema de rotação de Refresh Tokens seguros armazenados em cookies HTTP-Only no navegador.
- **Prevenção de Sequestro de Sessão**: Cookies que carregam informações de sessão devem ser configurados com as flags `Secure`, `HttpOnly` e `SameSite=Strict`.

### Controle de Acesso e Autorização

- **Controle de Acesso Baseado em Papéis (RBAC)**: O sistema de autorização interceptará as rotas de API por meio de middlewares que checam o escopo (`role`) contido na assinatura do JWT.
- **Segurança no Nível da Linha (Row-Level Security - RLS)**: Em consultas a recursos de doação e auditoria, o backend deve injetar o ID do usuário autenticado no filtro da query SQL para garantir que um estabelecimento não consiga alterar ou visualizar detalhes de doações de outros, e que uma ONG acesse apenas as suas próprias reservas.

### Segurança de Dados e Validação

- **Validação de Input**: Todas as entradas do usuário (corpo de requisições, parâmetros de rota e query strings) devem passar por validação rigorosa na borda da API usando esquemas tipados (como a biblioteca Zod).
- **Sanitização contra XSS**: Inputs textuais vindos do front-end devem ser limpos e codificados no momento da exibição para evitar injeção de scripts (XSS).
- **Proteção contra SQL Injection**: Uso obrigatório de consultas parametrizadas (Prepared Statements) fornecidas nativamente pelo ORM Prisma. A execução de queries brutas (`raw query`) é proibida, exceto para operações espaciais PostGIS validadas.

#### Criptografia e Proteção de Dados

- **Dados em Trânsito**: Comunicação cliente-servidor protegida de ponta a ponta por criptografia HTTPS utilizando o protocolo TLS 1.3 (e TLS 1.2 como fallback).
- **Dados Sensíveis em Repouso**: Criptografia AES-256 aplicada no nível do armazenamento de dados em produção (AWS RDS Storage Encryption) e dados pessoais identificáveis (como telefones ou CPFs de responsáveis) criptografados opcionalmente no nível da aplicação.

### Segurança da Infraestrutura e Configuração

- **Variáveis de Ambiente**: Credenciais de banco de dados, chaves de assinatura JWT e chaves de APIs parceiras nunca devem ser mantidas em código fonte. Devem ser injetadas em tempo de execução via variáveis de ambiente configuradas em serviços de gerenciamento de segredos (ex: AWS Secrets Manager ou variáveis seguras do repositório no CI/CD).
- **Ambiente Isolado (VPC)**: O banco de dados PostgreSQL e o cache Redis devem ser implantados em sub-redes privadas dentro de uma VPC, inacessíveis diretamente pela internet pública, sendo acessados unicamente pela API Backend por meio de regras estritas de Security Group.

### Segurança no Desenvolvimento e Operação (DevSecOps)

- **Análise Estática de Vulnerabilidades**: Integração de ferramentas como Snyk ou npm audit nas esteiras de CI/CD para detectar pacotes NodeJS com vulnerabilidades conhecidas antes de cada build.
- **Varredura de Segredos**: Utilização de ferramentas como `git-secrets` para prevenir que chaves de API sejam commitadas acidentalmente no repositório.

---

## APIs

O sistema expõe uma API RESTful corporativa documentada sob a especificação OpenAPI (Swagger).

### Diretrizes Gerais:
- **Endpoint Principal**: `/api/v1`
- **Versionamento**: Realizado diretamente no caminho da URL para mitigar quebras de compatibilidade com clientes de desktop legados do Electron.
- **Padrão de Nomenclatura**: Recursos expressos em substantivos no plural em inglês (ex: `/donations`, `/users`, `/reservations`), com uso apropriado dos métodos HTTP:
  - `GET`: Recuperar informações.
  - `POST`: Criar novos recursos.
  - `PUT`/`PATCH`: Atualizar recursos existentes.
  - `DELETE`: Remover logicamente recursos (soft delete).

### Endpoints Principais (MVP)

#### Públicos (Sem autenticação):
- `POST /api/v1/auth/register` - Cadastro de novos estabelecimentos ou ONGs.
- `POST /api/v1/auth/login` - Autenticação e emissão de JWT.

#### Protegidos (Requer cabeçalho `Authorization: Bearer <JWT>`):
- `GET /api/v1/donations` - Lista doações ativas. Filtros: `category`, `state`, `city`, `maxDistance` (calculado via coordenadas).
- `POST /api/v1/donations` - Cadastro de lote de alimentos (Apenas Perfil Doador).
- `PATCH /api/v1/donations/:id/status` - Atualização de status da doação (Disponível, Reservada, Retirada, Cancelada, Expirada).
- `POST /api/v1/reservations` - Realiza a reserva de uma doação e gera o Token de Retirada (Apenas Perfil ONG).
- `POST /api/v1/reservations/confirm` - Confirmação da retirada física validando o Token de Retirada (Perfis Doador e ONG).
- `GET /api/v1/admin/dashboard` - Estatísticas macro e histórico de logs de auditoria (Apenas Perfil Administrador).
- `GET /api/v1/gamification/ranking` - Exibe lista de classificação dos doadores baseados em Moedas Verdes acumuladas.

---

## Tenancy

O Mesa Justa adota um modelo de **Multi-tenancy Lógico (Banco de Dados Compartilhado com Separação Lógica)**. Por se tratar de um ecossistema cooperativo onde doadores locais e ONGs locais interagem, a separação rígida por bancos de dados físicos isolados não é adequada, pois impediria a descoberta de doações entre diferentes entidades na mesma região geográfica.

- **Estratégia de Isolamento**: Os dados são isolados logicamente com base nas chaves estrangeiras `establishment_id`, `ngo_id` e nos escopos geográficos de estado/município.
- **Segurança de Acesso**: Cada consulta SQL gerada pelas APIs deve injetar um filtro de segurança garantindo que os usuários acessem exclusivamente recursos autorizados de seu ecossistema. 
- **Identificação do Locatário (Tenant)**: No momento do login, o identificador do estabelecimento ou da ONG é decodificado do token JWT do usuário, sendo repassado para todas as consultas do ciclo de vida da requisição (Request Context).
- **Migrações de Banco**: Gerenciadas de forma centralizada pelo Prisma Migrate. Modificações na estrutura da tabela afetam todas as organizações de forma unificada e simultânea, necessitando de testes de regressão automatizados para evitar indisponibilidade do ecossistema.

---

## Diretrizes para Desenvolvimento Assistido por IA

Ao utilizar ferramentas de IA para gerar código ou manter a plataforma Mesa Justa, siga as seguintes instruções imperativas:

1. **Vanilla CSS Estrito**: A estilização deve utilizar arquivos CSS nativos (`src/index.css`) sem bibliotecas de utilitários como Tailwind CSS (a menos que explicitamente ordenado pelo usuário). Os estilos devem fazer uso rigoroso de propriedades personalizadas (CSS Variables) para cores, fontes e espaçamentos definidos no design system do projeto.
2. **Tipagem Estrita em TypeScript**: Todos os novos módulos, componentes ou funções devem possuir assinaturas completas de tipo. Evite o uso de tipos genéricos ou indefinidos como `any`.
3. **Padrão de Manipulação de Status**: Qualquer fluxo de alteração de status na tabela de doações deve obrigar a gravação correspondente na tabela/coleção de logs de auditoria. Nunca modifique o status de uma doação sem registrar o autor e o token envolvido.
4. **Resiliência e Simulação no MVP**: Quando rodando no modo MVP, a IA deve garantir que os módulos de serviço (`src/services/db.js` e `src/services/geo.js`) usem `LocalStorage` de forma transparente caso a conexão com a API de produção falhe ou não esteja configurada no ambiente.
5. **Legibilidade e Código Limpo**: Escreva códigos limpos, modulares e autoexplicativos. Mantenha comentários detalhados e javadoc/JSDoc documentando parâmetros de entrada e saídas de métodos críticos.
