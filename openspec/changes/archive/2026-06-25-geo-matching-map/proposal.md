## Why

Para otimizar o planejamento logístico das ONGs parceiras, a plataforma deve exibir as doações disponíveis ordenadas por menor distância linear real em relação à sede da ONG, permitindo visualização em lista e em mapa cartográfico interativo.

## What Changes

- Ativação da extensão espacial PostGIS no PostgreSQL para armazenar e consultar coordenadas espaciais.
- Mecanismo de geocodificação de endereços via Nominatim API / OpenStreetMap no cadastro de CEP.
- Integração da biblioteca de mapas Leaflet.js no frontend da ONG (`INT-05`, com base na screen Stitch `cc426bdf2bf44a45907c3a27d8f0bc22`).
- Painel do Dashboard da ONG (`INT-04`, com base na screen Stitch `02fbebc52cb84cec87be2d445c72d37a`) contendo filtros de raio de busca e categoria, e lista lateral de doações ordenadas por menor distância.

## Capabilities

### New Capabilities
- `geo-matching-map`: Matching inteligente por geolocalização utilizando cálculo de distância por fórmula de Haversine via queries espaciais no banco de dados e interface com mapa Leaflet contendo marcadores e popups informativos de lotes.

### Modified Capabilities
<!-- Nenhuma capacidade existente será modificada nesta etapa -->

## Impact

- Queries de banco de dados (uso do PostGIS e índices espaciais GIST).
- API Route Handler `GET /api/v1/donations` (inclusão de parâmetros de latitude/longitude e raio de busca).
- Páginas e componentes do Dashboard da ONG.

---

## Detalhes do Planejamento de Execução

### Escopo Funcional
- Centralização automática do mapa nas coordenadas geográficas da ONG logada.
- Exibição de pins laranjas para doações e verde (ícone de casa) para a localização da própria ONG.
- Filtros por distância ("Até 5 km", "Até 15 km", "Até 30 km", "Qualquer distância") e por categoria de alimento.
- Lista lateral contendo cartões compactos de doações próximas com a quilometragem calculada (ex: "A 4.2 km de você").
- Popups informativos nos pins do mapa contendo detalhes da doação e atalho de reserva rápida.

### Dependências
- `donor-donations` (necessita que doações estejam cadastradas no banco com endereços válidos para cálculo de distância).

### Riscos
- Risco Médio: Sobrecarga em consultas espaciais sem índices GIST adequados, ou travamento da UI ao carregar muitos pins no mapa. Mitigado usando paginação/limitação de resultados, renderização otimizada no Leaflet, e índices GIST nas colunas de coordenadas.

### Execução de Linter Necessária
- Validação completa via ESLint (`npm run lint`).

### Testes Unitários Necessários
- Teste da fórmula matemática de Haversine (helper isolado) para garantir a precisão no cálculo de distância.
- Teste de renderização do componente de mapa interativo mockando a biblioteca Leaflet.js.

### Testes de Integração Necessários
- Query de busca espacial no banco PostgreSQL com dados de teste simulando distâncias diferentes, garantindo ordenação correta do mais próximo ao mais distante.
- Teste de resposta e formato do endpoint `GET /api/v1/donations` passando coordenadas e filtros de raio.

### Testes E2E Necessários
- Login como ONG, verificação de mapa centralizado na sua sede, conferência da lista lateral de doações com quilometragens consistentes, aplicação do filtro de distância a 5km (verificando ocultação de itens distantes).
