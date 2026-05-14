# V1 Manual de Desenvolvimento e Plataforma

Este guia cobre somente os passos manuais que precisam ser feitos direto na instancia para V1 funcionar.

## Checklist executivo (manual)

| Item | Acao necessaria | Impacto se nao feito |
|---|---|---|
| Event Registry (12 eventos) | Criar em `System Policy > Events > Event Registry` | Notificacoes nao disparam |
| Approval Group | Criar grupo `[TOCC] Backoffice` e membros | FLOW-01 nao encontra aprovador |
| Ativar 5 Flows | Ativar no `Flow Designer` | Aprovacoes e automacoes nao roteadas |
| Ativar 5 Scheduled Jobs | Ativar em `System Definition > Scheduled Jobs` | Jobs nao executam |
| KB Bootstrap | Rodar `KnowledgeBaseBootstrapService.bootstrap()` | KB vazia no portal |
| CMDB Bootstrap | Rodar `CmdbBootstrapService.bootstrapSampleAssetsForRoom()` | Rooms sem CIs de exemplo |
| VA Topics | Criar topicos no Virtual Agent Designer | VA sem topicos operacionais |
| Notification bindings | Revisar evento em cada notificacao `[TOCC]` | Emails nao enviados |
| Platform Analytics indicators | Criar indicadores no Analytics Hub e vincular widgets | KPI widgets sem dados |

## 1) Event Registry (12 eventos)

Fonte oficial: `FLOWS_AND_SUBFLOWS.md` (secao Event Registry).

Criar os 12 eventos com os nomes `x_783010_tocc_a1.*` esperados pelos flows/jobs e pelas notificacoes.

Validacao:
- Abrir uma notificacao `[TOCC]`
- Confirmar campo de evento apontando para um evento existente

## 2) Approval Group

Criar grupo:
- Nome: `[TOCC] Backoffice`
- Incluir usuarios com role `x_783010_tocc_a1.backoffice`

Validacao:
- Submeter reserva em `submitted`
- Confirmar tarefa de aprovacao criada para o grupo

## 3) Ativacao de Flows (5)

Ativar:
- `[TOCC] Reservation Approval`
- `[TOCC] Enrollment Approval`
- `[TOCC] Session Cancellation Notification`
- `[TOCC] Attendance Confirmation Request`
- `[TOCC] Session Reminder Dispatch`

Validacao minima:
- FLOW-01: reserva submetida gera aprovacao
- FLOW-02: inscricao gera aprovacao (quando modo for `instructor_approval`)

## 4) Ativacao de Scheduled Jobs (5)

Ativar:
- `[TOCC] Send Session Reminders`
- `[TOCC] Release Unconfirmed Seats`
- `[TOCC] Close Past Training Sessions`
- `[TOCC] Detect Stale Pending Approvals`
- `[TOCC] Collect KPI Snapshots`

Validacao minima:
- Executar `Run` manual em dev e verificar efeitos em dados e logs

## 5) KB Bootstrap

Executar em `Scripts - Background` (escopo da app):

```javascript
var kb = new x_783010_tocc_a1.KnowledgeBaseBootstrapService();
gs.info(JSON.stringify(kb.bootstrap(), null, 2));
```

Validacao:
- Base criada
- Categorias/artigos disponiveis no portal

## 6) CMDB Bootstrap

Executar em `Scripts - Background` (escopo da app):

```javascript
var cmdb = new x_783010_tocc_a1.CmdbBootstrapService();
gs.info(JSON.stringify(cmdb.bootstrapSampleAssetsForRoom(), null, 2));
```

Validacao:
- Assets de exemplo criados
- Relacao Room Resource x CI funcionando

## 7) Virtual Agent Topics

Criar topicos no Virtual Agent Designer conforme runbooks:
- `virtual-agent-authoring.md`
- `virtual-agent-topic-backend.md`

Validacao:
- Topicos aparecem no VA
- Chamadas para `VirtualAgentTopicService` retornam payload valido

## 8) Notification bindings

Para cada notificacao `[TOCC]`:
- Abrir notificacao
- Confirmar `When to send > Event` correto
- Confirmar destinatarios corretos

Validacao:
- Disparar evento de teste
- Confirmar entrada em `sys_email`

## 9) Platform Analytics indicators

Executar wiring manual de indicadores:
- Criar indicadores no Analytics Hub
- Associar aos widgets do dashboard

Runbooks:
- `dashboard-indicator-wiring.md`
- `kpi-snapshot-collector.md`

Validacao:
- Widgets deixam de ficar vazios
- Tabela `x_783010_tocc_a1_kpi_snapshot` populando diariamente

## Criterio de pronto V1 (manual)

- Todos os 9 itens do checklist executivo concluidos
- Evidencia anexada por item
- Sem erro critico em flow, job, VA, email e dashboard
