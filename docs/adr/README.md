# Registro de Decisões de Arquitetura (ADR) — Mesa Justa

Este diretório contém os **Architecture Decision Records** do projeto, que registram decisões estruturais importantes e o contexto que as justifica. As decisões foram extraídas e consolidadas a partir da documentação existente (specs, designs OpenSpec e README) com apoio de IA generativa e revisão crítica do time.

## Índice

| ADR | Decisão | Status |
|---|---|---|
| [ADR-0001](ADR-0001.md) | Monolito Full-Stack com Next.js App Router e wrapper Electron | Aceita |
| [ADR-0002](ADR-0002.md) | Busca por proximidade com PostGIS (`prisma.$queryRaw`) em vez de Haversine na aplicação | Aceita |

## Como propor um novo ADR

1. Seguir o template de status/contexto/decisão/alternativas/consequências usado nos ADRs acima.
2. Preservar as referências rastreáveis (arquivos de spec, design OpenSpec e testes que validam a decisão).
3. Registrar no índice acima e atualizar este documento.