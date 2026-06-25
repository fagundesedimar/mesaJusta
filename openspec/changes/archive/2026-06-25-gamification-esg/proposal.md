## Why

Incentivar o engajamento e a constância nas doações por parte dos estabelecimentos parceiros, pontuando-os de acordo com o volume de alimentos doados salvos e gerando visibilidade institucional (ranking regional) de suas ações ESG.

## What Changes

- Lógica de backend para calcular "Moedas Verdes" com base no peso do lote retirado ($1 \text{ kg} = 10 \text{ Moedas Verdes}$).
- Multiplicador de $1.5\text{x}$ para alimentos das categorias "Refeições Prontas" e "Proteínas".
- Endpoint `GET /api/v1/gamification/ranking` para listar os 10 estabelecimentos com maior pontuação no mês corrente.
- Exibição de moedas acumuladas e selos ESG (Bronze, Prata, Ouro) no painel do doador (`INT-02`).

## Capabilities

### New Capabilities
- `gamification-esg`: Regras de pontuação de Moedas Verdes, ranking público Top 10 e atribuição dinâmica de selos virtuais de nível baseados em doações concluídas.

### Modified Capabilities
<!-- Nenhuma capacidade existente será modificada nesta etapa -->

## Impact

- Queries de agregação no banco de dados (soma de moedas verdes por doador).
- Route Handler `GET /api/v1/gamification/ranking`.
- Componentes visuais do painel do doador.

---

## Detalhes do Planejamento de Execução

### Escopo Funcional
- Atribuição automática de pontos na conta do doador no momento em que a doação transiciona para "Retirada".
- Cálculo: $\text{Moedas} = \text{Peso} \times 10 \times \text{Multiplicador}$.
- Níveis de Selo ESG:
  - Bronze: até 1.000 moedas.
  - Prata: de 1.001 a 5.000 moedas.
  - Ouro: acima de 5.000 moedas.
- Ranking público dos 10 melhores doadores exibido no painel de controle.

### Dependências
- `collection-audit` (os pontos são computados somente após a doação ser concluída com status "Retirada").

### Riscos
- Risco Baixo/Médio: Inconsistências ou falha de arredondamento no cálculo das moedas e lentidão na renderização do ranking. Mitigado usando tipos numéricos decimais precisos e cache ou indexação correta na agregação mensal.

### Execução de Linter Necessária
- Validação completa via ESLint (`npm run lint`).

### Testes Unitários Necessários
- Teste isolado do helper matemático que calcula as Moedas Verdes e aplica os multiplicadores específicos por categoria de alimentos.
- Teste do utilitário de atribuição de selo ESG com base em faixas de pontuação.

### Testes de Integração Necessários
- Chamada de integração para o endpoint `GET /api/v1/gamification/ranking` validando a ordenação decrescente de pontuação.
- Teste de atualização automática de saldo do Doador no banco de dados após a confirmação de uma retirada.

### Testes E2E Necessários
- Fluxo de ponta a ponta: Registrar a retirada de um lote de 10kg de proteínas para o doador, verificar que as Moedas Verdes aumentaram em 150 pontos ($10 \times 10 \times 1.5$) e que o selo ESG do doador foi atualizado caso mude de faixa.
