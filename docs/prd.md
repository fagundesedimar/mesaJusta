# Definição de Requisitos do Produto (PRD)

## Descrição do produto

**Problema** 
O desperdício de alimentos é um dos grandes desafios sociais e ambientais da atualidade. Estabelecimentos comerciais (supermercados, padarias, restaurantes) descartam diariamente toneladas de alimentos próprios para consumo próximo do vencimento devido à falta de canais estruturados de doação. Por outro lado, ONGs e instituições beneficentes que combatem a fome carecem de visibilidade centralizada de doações, sofrem com logística de retirada ineficiente e gastam tempo excessivo com comunicação descentralizada, o que resulta na perda de alimentos perecíveis.

**Solução** 
O **Mesa Justa: Circuito Solidário** é uma plataforma digital centralizada e integrada (Web responsivo com suporte Desktop nativo via Electron) que conecta em tempo real estabelecimentos doadores a ONGs parceiras. A plataforma otimiza a logística de coleta através de geolocalização e raio de busca inteligente, automatiza alertas de vencimento, gerencia reservas exclusivas de alimentos e garante total rastreabilidade. Adicionalmente, possui um sistema de incentivo ("Moeda Verde" e ranking de engajamento) para fidelizar e engajar doadores na agenda ESG (Governança Ambiental, Social e Corporativa).

Para o **público-alvo (estabelecimentos comerciais e ONGs beneficentes)**, a solução traz como principais ganhos a redução do desperdício de insumos e custos de descarte para os doadores, otimização operacional de coleta e visibilidade centralizada para as ONGs, transparência sobre a entrega do alimento às famílias vulneráveis e comprovação auditável do impacto socioambiental gerado.

Nossos Diferenciais:

- **Matching por Geolocalização Inteligente**: Exibição de doações ordenadas por menor distância linear real e raio de busca personalizável para apoiar o planejamento logístico das ONGs.
- **Gamificação e Incentivo Social ("Moeda Verde")**: Sistema de moedas digitais e rankings de engajamento baseados no volume doado (em kg) para fomentar a responsabilidade socioambiental corporativa.
- **Rastreabilidade e Log de Auditoria**: Registro completo de todos os estados críticos da doação (Disponível, Reservada, Retirada, Expirada), garantindo conformidade sanitária e conformidade com a LGPD.
- **Dashboard de Impacto Integrado**: Métricas completas que traduzem quilos de alimentos poupados em benefícios tangíveis (famílias estimadas alimentadas e emissões de CO2 equivalentes evitadas).
- **Dualidade de Acesso**: Interface altamente polida e responsiva para navegadores web/mobile, embarcada nativamente no desktop do estabelecimento através do Electron.

---

## Perfis de Usuário

O ecossistema é formado por três perfis de usuários principais que operam em conjunto:

### Gestor de ONG (Ana Silva)

- **Problemas**: Falta de canal unificado para encontrar excedentes, tempo desperdiçado em contatos telefônicos frustrados, combustível e logística ineficientes, e alimentos vencendo antes que possam ser coletados.
- **Objetivos**: Descobrir alimentos disponíveis nas proximidades de forma instantânea, realizar a reserva imediata para garantir a coleta e coordenar equipes para retirada rápida.
- **Dados demográficos**: 35 a 50 anos, ensino superior completo, reside em polos urbanos de SP ou MG, utiliza celular e computador diariamente para coordenar as atividades da ONG.
- **Motivações**: Combater a insegurança alimentar em sua região e otimizar os recursos humanos e financeiros escassos da instituição.
- **Frustrações**: Fazer deslocamentos longos para retirar alimentos e descobrir na chegada que eles já estragaram ou foram destinados a outros.

---

### Responsável pelo Estabelecimento Doador (Carlos Oliveira)

- **Problemas**: Descarte diário inevitável de excedentes adequados para consumo, falta de tempo da equipe para gerenciar contatos manuais com ONGs e ausência de relatórios formais de impacto das ações sociais do comércio.
- **Objetivos**: Disponibilizar lotes de alimentos excedentes com apenas alguns cliques, garantir que sejam coletados rapidamente por ONGs credenciadas e monitorar o impacto social da marca.
- **Dados demográficos**: 30 a 45 anos, gerente operacional ou proprietário de comércio (padaria, hortifrúti, supermercado local) localizado em SP ou MG.
- **Motivações**: Praticar a responsabilidade social corporativa, engajar colaboradores e diminuir o volume de resíduos orgânicos descartados.
- **Frustrações**: Enfrentar burocracia complexa para doações de alimentos e a falta de retorno (feedback) de que o alimento de fato chegou a quem precisa.

---

### Administrador da Plataforma (Juliana Souza)

- **Problemas**: Falta de visibilidade macro das operações para comprovar a eficiência do ecossistema e complexidade na moderação e segurança cadastral de múltiplos estabelecimentos e ONGs.
- **Objetivos**: Monitorar o fluxo geral de doações, extrair métricas de impacto socioambiental para prestação de contas a parceiros, e atuar na resolução de conflitos e auditoria de transações críticas.
- **Dados demográficos**: 28 a 40 anos, formação em administração, gestão de tecnologia ou sustentabilidade, facilidade com ferramentas digitais de análise de dados.
- **Motivações**: Escalar o impacto do projeto "Mesa Justa" em nível estadual e nacional, melhorando a governança do terceiro setor.
- **Frustrações**: Cadastros de parceiros incompletos ou inadequados e ineficiências na coleta que enfraquecem a confiança da rede de parceiros.

---

## Principais Funcionalidades

### RFN-01 Cadastro, Credenciamento e Autenticação

- **Descrição**: O sistema deve permitir o cadastro de três tipos de usuários (Doador, ONG e Administrador). O cadastro de Doadores exige CNPJ e dados de endereço completos para cálculo de coordenadas. O cadastro de ONGs exige comprovação de constituição legal. O login deve validar credenciais com segurança e direcionar o usuário para a sua visão específica.
- **Critérios de Aceitação**:
  - O fluxo de cadastro deve validar o formato de CNPJ (14 dígitos) e exigir o preenchimento da localização geográfica (endereço com CEP).
  - O sistema deve restringir o cadastro inicial a endereços localizados apenas nos estados de São Paulo (SP) e Minas Gerais (MG).
  - O controle de acesso (RBAC) deve impedir que ONGs editem ou excluam doações de terceiros, e que Doadores acessem as reservas de outras entidades.

### RFN-02 Cadastro e Gestão de Lotes de Doação

- **Descrição**: O estabelecimento doador pode cadastrar novos lotes de alimentos excedentes preenchendo as características essenciais: Nome do alimento, Categoria (Hortifrúti, Panificados, Laticínios, Mercearia, Proteínas, Refeições prontas), Peso (em kg), Data de Validade e Recomendações de Transporte. O sistema deve alterar automaticamente o status para "Expirada" caso o lote atinja a data limite sem ter sido reservado ou retirado.
- **Critérios de Aceitação**:
  - O formulário de cadastro deve bloquear datas de validade anteriores ao dia atual.
  - Ao salvar, a doação deve ser inserida com status "Disponível".
  - Um script interno/temporizador ou rotina ao carregar o sistema deve verificar as datas de validade e atualizar as doações expiradas de "Disponível" ou "Reservada" para "Expirada".

### RFN-03 Geolocalização e Filtro por Distância

- **Descrição**: O sistema deve integrar um mecanismo de cálculo de distância (fórmula de Haversine com base nas coordenadas) para permitir que a ONG encontre doações disponíveis ordenadas pela proximidade de sua sede. O usuário de ONG deve poder filtrar as doações por distância máxima em quilômetros (raio de busca), além de filtros por Categoria e Cidade/Estado.
- **Critérios de Aceitação**:
  - O sistema deve calcular automaticamente a distância entre a sede da ONG logada e os estabelecimentos doadores.
  - A listagem de doações disponíveis deve ser exibida, por padrão, da menor distância para a maior.
  - O filtro de distância deve disponibilizar opções dinâmicas (ex: "até 5 km", "até 15 km", "até 30 km", "qualquer distância").

### RFN-04 Painel de Visualização com Mapa Interativo

- **Descrição**: Para otimizar a rota logística de retirada e a tomada de decisão das ONGs, o sistema deve dispor de uma interface de mapa interativo (via biblioteca Leaflet/OpenStreetMap no front-end) sinalizando com marcadores (pins) coloridos os estabelecimentos com doações "Disponíveis". Ao clicar no marcador, uma janela (popup) exibe as informações resumidas do lote e o botão de reserva.
- **Critérios de Aceitação**:
  - O mapa deve centralizar-se automaticamente nas coordenadas da ONG logada.
  - Os marcadores devem carregar apenas doações ativas ("Disponíveis").
  - O popup do marcador no mapa deve conter o nome do estabelecimento, descrição do alimento, peso e o atalho para realizar a reserva rápida.

### RFN-05 Sistema de Reserva Exclusiva de Alimentos

- **Descrição**: A ONG interessada em um lote disponível pode efetuar sua reserva. Uma vez acionada, a doação tem seu status atualizado para "Reservada" e é gerado um código único de retirada alfanumérico (Token). Apenas a ONG que realizou a reserva tem o direito de visualizar o endereço detalhado de coleta e confirmar a retirada.
- **Critérios de Aceitação**:
  - A reserva deve mudar o status de "Disponível" para "Reservada" em tempo real, impedindo que outras ONGs vejam ou tentem reservar o mesmo item.
  - O sistema deve gerar um token aleatório de 6 caracteres (ex: MJ-849A) para validação no ato da retirada física.
  - Deve ser disponibilizado um botão de "Cancelar Reserva" para a ONG, retornando o lote ao status "Disponível".

### RFN-06 Registro de Coleta e Rastreabilidade

- **Descrição**: Permite a finalização do ciclo de doação. No ato da retirada física, o Doador ou a ONG acessa a plataforma e insere o Token de Retirada para confirmar a entrega. O status da doação passa de "Reservada" para "Retirada", disparando os cálculos de métricas de impacto e atualizando os pontos de fidelidade.
- **Critérios de Aceitação**:
  - O sistema só deve permitir a alteração do status para "Retirada" após a inserção e validação correta do Token de Retirada gerado no RFN-05.
  - Todas as transações de alteração de status devem gravar um registro imutável no log de auditoria do sistema, contendo: ID da doação, ID da ONG, ID do Doador, data/hora da transação, e usuário executor.

### RFN-07 Gamificação: Moedas Verdes e Ranking ESG

- **Descrição**: Para incentivar a participação constante de estabelecimentos comerciais, o sistema deve computar "Moedas Verdes" para cada doação finalizada com o status "Retirada". A plataforma deve exibir um painel com o ranking público das marcas doadoras mais engajadas da região.
- **Critérios de Aceitação**:
  - O cálculo padrão será: $1 \text{ kg de alimento retirado} = 10 \text{ Moedas Verdes}$. Lotes categorizados como "Refeições Prontas" ou "Proteínas" possuem multiplicador de 1.5x na pontuação.
  - O ranking deve listar os top 10 estabelecimentos ordenados por Moedas Verdes acumuladas no mês corrente.
  - O estabelecimento doador deve ter uma área exclusiva exibindo o seu selo virtual conquistado com base nos pontos (Ex: Selo Bronze, Prata, Ouro).

### RFN-08 Relatório de Impacto e Auditoria Geral (Admin)

- **Descrição**: Painel centralizado para o Administrador monitorar a integridade da plataforma e visualizar indicadores consolidados de impacto. O painel deve calcular o total de alimentos salvos (em toneladas), a estimativa de emissão de gases do efeito estufa evitada (cálculo de CO2 evitado baseado em fatores padrões para resíduos alimentares) e número de refeições complementadas.
- **Critérios de Aceitação**:
  - O painel deve exibir em destaque cartões de métricas (KPIs): Total Kg Doados, Famílias Beneficiadas Estimadas (considerando $1\text{ kg} = 2 \text{ refeições}$), CO2 Evitado ($1\text{ kg de alimento evitado do aterro} = 2.5\text{ kg de CO2eq}$ de acordo com estimativas de pegada de carbono).
  - O Administrador deve poder visualizar a lista completa de logs de auditoria do sistema (RFN-06) e filtrar por período ou tipo de operação.

---

## Requisitos Não Funcionais

### RNF-01 - Desempenho e Latência de Busca

- A busca por doações por proximidade e a renderização dos pins no mapa geográfico devem carregar em tempo inferior a 1,5 segundos sob condições normais de rede (3G/4G simulada).

### RNF-02 - Segurança da Informação e Privacidade (LGPD)

- A plataforma deve proteger os dados pessoais e operacionais dos cadastrados de acordo com a LGPD brasileira. Senhas de acesso devem ser salvas de forma segura no banco/armazenamento local usando hashing (SHA-256 ou similar) e informações de geolocalização exata dos estabelecimentos e ONGs não devem ser expostas publicamente sem a devida autenticação de perfil envolvido no fluxo.

### RNF-03 - Compatibilidade e Empacotamento Desktop (Electron)

- O frontend do sistema deve ser compatível com os principais navegadores de mercado (Chrome, Edge, Firefox, Safari) e empacotável usando Electron para execução integrada em desktops Windows (Windows 10 e 11) mantendo a responsividade do layout.

### RNF-04 - Disponibilidade e Cache Local

- O sistema web deve operar com alta disponibilidade (meta de 99,9%). No lado do cliente, dados de sessões e histórico de retiradas devem persistir localmente via LocalStorage para permitir visualizações de relatórios mesmo quando o cliente estiver temporariamente desconectado.

### RNF-05 - Usabilidade e Acessibilidade (Design System Premium)

- A interface deve seguir um design responsivo e acessível (contraste mínimo de 4.5:1 para elementos de texto, em linha com WCAG 2.1). Deve possuir um design premium, com uma paleta de cores harmoniosa centrada em tons de verde ecológico, suporte a modo escuro/claro e micro-animações fluidas que sinalizam mudanças de status.

---

## Métricas de Sucesso

O sucesso do produto Mesa Justa será medido com base nos seguintes indicadores operacionais quantitativos e qualitativos:

- **Volume de Alimentos Redistribuídos**: Meta de atingir 5 toneladas de alimentos redistribuídos no primeiro semestre de operação do MVP nos estados de atuação (SP e MG).
- **Tempo Médio de Retirada (SLA)**: Reduzir de dias para menos de 12 horas o tempo entre o cadastro do lote de alimento e a sua retirada física pela ONG.
- **Eficiência Logística das ONGs**: Reduzir em pelo menos 40% as horas gastas pelos gestores de ONGs na coordenação e planejamento de retiradas comparado ao modelo tradicional (telefone/planilha).
- **Adoção e Retenção do MVP**: Alcançar a adesão de mais de 50 estabelecimentos doadores ativos e 25 ONGs recorrentes cadastradas nos primeiros 3 meses de operação piloto.
- **Taxa de Desperdício Operacional**: Menos de 15% das doações cadastradas no sistema devem atingir o status "Expirada", demonstrando a efetividade das reservas e da logística integrada.

---

## Premissas e restrições

- **Premissa 1**: Os estabelecimentos doadores dispõem de conexão estável com a internet no local onde os alimentos são triados.
- **Premissa 2**: As ONGs participantes possuem veículos próprios ou parceiros, caixas térmicas e equipe disponível para retirar os alimentos nos locais indicados pelos doadores.
- **Premissa 3**: As ONGs são integralmente responsáveis por validar a qualidade final do alimento no ato da retirada e cadastrar/selecionar as famílias em vulnerabilidade que serão beneficiárias das doações.
- **Restrição 1 (Física)**: A plataforma não providencia e não se responsabiliza pelo transporte físico de alimentos, atuando estritamente como a camada de software de matching e controle.
- **Restrição 2 (Geográfica)**: A operação inicial do MVP está estritamente restrita aos estados de Minas Gerais (MG) e São Paulo (SP).
- **Restrição 3 (Financeira)**: O sistema não processa transações de natureza financeira (pagamentos, vendas, taxas). O circuito de doações é inteiramente gratuito.
- **Restrição 4 (Legal/Sanitária)**: A plataforma não substitui a conformidade com as exigências sanitárias locais (Anvisa) e leis de doação de alimentos vigentes (Lei nº 14.016/2020), cuja responsabilidade civil recai sobre os respectivos estabelecimentos e ONGs.

---

## Escopo

O desenvolvimento e implantação do Mesa Justa está dividido em fases incrementais:

### Versão 1: MVP (Minas Gerais e São Paulo)
*   **Cadastro e Autenticação**: Perfis específicos para Doadores, ONGs e Administradores com fluxo simplificado.
*   **Gestão de Alimentos**: Formulário para cadastro de alimentos doadores, alteração de status e controle de validade automático no front-end.
*   **Matching e Geolocalização**: Busca de doações próximas com cálculo de distância simulado (fórmula de Haversine baseada em endereços cadastrados) e mapa geográfico interativo integrado com Leaflet/OpenStreetMap.
*   **Reservas e Retirada**: Processo de reserva de lotes com geração de código token e confirmação da retirada física.
*   **Gamificação Piloto**: Atribuição automática de Moedas Verdes e ranking geral dos doadores.
*   **Painel Administrativo MVP**: KPI's de impacto social e ambiental simples (peso total salvo, estimativa de CO2 evitado) e listagem simples de log de auditoria.
*   **Distribuição**: Aplicação web responsiva e pacote desktop integrado com Electron.

### Versão 2: Expansão e Automação (Próximas Releases)
*   **Rotas Otimizadas**: Integração com API do Google Maps/Mapbox para desenhar trajetos otimizados ligando múltiplas retiradas para o motorista da ONG.
*   **Notificações Push e SMS/WhatsApp**: Disparo automático de alertas para as ONGs cadastradas em um raio de até 10km quando um novo estabelecimento cadastrar uma doação de perecíveis rápidos.
*   **Relatório de ESG Certificado**: Geração de relatórios anuais de sustentabilidade e responsabilidade social em PDF, auditáveis com assinatura digital, para que empresas participantes utilizem em seus balanços corporativos.
*   **Mobile Nativo**: Aplicativo dedicado e otimizado para celulares Android e iOS visando facilitar o uso pelos motoristas e voluntários em campo.
*   **Logística Colaborativa**: Módulo para voluntários individuais se cadastrarem e ajudarem no frete/transporte entre doadores e ONGs.
