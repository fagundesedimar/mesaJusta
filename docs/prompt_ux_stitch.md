# Prompt de Prototipagem - Mesa Justa: Circuito Solidário

Este arquivo contém um prompt estruturado para ser utilizado em ferramentas de geração de protótipos de interface assistidas por IA (como Google Stitch, Figma GenAI ou v0.dev). O prompt atua sob o papel de um **Designer de UX Sênior** e fornece todas as regras, tokens de design, layouts de telas e fluxos de navegação definidos no projeto.

---

## Como usar este prompt
Copie o bloco de texto abaixo e insira-o no campo de instruções da sua ferramenta de prototipagem baseada em IA (como o Google Stitch) para gerar os templates interativos de alta fidelidade para o **Mesa Justa**.

---

```text
Atue como: Engenheiro de Design e Protótipos de UI Sênior.

Instrução: Crie um protótipo de alta fidelidade e totalmente interativo contendo templates para o projeto de software "Mesa Justa: Circuito Solidário" (Plataforma Web responsiva com suporte desktop). O design deve ser premium, moderno e limpo, aplicando conceitos de Glassmorphism e seguindo rigorosamente as diretrizes e interfaces listadas abaixo.

### 1. GUIA DE DESIGN (DESIGN SYSTEM)
- Tipografia: Fonte do Google Fonts 'Inter' ou 'Outfit'. Títulos principais com peso 700 (bold), títulos secundários 500 (medium) e textos de corpo 400 (regular).
- Paleta de Cores:
  * Verde Primário (Marca/Eco): #0e3a2f (Verde esmeralda profundo).
  * Verde de Sucesso/Ação: #1b5e20 ou #2e7d32 (Verde folha vivo para botões principais e "+ Nova Doação").
  * Âmbar/Destaque: #ff6f00 (Laranja quente para avisos, datas críticas e pins de doações no mapa).
  * Fundo Claro: #f5f5f5 (Cinza muito claro e limpo).
  * Fundo Escuro (Modo Escuro): #121212.
- Efeito Glassmorphism: Aplique em cabeçalhos de dashboards, sidebars e janelas modais o estilo "backdrop-filter: blur(8px)" com borda fina semitransparente "border: 1px solid rgba(255, 255, 255, 0.15)".
- Responsividade: Interfaces com grids adaptáveis para mobile (1 coluna) e desktop (layout com sidebar lateral).
- Acessibilidade: Contraste de texto mínimo de 4.5:1 (WCAG 2.1).

---

### 2. ESTRUTURA DOS TEMPLATES DE TELA (INTERFACES)

Gere os templates funcionais para as seguintes 7 interfaces gráficas:

#### [INT-01] - Tela de Login e Cadastro (Autenticação)
- Contêiner: Tela cheia com fundo gradiente verde-escuro (#0e3a2f) e um painel de login centralizado com efeito glassmorphism.
- Estado 1 (Login):
  * Campos: E-mail (email input), Senha (password input).
  * Botões: "Entrar" (Estilo principal), "Criar Conta" (Outline link toggle).
  * Links: "Esqueci minha senha".
- Estado 2 (Cadastro - alterna via clique):
  * Campos adicionais: Razão Social/Nome, Tipo de Perfil (Dropdown: "Estabelecimento Doador" ou "ONG Beneficente"), CNPJ/CPF, CEP, Endereço Completo (Bairro, Cidade, Estado restrito a MG/SP).
  * Botões: "Confirmar Cadastro", "Voltar para Login".

#### [INT-02] - Dashboard do Estabelecimento Doador (Carlos)
- Contêiner: Layout com Sidebar fixa na esquerda (Verde escuro #0e3a2f) contendo links de navegação. Área de conteúdo principal na direita com grid.
- Painel de Indicadores (Cartões):
  * Card 1: "Total de Alimentos Doados" (Texto destacado: "245 kg").
  * Card 2: "Moedas Verdes" (Texto destacado: "2.450 MV" com badge brilhante "Selo Ouro").
- Tabela de Doações Cadastradas:
  * Colunas: Alimento, Categoria, Peso (kg), Validade, Status (Disponível, Reservada, Retirada, Expirada).
- Botões:
  * Botão em destaque "+ Nova Doação" (Cor verde folha #2e7d32) posicionado no topo.
  * Botão de ação rápida "Confirmar Entrega" (Apenas nas doações com status "Reservada").

#### [INT-03] - Modal de Cadastro de Lote de Alimentos (Doador)
- Contêiner: Janela modal sobreposta centralizada com fundo desfocado atrás.
- Campos: Nome do Alimento (Text input), Categoria (Dropdown: Hortifrúti, Panificados, Laticínios, Mercearia, Proteínas, Refeições Prontas), Peso Total (kg - Number input), Data de Validade (Datepicker), Recomendações de Transporte (Text area).
- Botões: "Salvar e Disponibilizar" (Sucesso verde), "Cancelar" (Cinza/dismiss).
- Comportamento: Exibir banner de alerta em laranja (#ff6f00) se a data de validade for o dia atual.

#### [INT-04] - Dashboard da ONG (Ana)
- Contêiner: Sidebar na esquerda. Conteúdo principal em duas colunas: Coluna esquerda com Mapa Interativo (INT-05) e barra de filtros superior; Coluna direita com a lista compacta de doações disponíveis.
- Controles de Filtro: Dropdown de distância ("Até 5km", "Até 15km", "Qualquer") e checkboxes de categorias de alimentos.
- Lista Lateral de Doações: Cartões exibindo Nome do Alimento, Peso, Validade e a distância exata em km (ex: "A 3.5 km de distância").

#### [INT-05] - Mapa Interativo de Doações (ONG)
- Contêiner: Painel de mapa interativo (simulação de Leaflet.js).
- Elementos:
  * Pin verde central ("Sua Localização").
  * Pins laranjas geolocalizados representando estabelecimentos com lotes ativos.
  * Popup Informativo (abre ao clicar nos pins laranjas) mostrando: "Supermercado Silva", "15kg de Panificados", "Expira em 12h" e um botão destacado "Reservar Lote".

#### [INT-06] - Painel de Reservas Ativas (ONG)
- Contêiner: Tabela de conteúdo na área central do Dashboard da ONG.
- Campos: Detalhes do Alimento, Nome do Doador, Endereço de Coleta.
- Componente Destaque: Caixa de Token de Retirada (fonte monoespaçada, tamanho grande, ex: "MJ-48F9").
- Botões/Links: "Cancelar Reserva" (Vermelho), "Copiar Código", e Link "Ver Rota de Retirada" (Abre nova aba com ícone de mapa).

#### [INT-07] - Dashboard Administrativo e Auditoria (Juliana)
- Contêiner: Painel estatístico para Administradores.
- Cartões analíticos principais:
  * "Alimentos Salvos" (Ex: "12.4 Toneladas").
  * "Famílias Atendidas" (Ex: "24.800 pessoas").
  * "CO2 Evitado" (Ex: "31.000 kg CO2eq").
- Tabela de Logs de Auditoria:
  * Colunas: Data/Hora, Usuário, Operação, Token de Retirada, Detalhes.
- Botão: "Exportar Relatório ESG" (Gera PDF simulado no canto superior direito).

---

### 3. FLUXO DE NAVEGAÇÃO E INTERAÇÃO
Implemente as seguintes transições interativas de tela:
1. Autenticação: Ao logar em [INT-01], redirecione de acordo com o perfil:
   - "Doador" -> Dashboard Doador [INT-02].
   - "ONG" -> Dashboard ONG [INT-04].
   - "Admin" -> Dashboard Admin [INT-07].
2. Doador: Clique em "+ Nova Doação" abre modal [INT-03]. Clicar em "Salvar" fecha modal e insere na tabela de [INT-02].
3. ONG: Clique em pin de doação no mapa [INT-05] abre popup. Clique em "Reservar Lote" no popup redireciona para a tela de Reservas Ativas [INT-06] exibindo o token correspondente.
4. Conclusão: No Dashboard Doador [INT-02], ao clicar em "Confirmar Entrega" insira o token gerado na tela da ONG [INT-06]. Após validação, atualize o status para "Retirada", incremente os pontos de Moedas Verdes e registre no log de [INT-07].
```
