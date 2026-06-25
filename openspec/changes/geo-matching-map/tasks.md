## 1. Preparação e Dependências

- [x] 1.1 Verificar se `leaflet` e `@types/leaflet` já constam no `package.json`; se não, instalar com `npm install leaflet` e `npm install -D @types/leaflet`
- [x] 1.2 Ativar a extensão PostGIS no banco de dados local: executar `CREATE EXTENSION IF NOT EXISTS postgis;` via `npx prisma db execute` ou diretamente no psql
- [x] 1.3 Confirmar se o model `User` (papel ONG) já possui campos de coordenadas (`latitude`, `longitude`); se não, adicioná-los como `Float?`

## 2. Schema e Migração

- [x] 2.1 Adicionar `latitude Float?` e `longitude Float?` no model `Donation` do `prisma/schema.prisma`
- [x] 2.2 Adicionar `@@index([latitude, longitude])` no model `Donation`
- [x] 2.3 Se necessário, adicionar `latitude Float?` e `longitude Float?` no model `User` para armazenar coordenadas da sede da ONG
- [x] 2.4 Executar migração `npx prisma migrate dev --name geo-matching-map`

## 3. Serviço de Geocodificação

- [x] 3.1 Criar `src/lib/geo/nominatim.ts` com função `geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null>` que chama a Nominatim API com `User-Agent` obrigatório e retorna `null` em caso de falha
- [x] 3.2 Criar testes unitários em `src/__tests__/unit/geo/nominatim.test.ts` cobrindo: retorno de coordenadas válidas, retorno `null` em falha de rede, retorno `null` em endereço não encontrado

## 4. Integração no Route Handler de Criação de Doação

- [x] 4.1 Localizar o Route Handler `POST /api/v1/donations` (ou equivalente) e integrar a chamada `geocodeAddress` antes do `prisma.donation.create`
- [x] 4.2 Garantir que falha na geocodificação não bloqueia o cadastro — persistir `latitude = null`, `longitude = null` e logar o erro no servidor

## 5. Atualização do Route Handler de Listagem de Doações

- [x] 5.1 Atualizar `GET /api/v1/donations` para aceitar query params `lat`, `lng` e `radius` (em km)
- [x] 5.2 Quando `lat`, `lng` e `radius` presentes, substituir a query Prisma por `prisma.$queryRaw` com `ST_DWithin` e `ST_Distance` do PostGIS, ordenando por distância crescente e limitando a 100 resultados
- [x] 5.3 Incluir campo `distanceKm` (arredondado a 1 decimal) em cada item do array retornado quando filtro espacial estiver ativo

## 6. Componentes de UI — Dashboard da ONG (INT-05)

- [x] 6.1 Criar componente `src/components/ong/DonationMap.tsx` como Client Component (`'use client'`) importando Leaflet via `next/dynamic` com `{ ssr: false }`
- [x] 6.2 Implementar lógica de centralização do mapa nas coordenadas da ONG logada com zoom padrão 13
- [x] 6.3 Renderizar pin verde (ícone de casa) para a sede da ONG e pins laranjas para cada doação com coordenadas válidas
- [x] 6.4 Implementar popup de doação com: nome do Doador, categoria, peso, distância em km e botão "Reservar Lote"
- [x] 6.5 Criar componente `src/components/ong/DonationListSidebar.tsx` com lista lateral de cartões de doações exibindo distância ("A 4.2 km de você"), ordenados por proximidade
- [x] 6.6 Implementar filtros de raio ("Até 5 km", "Até 15 km", "Até 30 km", "Qualquer distância") e por categoria, que ao mudar refazem o fetch e atualizam lista e mapa simultaneamente
- [x] 6.7 Criar `src/components/ong/GeoMap.css` com estilos Vanilla CSS para o container do mapa, lista lateral, cartões e filtros

## 7. Página do Dashboard da ONG

- [x] 7.1 Criar ou atualizar `src/app/ong/dashboard/page.tsx` integrando `DonationMap` e `DonationListSidebar` no layout side-by-side conforme `INT-05`

## 8. Testes

- [x] 8.1 Criar `src/__tests__/integration/geo/donations-spatial.test.ts` validando: ordenação correta por distância, exclusão de doações fora do raio, campo `distanceKm` presente, comportamento sem parâmetros espaciais (retorno de todas as doações)
- [x] 8.2 Criar teste de renderização `src/__tests__/unit/components/DonationMap.test.tsx` mockando Leaflet e verificando que o componente renderiza sem erros de SSR
- [x] 8.3 Criar `e2e/ong/geo-matching-map.spec.ts`: login como ONG, verificar mapa centralizado, aplicar filtro de 5 km, verificar que a lista lateral foi atualizada, clicar em um pin e verificar o popup

## 9. Validação Final

- [x] 9.1 Executar `npm run lint` e corrigir todos os erros ESLint
- [x] 9.2 Executar `npm run test:unit` e garantir que os testes de geocodificação e componentes passam
- [x] 9.3 Executar `npm run test:integration` e verificar os testes de query espacial
- [x] 9.4 Executar `npm run test:e2e` e verificar o fluxo E2E do mapa
