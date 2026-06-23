## Context

O Mesa Justa já possui o cadastro de doações com endereços (`donor-donations`). Atualmente as ONGs visualizam doações em lista plana sem qualquer ordenação por proximidade geográfica, o que dificulta o planejamento logístico. A extensão PostGIS ainda não está ativa no banco de dados do projeto.

**Stack relevante**: Next.js App Router, Prisma ORM + PostgreSQL + PostGIS, Leaflet.js (já referenciado no spec_tech.md), Vanilla CSS, Nominatim/OpenStreetMap para geocodificação gratuita.

**Constraints**:
- Sem uso de APIs pagas de mapas (Google Maps, Mapbox) para exibição do mapa — somente Leaflet + OpenStreetMap tiles.
- Geocodificação de endereço: Nominatim API (gratuita, sem chave), chamada uma única vez no cadastro.
- As queries espaciais devem usar índices GIST para evitar full scan.
- O componente de mapa deve funcionar apenas no cliente (Client Component) devido ao Leaflet.

## Goals / Non-Goals

**Goals:**
- Ativar PostGIS no PostgreSQL e armazenar coordenadas geográficas nas doações.
- Geocodificar o endereço do Doador/CEP via Nominatim no momento do cadastro da doação.
- Exibir mapa Leaflet.js no dashboard da ONG (`INT-05`) centralizado na sede da ONG.
- Filtrar doações por raio de distância (5 km, 15 km, 30 km, qualquer).
- Exibir lista lateral de doações ordenadas por menor distância com quilometragem calculada.
- Mostrar pins laranjas para doações e pin verde (casa) para a ONG no mapa.
- Popups informativos nos pins com detalhes da doação e link de reserva rápida.

**Non-Goals:**
- Rotas de navegação turn-by-turn (escopo do `reservation-token` para "Ver Rota").
- Geocodificação em lote de doações existentes sem coordenadas (migração retroativa).
- Mapa no painel do Doador ou Admin (somente painel da ONG na v1).
- Suporte offline ao mapa.

## Decisions

### D1: Como armazenar coordenadas geográficas?

**Decisão**: Adicionar campos `latitude Float?` e `longitude Float?` no model `Donation` do Prisma. Para queries espaciais usar `ST_DWithin` e `ST_Distance` do PostGIS via `prisma.$queryRaw`.

**Alternativas consideradas**:
- Tipo `Geography(Point)` nativo do PostGIS com coluna `location` → mais semântico, mas requer suporte explícito do Prisma via `Unsupported("geography")`, adicionando complexidade de manutenção de schema.
- Dois floats simples (`lat`, `lng`) com Haversine calculado na aplicação → sem necessidade de PostGIS ativado, mas perde performance em grandes datasets por não usar índices espaciais.

**Rationale**: `Float?` + `prisma.$queryRaw` com `ST_DWithin` balanceia compatibilidade com o Prisma e aproveitamento dos índices GIST do PostGIS.

---

### D2: Como geocodificar endereços?

**Decisão**: Chamar a API Nominatim no Route Handler de criação de doação (`POST /api/v1/donations`) para converter o endereço/CEP em `lat/lng` antes de persistir.

**Alternativas consideradas**:
- Geocodificação assíncrona em background job → mais resiliente a falhas da API, mas adiciona complexidade de fila.
- Geocodificação no cliente → expõe a lógica ao usuário e viola a separação de responsabilidades.

**Rationale**: Chamada síncrona no route handler simplifica o fluxo na v1; se a Nominatim falhar, a doação é salva sem coordenadas (campos `nullable`) e pode ser geocodificada posteriormente.

---

### D3: Como filtrar por distância no backend?

**Decisão**: Aceitar parâmetros `lat`, `lng` e `radius` (em km) no `GET /api/v1/donations` e usar `prisma.$queryRaw` com `ST_DWithin(ST_MakePoint(longitude, latitude)::geography, ST_MakePoint($1, $2)::geography, $3)` onde `$3 = radius * 1000` (metros).

**Rationale**: Delegar o cálculo de distância ao PostGIS garante uso dos índices GIST e evita trazer todos os registros para a memória da aplicação.

---

### D4: Componente de mapa — Server ou Client Component?

**Decisão**: Client Component (`'use client'`) com importação dinâmica via `next/dynamic` e `{ ssr: false }` para evitar erros de `window is not defined` do Leaflet.

**Rationale**: Leaflet.js usa APIs do browser (DOM, `window`); importação dinâmica com `ssr: false` é o padrão documentado no Next.js para bibliotecas não-SSR.

## Risks / Trade-offs

- **[Risco] Nominatim rate limit (1 req/s)** → Mitigação: adicionar `User-Agent` obrigatório nas chamadas; implementar retry com backoff; se falhar, persistir `lat/lng = null` e notificar admin.
- **[Risco] PostGIS não instalado no ambiente de produção** → Mitigação: documentar `CREATE EXTENSION postgis;` como pré-requisito no README e no script de migração.
- **[Risco] Travamento da UI com muitos pins** → Mitigação: limitar a query a no máximo 100 doações próximas; usar clustering de pins no Leaflet (`leaflet.markercluster`) se volume crescer.
- **[Trade-off] `prisma.$queryRaw` contorna o type-safety do Prisma** → Aceito para queries espaciais; compensado por tipagem manual do retorno e testes de integração.

## Migration Plan

1. Executar `CREATE EXTENSION IF NOT EXISTS postgis;` no banco de dados (pré-requisito documentado).
2. Adicionar `latitude Float?` e `longitude Float?` no model `Donation`.
3. Adicionar índice `@@index([latitude, longitude])` no model `Donation`.
4. Executar `npx prisma migrate dev --name geo-matching-map`.
5. Rollback: campos `latitude` e `longitude` são `nullable`; remover com nova migração não quebra dados existentes.

## Open Questions

- A sede da ONG tem coordenadas cadastradas? Confirmar se o model `User` (papel ONG) já possui `latitude`/`longitude` ou se é necessário adicioná-los também.
- Confirmar se `leaflet` já está no `package.json` do projeto (referenciado no spec_tech.md mas não verificado).
