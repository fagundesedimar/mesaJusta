# Histórias de Usuário - Mesa Justa: Circuito Solidário

Este documento apresenta as Histórias de Usuário (User Stories) para o escopo inicial (MVP) do sistema **Mesa Justa**. Cada história segue o formato padrão e estabelece critérios de aceitação rigorosos e testáveis, servindo de base para o desenvolvimento do software e validação de QA.

---

## 1. Gestão de Acesso e Perfis

### US-01: Cadastro e Autenticação de Usuários
*   **Como** estabelecimento doador ou representante de ONG parceira,
*   **Quero** me cadastrar e autenticar de forma segura na plataforma,
*   **Para** acessar as funcionalidades específicas do meu perfil operacional.

**Critérios de Aceitação**:
1.  **Formato do CNPJ/CPF**: O formulário de cadastro deve validar o formato numérico correto do documento de identificação (CNPJ ou CPF).
2.  **Restrição Geográfica**: O sistema deve rejeitar cadastros com endereços que estejam fora dos estados de São Paulo (SP) e Minas Gerais (MG) nesta fase inicial do MVP.
3.  **Determinação de Perfil (RBAC)**: O usuário deve selecionar explicitamente se seu perfil é "Estabelecimento Doador" ou "ONG Beneficente".
4.  **Redirecionamento Pós-Login**:
    *   Estabelecimento Doador deve ser redirecionado ao Dashboard do Doador (`INT-02`).
    *   ONG deve ser redirecionada ao Dashboard de Busca/Mapa da ONG (`INT-04`).
    *   Administrador (Juliana) deve ser redirecionado ao Painel de Auditoria (`INT-07`).

---

## 2. Gestão de Doações

### US-02: Cadastro de Lote de Alimentos Excedentes
*   **Como** Carlos (Responsável pelo Estabelecimento Doador),
*   **Quero** cadastrar lotes de alimentos excedentes detalhando peso, categoria e validade,
*   **Para** disponibilizá-los na rede para que ONGs próximas possam reservá-los.

**Critérios de Aceitação**:
1.  **Validação de Data**: O sistema deve impedir o cadastro de lotes com data de validade retroativa (anterior ao dia atual).
2.  **Aviso de Vencimento Rápido**: Caso a data de validade selecionada seja o dia atual, o modal deve exibir um banner de alerta visual em âmbar indicando a necessidade de retirada imediata.
3.  **Definição de Status**: Ao salvar a doação, o lote deve receber automaticamente o status inicial "Disponível".
4.  **Categorização**: O usuário deve obrigatoriamente selecionar uma das categorias predefinidas (Hortifrúti, Panificados, Laticínios, Mercearia, Proteínas, Refeições Prontas).

### US-03: Monitoramento de Expiração de Alimentos (Job do Sistema)
*   **Como** sistema de governança do Mesa Justa,
*   **Quero** monitorar a validade das doações ativas e alterar o status para "Expirada" se ultrapassarem a data limite,
*   **Para** garantir que as ONGs não coletem alimentos impróprios para o consumo humano.

**Critérios de Aceitação**:
1.  **Gatilho de Expiração**: Doações com status "Disponível" ou "Reservada" cuja data de validade seja menor que o dia atual devem ser atualizadas automaticamente para o status "Expirada".
2.  **Ocultação nas Buscas**: Lotes com status "Expirada" devem parar de aparecer imediatamente nos resultados de busca e no mapa das ONGs.

---

## 3. Busca e Reserva de Doações

### US-04: Busca Geolocalizada de Alimentos
*   **Como** Ana (Gestora de ONG),
*   **Quero** pesquisar alimentos aplicando filtros de categoria e raio de proximidade em quilômetros,
*   **Para** encontrar doações ativas que façam sentido para a minha rota de coleta.

**Critérios de Aceitação**:
1.  **Cálculo de Proximidade**: O sistema deve calcular dinamicamente a distância linear (fórmula de Haversine) entre o endereço cadastrado da ONG e os estabelecimentos doadores.
2.  **Ordenação**: A listagem de doações ativas deve ser exibida, por padrão, da menor distância para a maior.
3.  **Filtro por Raio**: O usuário deve poder limitar a busca selecionando faixas de distância (ex: até 5km, 15km, 30km).
4.  **Cartão Informativo**: Cada item retornado na busca deve exibir de forma visível a distância em quilômetros (ex: "A 4.8 km de você").

### US-05: Mapa Interativo de Doações
*   **Como** Ana (Gestora de ONG),
*   **Quero** visualizar os lotes de alimentos disponíveis em um mapa interativo,
*   **Para** ter uma percepção visual rápida da localização geográfica dos doadores.

**Critérios de Aceitação**:
1.  **Centralização**: Ao carregar, o mapa deve centralizar-se automaticamente na localização geográfica da ONG conectada.
2.  **Pins de Localização**: Exibir marcadores georreferenciados distintos para a ONG (pin verde com ícone de casa) e para os doadores (pins laranjas).
3.  **Popup Informativo**: Clicar no pin de um doador deve abrir uma janela popup com o resumo do lote (nome do estabelecimento, alimento, peso, validade) e o botão para reserva rápida.

### US-06: Reserva Exclusiva de Lote
*   **Como** Ana (Gestora de ONG),
*   **Quero** reservar um lote de alimento disponível na plataforma,
*   **Para** garantir a exclusividade da retirada e receber as informações detalhadas para a coleta física.

**Critérios de Aceitação**:
1.  **Garantia de Exclusividade**: Ao confirmar a reserva, o status do lote deve mudar imediatamente de "Disponível" para "Reservada" na base de dados, bloqueando qualquer visualização ou tentativa de reserva por outras ONGs.
2.  **Geração de Token**: O sistema deve gerar e exibir na tela de reservas ativas um Token de Retirada único de 6 caracteres alfanuméricos (ex: `MJ-A94D`).
3.  **Desistência**: A ONG pode cancelar a reserva ativa na tela `INT-06`, o que retorna o lote de alimentos para o status "Disponível" no mapa.

---

## 4. Coleta, Rastreabilidade e Impacto

### US-07: Confirmação de Retirada Física via Token
*   **Como** Carlos (Responsável pelo Estabelecimento Doador) ou Ana (Gestora de ONG),
*   **Quero** confirmar a entrega do lote de alimentos inserindo o Token de Retirada gerado no sistema,
*   **Para** registrar a conclusão do ciclo operacional com segurança e rastreabilidade sanitária.

**Critérios de Aceitação**:
1.  **Validação do Token**: O sistema só deve permitir a mudança de status da doação de "Reservada" para "Retirada" se o Token inserido corresponder exatamente ao código gerado na reserva.
2.  **Registro de Auditoria**: A transação de retirada concluída deve gravar no histórico de auditoria do sistema: ID da doação, ID da ONG receptora, data, hora e dados do usuário executor.
3.  **Atualização de Status**: A doação com status "Retirada" é removida da lista de pendências de coleta do doador e da ONG.

### US-08: Acúmulo de Moedas Verdes e Ranking ESG
*   **Como** Carlos (Responsável pelo Estabelecimento Doador),
*   **Quero** acumular Moedas Verdes e visualizar meu ranking ESG,
*   **Para** comprovar a responsabilidade socioambiental do meu estabelecimento comercial.

**Critérios de Aceitação**:
1.  **Cálculo de Pontos**: Cada doação concluída com status "Retirada" gera para o doador $10 \text{ Moedas Verdes}$ por cada $1 \text{ kg}$ de alimento doado.
2.  **Multiplicador de Categoria**: Lotes das categorias "Refeições Prontas" ou "Proteínas" geram um bônus multiplicador de 1.5x nas Moedas Verdes ganhas.
3.  **Ranking Top 10**: O painel público deve exibir os 10 maiores doadores ordenados pela pontuação acumulada do mês.

---

## 5. Governança e Administração

### US-09: Painel de Indicadores e Logs de Auditoria
*   **Como** Juliana (Administradora da Plataforma),
*   **Quero** acompanhar os KPIs de impacto global e inspecionar a listagem dos logs de auditoria do sistema,
*   **Para** monitorar a saúde da rede de doações e extrair relatórios estruturados.

**Critérios de Aceitação**:
1.  **Fórmulas dos Cards de Impacto**:
    *   *Alimentos Salvos*: Soma do peso total de doações no status "Retirada" (em Toneladas).
    *   *Famílias Beneficiadas*: Valor estimado considerando que $1\text{ kg de alimento} = 2 \text{ refeições}$.
    *   *CO2 Evitado*: Valor estimado considerando que $1\text{ kg de alimento evitado do aterro} = 2.5\text{ kg de CO2eq}$.
2.  **Consulta de Logs**: O painel deve listar em formato tabular todos os eventos de transições de status gravados no log de auditoria, com paginação e filtro por período.
3.  **Exportação ESG**: O botão de exportação deve consolidar as métricas em formato PDF estruturado para download imediato.
