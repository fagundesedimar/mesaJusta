# Especificação de Requisitos (SRS) - Mesa Justa: Circuito Solidário

## 1. Introdução

Este documento apresenta a Especificação de Requisitos do sistema **Mesa Justa: Circuito Solidário**. O objetivo deste documento é detalhar formalmente as funcionalidades, limites operacionais, critérios de aceitação e atributos de qualidade do software. Ele servirá como base de desenvolvimento para a equipe de engenharia e como guia para a validação nos pipelines de testes.

### 1.1 Escopo do MVP (Versão 1)
O escopo inicial do produto está restrito geograficamente aos estados de **São Paulo (SP)** e **Minas Gerais (MG)**. O sistema funcionará como uma plataforma web responsiva encapsulada também como aplicativo Desktop nativo Windows via Electron. Ele não gerencia logística de frete ou transporte físico e não realiza transações financeiras.

---

## 2. Atores do Sistema

Os seguintes atores interagem com o sistema Mesa Justa:

-   **Estabelecimento Doador (Carlos)**: Representa padarias, supermercados, restaurantes e comércios locais que possuem excedente de comida e desejam cadastrar doações, acompanhar seu saldo de Moedas Verdes e validar coletas.
-   **ONG / Receptor (Ana)**: Representa cozinhas comunitárias, bancos de alimentos e instituições beneficentes que buscam doações próximas, reservam lotes, traçam rotas e realizam a coleta física dos alimentos.
-   **Administrador (Juliana)**: Profissional responsável por gerenciar cadastros, monitorar a integridade da plataforma, auditar transações críticas e extrair relatórios de impacto socioambiental (ESG).

---

## 3. Requisitos Funcionais (RF)

Esta seção detalha os Requisitos Funcionais do sistema, mapeando-os com identificadores únicos.

### RF-01 - Cadastro e Autenticação de Usuários
-   **Descrição**: O sistema deve permitir o cadastro seguro de estabelecimentos doadores e ONGs beneficentes, exigindo e-mail corporativo, senha (criptografada) e dados cadastrais como CNPJ e endereço completo (com coordenadas geográficas geradas a partir do CEP).
-   **Critérios de Aceitação**:
    -   O cadastro só deve ser finalizado se o CNPJ/CPF for válido e o CEP pertencer aos estados de SP ou MG.
    -   A autenticação de usuário deve gerar um token JWT seguro de sessão.
    -   Exclusão lógica de contas (Soft Delete) deve ser suportada para manter o histórico de auditoria intacto.

### RF-02 - Cadastro de Lotes de Doação de Alimentos
-   **Descrição**: Permite que o Estabelecimento Doador cadastre lotes de alimentos excedentes adequados para consumo. O lote deve conter: nome do alimento, categoria, peso total (kg), data de validade e orientações de conservação/transporte.
-   **Critérios de Aceitação**:
    -   A data de validade informada no formulário de cadastro deve ser obrigatoriamente igual ou superior à data atual.
    -   Ao salvar o formulário, o status da doação é definido automaticamente como "Disponível".

### RF-03 - Monitoramento Automático de Validade
-   **Descrição**: O sistema deve verificar de forma contínua ou no carregamento da aplicação as datas de validade das doações ativas.
-   **Critérios de Aceitação**:
    -   Se uma doação no status "Disponível" ou "Reservada" atingir ou ultrapassar a data limite de validade sem que a retirada física tenha sido confirmada, seu status deve mudar automaticamente para "Expirada", removendo-a da lista de buscas ativas.

### RF-04 - Busca e Filtro de Doações por Proximidade
-   **Descrição**: Permite que as ONGs consultem doações disponíveis próximas à sua sede através do cálculo de geolocalização linear (fórmula de Haversine).
-   **Critérios de Aceitação**:
    -   As doações mostradas na lista e no mapa devem ser ordenadas por menor distância em quilômetros.
    -   Deve permitir filtrar por raio de busca (ex: 5km, 15km, 30km) e por categorias de alimento.

### RF-05 - Visualização Cartográfica (Mapa Interativo)
-   **Descrição**: Renderiza uma interface cartográfica interativa (OpenStreetMap/Leaflet) sinalizando a localização da ONG e pins com as localizações das doações disponíveis.
-   **Critérios de Aceitação**:
    -   Clicar no pin de uma doação abre um popup com os detalhes do lote (alimento, peso, validade) e botão de reserva rápida.

### RF-06 - Reserva Exclusiva de Doações
-   **Descrição**: Permite que uma ONG selecione uma doação de status "Disponível" e faça a sua reserva temporária.
-   **Critérios de Aceitação**:
    -   Ao confirmar a reserva, o status da doação muda para "Reservada", ficando invisível para outras ONGs.
    -   O sistema gera um Token de Retirada alfanumérico único de 6 caracteres (ex: `A94DF2`) exclusivo da ONG reservante.
    -   Permite que a ONG cancele a reserva, fazendo com que o lote retorne a ficar "Disponível".

### RF-07 - Confirmação de Retirada Física (Rastreabilidade)
-   **Descrição**: O sistema deve registrar o encerramento do ciclo da doação. Ao realizar a retirada presencial dos alimentos, o doador ou a ONG deve inserir o Token de Retirada para confirmar a transação.
-   **Critérios de Aceitação**:
    -   A transição do status do lote de "Reservada" para "Retirada" exige a digitação correta do Token de Retirada correspondente.
    -   O sistema deve registrar a data, hora, ID da ONG e do Doador no histórico de auditoria interna.

### RF-08 - Gamificação (Moedas Verdes e Ranking)
-   **Descrição**: O sistema pontua os doadores quando uma doação é concluída com sucesso (status "Retirada").
-   **Critérios de Aceitação**:
    -   Regra de pontuação padrão: $1\text{ kg} = 10\text{ Moedas Verdes}$.
    -   Lotes das categorias "Refeições Prontas" ou "Proteínas" possuem bônus multiplicador de 1.5x na pontuação.
    -   Um ranking com os 10 doadores com maior pontuação acumulada deve ser exibido publicamente na plataforma.

### RF-09 - Dashboard Analítico e Relatório ESG (Admin)
-   **Descrição**: Painel estatístico para o Administrador visualizar o impacto geral do ecossistema.
-   **Critérios de Aceitação**:
    -   Deve exibir métricas calculadas em tempo real: Total kg de alimentos redistribuídos, estimativa de refeições providas ($1\text{ kg} = 2\text{ refeições}$) e CO2 evitado ($1\text{ kg} = 2.5\text{ kg CO2eq}$).
    -   Deve permitir exportar um Relatório ESG contendo esses KPIs em formato estruturado.

---

## 4. Requisitos Não Funcionais (RNF)

Atributos de qualidade que definem como o sistema deve operar.

### RNF-01 - Desempenho e Latência
-   **Descrição**: A busca geolocalizada e renderização dos marcadores no mapa de doações próximas deve responder em menos de 1,5 segundos em conexões 3G/4G simuladas.

### RNF-02 - Segurança da Informação e LGPD
-   **Descrição**: Senhas de usuários devem ser encriptadas localmente no banco por algoritmo de hashing Bcrypt. A geolocalização exata dos estabelecimentos deve ser restrita apenas à ONG que efetuar a reserva para proteção de privacidade de endereço.

### RNF-03 - Portabilidade e Distribuição (Electron)
-   **Descrição**: O código front-end (HTML/CSS/JS) deve ser compatível com navegadores modernos (Chrome, Edge, Firefox, Safari) e empacotável usando Electron para funcionar nativamente no Windows 10/11.

### RNF-04 - Conectividade e Resiliência
-   **Descrição**: O sistema web deve possuir disponibilidade de 99,9% em produção. O front-end do Electron e navegadores mobile deve armazenar sessões locais e informações do dashboard em LocalStorage para garantir visualização estável offline.

### RNF-05 - Usabilidade e Acessibilidade
-   **Descrição**: A interface deve obedecer às regras do WCAG 2.1 com contraste mínimo de $4.5:1$ em elementos textuais, fontes responsivas e identificadores `aria-label` para leitores de tela em campo.

---

## 5. Casos de Uso (UC)

Esses casos de uso descrevem as interações entre os atores e o sistema.

### UC-01: Cadastrar e Disponibilizar Alimento
-   **Ator Principal**: Estabelecimento Doador (Carlos)
-   **Fluxo Principal**:
    1.  Carlos efetua login no sistema e acessa o Dashboard (`INT-02`).
    2.  Carlos clica no botão "+ Nova Doação".
    3.  O sistema exibe o Modal de Cadastro (`INT-03`).
    4.  Carlos preenche a descrição do alimento, peso, categoria e data de validade, e clica em "Salvar".
    5.  O sistema valida os dados e a data de vencimento.
    6.  O sistema insere o lote no banco com status "Disponível".
    7.  O sistema fecha o modal e atualiza a tabela de doações de Carlos.

### UC-02: Buscar e Reservar Alimento
-   **Ator Principal**: ONG Beneficente (Ana)
-   **Fluxo Principal**:
    1.  Ana efetua login no sistema e visualiza o Dashboard da ONG (`INT-04`) com o Mapa (`INT-05`).
    2.  Ana configura os filtros de raio de busca e clica em "Aplicar Filtros".
    3.  O sistema calcula a distância de cada lote ativo e atualiza os pins no mapa.
    4.  Ana clica no pin do Doador no mapa (`INT-05`).
    5.  O sistema exibe o popup informativo da doação.
    6.  Ana clica no botão "Reservar Lote".
    7.  O sistema altera o status da doação de "Disponível" para "Reservada" e gera o Token de Retirada.
    8.  O sistema redireciona Ana para a tela de Reservas Ativas (`INT-06`) onde o Token (`XXXXXX`) e os contatos de coleta são exibidos.

### UC-03: Validar e Concluir Coleta
-   **Atores**: Estabelecimento Doador (Carlos) e ONG Beneficente (Ana)
-   **Fluxo Principal**:
    1.  Ana visualiza o Token na tela de Reservas Ativas (`INT-06`) e comparece ao estabelecimento doador.
    2.  Ana apresenta o Token de Retirada para Carlos.
    3.  Carlos acessa a tabela de doações no Dashboard (`INT-02`) e clica em "Confirmar Entrega" ao lado da doação que consta como "Reservada".
    4.  O sistema exibe o campo para digitação do Token.
    5.  Carlos digita o Token e confirma.
    6.  O sistema valida o Token, altera o status do lote para "Retirada", credita os pontos de Moedas Verdes a Carlos e atualiza as telas de ambos os usuários.
    7.  O sistema grava uma entrada no Log de Auditoria.

### UC-04: Exportar Relatórios de Impacto ESG
-   **Ator Principal**: Administrador (Juliana)
-   **Fluxo Principal**:
    1.  Juliana faz login e entra no Dashboard Administrativo (`INT-07`).
    2.  Juliana seleciona o filtro de data das transações que deseja reportar.
    3.  Juliana clica em "Exportar Relatório ESG".
    4.  O sistema lê os dados de auditoria e tabelas do banco, compila o total de kg redistribuídos, famílias atendidas e emissões de carbono poupadas.
    5.  O sistema compila e faz o download automático de um relatório PDF.

---

## 6. Rastreabilidade de Requisitos

A tabela abaixo cruza os Requisitos Funcionais com as Interfaces (UI) correspondentes e com os Casos de Uso (UC):

| Requisito | Título do Requisito | Interface Gráfica (UI) | Caso de Uso (UC) |
| :--- | :--- | :--- | :--- |
| **RF-01** | Cadastro e Autenticação de Usuários | `INT-01` | N/A |
| **RF-02** | Cadastro de Lotes de Doação de Alimentos | `INT-03` | `UC-01` |
| **RF-03** | Monitoramento Automático de Validade | `INT-02`, `INT-04`, `INT-06` | `UC-01`, `UC-02` |
| **RF-04** | Busca e Filtro de Doações por Proximidade | `INT-04` | `UC-02` |
| **RF-05** | Visualização Cartográfica (Mapa Interativo) | `INT-05` | `UC-02` |
| **RF-06** | Reserva Exclusiva de Doações | `INT-06` | `UC-02` |
| **RF-07** | Confirmação de Retirada Física (Rastreabilidade) | `INT-02`, `INT-06` | `UC-03` |
| **RF-08** | Gamificação (Moedas Verdes e Ranking) | `INT-02` | `UC-03` |
| **RF-09** | Dashboard Analítico e Relatório ESG (Admin) | `INT-07` | `UC-04` |
