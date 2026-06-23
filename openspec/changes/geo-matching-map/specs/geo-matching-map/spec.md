## ADDED Requirements

### Requirement: Geocodificação automática de endereços de doação
O sistema SHALL converter o endereço/CEP informado no cadastro de doação em coordenadas geográficas (`latitude`, `longitude`) via API Nominatim no momento da criação, persistindo os valores nos campos correspondentes da doação.

#### Scenario: Geocodificação bem-sucedida no cadastro
- **WHEN** um Doador cria uma nova doação com endereço e CEP válidos
- **THEN** o sistema chama a Nominatim API e persiste `latitude` e `longitude` na doação antes de retornar `201 Created`

#### Scenario: Falha na geocodificação não bloqueia o cadastro
- **WHEN** a Nominatim API retorna erro ou timeout durante o cadastro de doação
- **THEN** o sistema persiste a doação com `latitude = null` e `longitude = null` e retorna `201 Created` sem expor o erro ao usuário final

### Requirement: Filtragem de doações por raio de distância geográfico
O sistema SHALL aceitar os parâmetros `lat`, `lng` e `radius` (em km) no endpoint `GET /api/v1/donations` e retornar apenas doações com coordenadas dentro do raio especificado, ordenadas da mais próxima à mais distante.

#### Scenario: Filtro por raio de 5 km
- **WHEN** a ONG consulta `GET /api/v1/donations?lat=-23.55&lng=-46.63&radius=5`
- **THEN** o sistema retorna apenas doações com coordenadas a até 5 km das coordenadas fornecidas, ordenadas por distância crescente

#### Scenario: Filtro sem raio (qualquer distância)
- **WHEN** a ONG consulta `GET /api/v1/donations` sem parâmetros de geolocalização
- **THEN** o sistema retorna todas as doações disponíveis sem filtro espacial (comportamento existente mantido)

#### Scenario: Distância calculada retornada no payload
- **WHEN** a query inclui parâmetros de geolocalização
- **THEN** cada item do array de doações retornado inclui o campo `distanceKm` com a distância calculada arredondada a 1 decimal (ex: `4.2`)

### Requirement: Mapa interativo Leaflet no dashboard da ONG
O sistema SHALL exibir um mapa Leaflet.js no dashboard da ONG (`INT-05`) centralizado nas coordenadas da sede da ONG logada, com pins laranjas para doações disponíveis e um pin verde (ícone de casa) para a própria ONG.

#### Scenario: Mapa centralizado na sede da ONG
- **WHEN** uma ONG autenticada acessa o dashboard de mapa
- **THEN** o mapa é centralizado nas coordenadas cadastradas da ONG com zoom padrão 13

#### Scenario: Pins de doações no mapa
- **WHEN** o mapa é carregado com doações disponíveis no raio selecionado
- **THEN** cada doação com coordenadas válidas é exibida como um pin laranja no mapa

#### Scenario: Pin da ONG no mapa
- **WHEN** o mapa é carregado
- **THEN** a sede da ONG logada é exibida como um pin verde (ícone de casa) no mapa

#### Scenario: Popup informativo ao clicar no pin da doação
- **WHEN** o usuário clica em um pin laranja de doação
- **THEN** um popup exibe: nome do Doador, categoria, peso em kg, distância em km, e link "Reservar Lote"

### Requirement: Lista lateral de doações ordenadas por proximidade
O sistema SHALL exibir uma lista lateral no dashboard da ONG com cartões compactos das doações próximas, cada um contendo quilometragem calculada e ordenados da mais próxima para a mais distante.

#### Scenario: Lista exibe doações ordenadas por distância
- **WHEN** a ONG acessa o dashboard com filtro de raio aplicado
- **THEN** a lista lateral exibe cartões de doações em ordem crescente de distância, com texto como "A 4.2 km de você"

#### Scenario: Filtro de distância atualiza lista e mapa simultaneamente
- **WHEN** a ONG altera o filtro de raio (ex: de "Até 15 km" para "Até 5 km")
- **THEN** a lista lateral e os pins do mapa são atualizados para exibir apenas doações dentro do novo raio selecionado

#### Scenario: Filtro por categoria de alimento
- **WHEN** a ONG seleciona uma categoria de alimento no filtro
- **THEN** apenas doações da categoria selecionada são exibidas na lista lateral e no mapa
