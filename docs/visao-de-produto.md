# Declaração de Problema - Mesa Justa: Circuito Solidário

## 1. Problema

### Problema Primário
O desperdício de alimentos é um dos grandes desafios sociais e ambientais da atualidade. Enquanto supermercados, padarias, restaurantes e outros estabelecimentos descartam diariamente alimentos ainda adequados para consumo, milhões de famílias enfrentam dificuldades de acesso à alimentação.

### Problemas Específicos Identificados

**Para Estabelecimentos Doadores:**
- Falta de canais estruturados para realização de doações
- Desperdício de alimentos por falta de interessados visíveis
- Ausência de transparência sobre o destino final dos alimentos
- Processos manuais e desorganizados para conectar-se com potenciais receptores

**Para ONGs e Instituições Beneficentes:**
- Falta de visibilidade centralizada sobre doações disponíveis
- Dificuldade para localizar estabelecimentos doadores próximos
- Comunicação descentralizada e ineficiente com múltiplos fornecedores
- Ineficiência logística para planejamento e coleta de alimentos
- Falta de rastreabilidade das doações realizadas
- Perda de alimentos devido à demora na retirada

**Para a Sociedade:**
- Redução significativa do impacto social das iniciativas existentes
- Limitação no alcance das ações solidárias
- Desperdício de recursos alimentares com potencial de redistribuição

### Cenário Atual
Atualmente existe um cenário caracterizado por:
- Descarte frequente de alimentos próximos ao vencimento por estabelecimentos comerciais
- Ausência de comunicação eficiente entre doadores e receptores
- Falta de visibilidade sobre alimentos disponíveis para doação
- Logística de redistribuição desorganizada
- Inexistência de uma plataforma centralizada para conectar os participantes do processo

### Impactos Diretos
- Desperdício massivo de alimentos
- Baixa eficiência operacional das ONGs
- Dificuldade de comunicação entre stakeholders
- Falta de rastreabilidade e conformidade
- Redução do impacto social das iniciativas de doação

---

## 2. Público-Alvo / Personas

### Persona 1: Gestor de ONG
**Nome:** Ana Silva

**Perfil:**
- Responsável pela coordenação de doações em instituição beneficente
- Enfrenta desafios operacionais diários na busca por alimentos
- Busca otimizar o tempo e recursos da sua equipe

**Objetivo:**
Encontrar rapidamente doações disponíveis e organizar a retirada dos alimentos de forma eficiente.

**Dores Principais:**
- Falta de informação centralizada sobre doações
- Dificuldade para identificar doações próximas à localização da instituição
- Tempo excessivo gasto em comunicação manual com doadores
- Falta de rastreabilidade sobre o que foi coletado

**Ganhos Esperados:**
- Maior visibilidade das doações disponíveis
- Redução de esforço operacional
- Melhor planejamento logístico
- Maior eficiência nas retiradas

---

### Persona 2: Responsável pelo Estabelecimento Doador
**Nome:** Carlos Oliveira

**Perfil:**
- Gerente de supermercado, padaria ou restaurante
- Responsável por decisões sobre excedentes de alimentos
- Busca formas rápidas e organizadas de realizar doações

**Objetivo:**
Disponibilizar alimentos excedentes de forma rápida, organizada e com transparência.

**Dores Principais:**
- Falta de canais estruturados para realização de doações
- Desperdício de alimentos por falta de interessados conhecidos
- Ausência de forma de comprovar o impacto da doação
- Processos manuais que demandam tempo

**Ganhos Esperados:**
- Processo simples e rápido para realização de doações
- Transparência sobre o destino dos alimentos doados
- Contribuição social estruturada e mensurável
- Possibilidade de demonstrar responsabilidade social da empresa

---

### Persona 3: Administrador da Plataforma
**Nome:** Juliana Souza

**Perfil:**
- Profissional de administração ou gestão de sistemas
- Responsável pelo funcionamento e monitoramento da plataforma
- Necessita acompanhar métricas e performance

**Objetivo:**
Garantir o funcionamento eficiente da plataforma e monitorar as operações para suportar os demais usuários.

**Dores Principais:**
- Falta de indicadores sobre o fluxo de doações
- Necessidade de acompanhar a utilização da plataforma
- Desafio em gerenciar múltiplos usuários e perfis
- Ausência de dados consolidados sobre impacto

**Ganhos Esperados:**
- Dashboard com indicadores operacionais claros
- Relatórios de impacto social e ambiental
- Controle centralizado de usuários e permissões
- Rastreabilidade completa das operações

---

## 3. Objetivo do Produto

### Objetivo Primário
Criar uma plataforma digital centralizada que conecte estabelecimentos com excedente de alimentos, organizações não governamentais (ONGs) e famílias em situação de insegurança alimentar, reduzindo o desperdício de alimentos e facilitando a redistribuição de recursos alimentares de forma eficiente, rastreável e impactante.

### Objetivos de Negócio
- Reduzir significativamente o desperdício de alimentos
- Facilitar a redistribuição de excedentes alimentares
- Apoiar iniciativas de combate à insegurança alimentar
- Melhorar a eficiência operacional das ONGs parceiras
- Ampliar o alcance e impacto das ações solidárias
- Criar um ecossistema sustentável de doações

### Objetivos dos Usuários
- **Estabelecimentos:** Realização simples e transparente de doações com comprovação de impacto
- **ONGs:** Encontrar doações disponíveis rapidamente, localizar pontos de coleta próximos e otimizar logística
- **Administradores:** Monitorar operações, gerar insights e garantir conformidade

### Objetivos Técnicos
- Criar uma plataforma responsiva (Desktop, Tablet, Smartphone)
- Implementar geolocalização para otimizar buscas e logística
- Garantir disponibilidade 24/7
- Assegurar conformidade com LGPD e requisitos sanitários
- Manter rastreabilidade completa das operações

---

## 4. Solução Proposta

### Solução Desejada
O Mesa Justa disponibilizará uma plataforma web responsiva (com suporte Desktop via Electron) que permitirá a integração entre os participantes do ecossistema de doação de alimentos.

### Funcionalidades Principais (MVP)

**Gestão de Usuários:**
- Cadastro seguro de usuários (Administrador, ONG, Estabelecimento Doador)
- Autenticação e controle de perfis e permissões
- Consulta e atualização de dados cadastrais

**Gestão de Doações:**
- Cadastro de alimentos disponíveis com dados de validade
- Consulta e busca de doações com filtros (categoria, município, estado, distância)
- Atualização de status (Disponível, Reservada, Retirada, Cancelada, Expirada)
- Monitoramento automático de validade com alertas

**Geolocalização:**
- Busca de estabelecimentos próximos
- Visualização de doações por proximidade em mapa georreferenciado
- Apoio à tomada de decisão logística

**Reservas e Logística:**
- Reserva de alimentos por ONGs
- Controle de disponibilidade em tempo real
- Registro e histórico completo do status das retiradas

**Administração e Monitoramento:**
- Dashboard administrativo com indicadores operacionais
- Relatórios de impacto social (alimentos redistribuídos, famílias beneficiadas, participantes)
- Relatórios de impacto ambiental (kg reaproveitados, resíduos evitados)
- Sistema de incentivo "Moeda Verde" para doadores
- Ranking de participação
- Notificações para eventos relevantes
- Auditoria completa de operações críticas

### Como a Solução Resolve o Problema
- **Centraliza informações:** Elimina a necessidade de comunicação descentralizada
- **Otimiza logística:** Usa geolocalização para conectar doadores próximos com receptores
- **Aumenta transparência:** Rastreabilidade completa do processo de doação
- **Incentiva participação:** Sistema de pontuação e reconhecimento para doadores
- **Facilita conformidade:** Registros auditáveis para requisitos sanitários e legais
- **Demonstra impacto:** Relatórios consolidados de impacto social e ambiental

---

## 5. Solução Atual

### Como os Usuários Resolvem o Problema Hoje

**Estabelecimentos Doadores:**
- Realizam doações através de contatos diretos e relacionamentos pessoais
- Utilizam telefone e e-mail para comunicação com ONGs
- Muitos ainda descartam alimentos por falta de canais conhecidos
- Têm dificuldade em medir o impacto de suas doações

**ONGs:**
- Buscam ativamente estabelecimentos conhecidos para doações
- Utilizam redes e relacionamentos pessoais para localizar fornecedores
- Fazem controle manual de doações (planilhas, cadernos)
- Gastam tempo em ligações e comunicações repetidas
- Têm baixa visibilidade sobre doações disponíveis

**Limitações da Solução Atual:**
- Processos manuais e ineficientes
- Perda de oportunidades por falta de comunicação
- Falta de rastreabilidade e conformidade
- Impacto não mensurável
- Escalabilidade limitada

---

## 6. Critérios de Sucesso

O projeto será considerado bem-sucedido quando:

### Métricas Quantitativas
- ✓ Aumentar o volume de alimentos redistribuídos em pelo menos 50% nos primeiros 6 meses
- ✓ Reduzir o tempo necessário para localizar doações de horas para minutos
- ✓ Melhorar a eficiência logística das ONGs (reduzir tempo de coordenação em 40%)
- ✓ Aumentar o número de estabelecimentos participantes (objetivo: 50+ no MVP)
- ✓ Reduzir perdas decorrentes da demora na retirada dos alimentos em 30%

### Métricas Qualitativas
- ✓ Reduzir frustração dos usuários no processo de doação
- ✓ Promover maior transparência no processo de doação
- ✓ Aumentar senso de impacto social entre doadores
- ✓ Melhorar satisfação dos usuários com a plataforma

### Indicadores de Adoção
- ✓ Taxa de engajamento (% de usuários ativos mensalmente)
- ✓ Frequência de uso da plataforma
- ✓ Número de doações completadas por mês
- ✓ Taxa de retenção de usuários

---

## 7. Escopo Inicial (MVP) - Restrições Geográficas

- Operação inicial restrita aos estados de **Minas Gerais** e **São Paulo**
- Possibilidade de expansão após validação do modelo

---

## 8. Premissas

- Os participantes possuem acesso à internet
- As ONGs possuem estrutura para retirada e transporte dos alimentos
- As ONGs são responsáveis pela validação das famílias beneficiárias
- Os alimentos cadastrados estão aptos para consumo
- Os estabelecimentos informarão corretamente a disponibilidade dos alimentos
- O sistema será desenvolvido com tecnologia Web (com suporte Desktop via Electron)

---

## 9. Restrições

- **O sistema não será responsável pelo transporte dos alimentos**
- **O sistema não realizará transações financeiras**
- **O sistema não substituirá processos sanitários ou legais relacionados à doação**
- A operação inicial será restrita aos estados de Minas Gerais e São Paulo
- O funcionamento adequado dependerá da atualização contínua das informações pelos participantes

---

## 10. Dependências Externas

- API de Mapas (geolocalização)
- Serviço de Geolocalização
- Serviço de Notificações (e-mail, push)
- Serviço de Autenticação

---

## 11. Próximos Artefatos

Este documento de declaração de problema servirá como entrada para:

1. **03-user-stories.md** - Histórias de usuário detalhadas
2. **04-backlog.md** - Backlog priorizado do produto
3. **05-domain-model.md** - Modelo de domínio
4. **06-ui-design.md** - Protótipos de interface
5. **01-architecture.md** - Arquitetura da solução
6. **07-implementation-plan.md** - Plano de implementação
7. Desenvolvimento da aplicação
