# Registro de Decisões de Arquitetura (ADR) — Mesa Justa

Este diretório contém os **Architecture Decision Records** do projeto, que registram decisões estruturais importantes e o contexto que as justifica. As decisões foram extraídas e consolidadas a partir da documentação existente (specs, designs OpenSpec e README) com apoio de IA generativa e revisão crítica do time.

## Índice

| ADR | Decisão | Status |
|---|---|---|
| [ADR-0001](ADR-0001.md) | Monolito Full-Stack com Next.js App Router e wrapper Electron | Aceita |
| [ADR-0002](ADR-0002.md) | Busca por proximidade com PostGIS (`prisma.$queryRaw`) em vez de Haversine na aplicação | Aceita |
| [ADR-0003](ADR-0003.md) | Autenticação própria (JWT HS256 + cookie HttpOnly) em vez de provedor terceiro | Aceita |
| [ADR-0004](ADR-0004.md) | Regra de Moedas Verdes e selos ESG (gamificação) | Aceita |
| [ADR-0005](ADR-0005.md) | Rate limiting de login com Redis e fallback em memória | Aceita |
| [ADR-0006](ADR-0006.md) | Wrapper Electron: carregamento estático em produção + CSP rígida + preload isolado | Aceita |

## Como propor um novo ADR

1. Seguir o template de status/contexto/decisão/alternativas/consequências usado nos ADRs acima.
2. Preservar as referências rastreáveis (arquivos de spec, design OpenSpec e testes que validam a decisão).
3. Registrar no índice acima e atualizar este documento.