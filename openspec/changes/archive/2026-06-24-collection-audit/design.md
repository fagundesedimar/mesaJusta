## Context

O ciclo de vida de uma doação no Mesa Justa termina com a retirada física dos alimentos pela ONG. Atualmente, não existe mecanismo de confirmação deste evento — doações reservadas ficam indefinidamente no estado "Reservada" sem registro de conclusão. Este change finaliza o circuito: o Doador insere o token físico fornecido pela ONG no ato da retirada, e o sistema valida, transiciona o status e grava um registro de auditoria imutável.

**Dependência direta:** `reservation-token` — a doação precisa ter um token ativo e status "Reservada" para que a confirmação seja possível.

**Stakeholders:** Doadores (acionam a confirmação via UI), ONGs (recebem o token ao reservar), Administradores (consomem os logs de auditoria no painel admin).

---

## Goals / Non-Goals

**Goals:**
- Criar o modelo `AuditLog` no Prisma com campos obrigatórios: `donation_id`, `ong_id`, `donor_id`, `timestamp`, `executor_id`
- Criar endpoint `POST /api/v1/reservations/confirm` que valida o token, transiciona status da doação para "Retirada" e grava o `AuditLog` — tudo em uma única transação Prisma
- Criar componente de popup/modal "Confirmar Entrega" na tabela do Dashboard do Doador (`INT-02`) com campo de 6 caracteres para o token
- Garantir imutabilidade do `AuditLog` (sem endpoints de update/delete para essa tabela)

**Non-Goals:**
- Notificação por e-mail/push para a ONG ao confirmar retirada — escopo do módulo de notificações
- Cancelamento de retirada ou estorno de auditoria — os logs são imutáveis por design
- Confirmação pela ONG (apenas o Doador confirma no MVP) — fluxo invertido deferido

---

## Decisions

### D1: Transação Atômica Prisma para Status + AuditLog

**Decisão:** Usar `prisma.$transaction([...])` para executar atomicamente a atualização do status da doação e a criação do registro de AuditLog.

**Rationale:** O requisito de integridade é explícito: ou ambas as operações ocorrem ou nenhuma ocorre. Sem transação, uma falha entre o `update` de status e o `create` de AuditLog deixaria a doação marcada como "Retirada" sem rastro de auditoria, comprometendo a conformidade com a Lei 14.016/2020 e as regras de segurança do `openspec/config.yaml` (`audit_logs.required: true`). O `prisma.$transaction` com array de operações garante rollback automático em caso de falha em qualquer etapa.

**Alternativa descartada:** Operações sequenciais sem transação — risco de inconsistência em caso de falha de rede ou timeout de banco.

---

### D2: Validação do Token no Servidor vs. no Cliente

**Decisão:** A validação do token é exclusivamente no servidor (Route Handler). O cliente apenas envia o token inserido pelo usuário.

**Rationale:** Validar no cliente exporia o token armazenado no banco (mesmo que hasheado), criando superfície de ataque. O servidor faz a comparação segura: recupera o token ativo associado à doação e verifica a igualdade (ou hash match se o token for hasheado). O cliente recebe apenas sucesso (200) ou falha (400/409) sem detalhes do token armazenado.

---

### D3: Token em Texto Plano vs. Hash no Banco

**Decisão:** Armazenar o token como texto plano no banco para o MVP, com validação direta por igualdade de string.

**Rationale:** O token de 6 caracteres é gerado no momento da reserva e usado uma única vez. Diferentemente de senhas, tokens de uso único com TTL curto (vinculados a uma doação específica) têm risco de exposição limitado: mesmo que o banco seja comprometido, o atacante precisaria do contexto da doação ativa. Hashear com bcrypt tornaria a comparação assíncrona e mais lenta sem benefício proporcional no MVP. A estratégia pode ser revisada em produção com HMAC.

**Alternativa descartada:** Hash bcrypt — overhead desnecessário para token de uso único; HMAC — correto para produção, deferido para pós-MVP.

---

### D4: Imutabilidade do AuditLog — Controle via API vs. Nível de Banco

**Decisão:** Imutabilidade garantida por ausência de endpoints de mutação (sem `PUT`/`PATCH`/`DELETE` em `/api/v1/audit-logs/*`) e sem campos `updatedAt` no modelo Prisma.

**Rationale:** Triggers de banco para prevenir updates seriam mais robustos, mas adicionam complexidade de migração. Para o MVP, a ausência de rotas de mutação expostas é suficiente — o risco de mutação direta no banco é mitigado por controle de acesso ao banco de produção. Adicionar `@@map("audit_logs")` e remover `updatedAt` do modelo comunica claramente a intenção de imutabilidade.

---

## Risks / Trade-offs

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Falha da transação Prisma deixar doação sem auditoria | Baixa | Crítico | `prisma.$transaction` garante rollback; monitorar erros via Sentry |
| Token inserido incorretamente por erro de digitação do Doador | Alta | Baixo | Retornar mensagem clara "Token inválido. Verifique com a ONG." e permitir múltiplas tentativas |
| Doação já em status diferente de "Reservada" sendo confirmada | Média | Alto | Validar status no servidor antes da transação; retornar `409 Conflict` se status não for "Reservada" |
| Registros de AuditLog mutados diretamente no banco por acesso admin | Baixa | Alto | Documentar política de imutabilidade; aplicar controles de acesso ao banco de produção (roles PostgreSQL) |

---

## Migration Plan

1. Adicionar modelo `AuditLog` ao `prisma/schema.prisma` (sem `updatedAt`, com `@@map("audit_logs")`)
2. Executar `npx prisma migrate dev --name collection-audit`
3. Criar `src/app/api/v1/reservations/confirm/route.ts`
4. Criar componente `src/components/donations/ConfirmDeliveryModal.tsx` com campo de token
5. Integrar o modal ao Dashboard do Doador (`INT-02`)
6. Rollback: reverter migração com `npx prisma migrate reset` (atenção: destrutivo) e remover arquivos de rota/componente
