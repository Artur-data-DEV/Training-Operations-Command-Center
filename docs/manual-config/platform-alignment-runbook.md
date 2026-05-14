# Platform Alignment Runbook (SDK + Manual)

Objetivo: fechar os gaps manuais da secao 8 do `ARCHITECTURE.md` para atingir 100% do escopo do PRD nos modulos Virtual Agent, Platform Analytics, CMDB Light e Workspace.

Escopo tecnico:
- App scope: `x_783010_tocc_a1`
- Instance alvo: `dev372264.service-now.com`
- Servicos centrais ja existentes: `VirtualAgentTopicService`, `TrainingKpiService`, `CmdbResourceService`, `PortalApiService`

## 0) Pre-check obrigatorio

1. Confirmar build/deploy do app:
   - `npm run build`
   - `now-sdk install --auth dev`
2. Confirmar jobs ativos:
   - `[TOCC] Collect KPI Snapshots`
   - `[TOCC] Send Session Reminders`
   - `[TOCC] Release Unconfirmed Seats`
   - `[TOCC] Close Past Training Sessions`
   - `[TOCC] Detect Stale Pending Approvals`
3. Confirmar eventos cadastrados (12 eventos `x_783010_tocc_a1.*`).
4. Confirmar grupo de aprovacao:
   - `[TOCC] Backoffice`
5. (Opcional, recomendado para UAT rapido) Confirmar seed de principals e dados de smoke:
   - `docs/manual-config/demo-principals-and-portal-smoke.md`

---

## 1) Configuracao do Virtual Agent (6 topicos)

Referencias:
- `src/fluent/logic/virtual-agent-topic-service.now.ts`
- `docs/manual-config/virtual-agent-authoring.md`
- `docs/manual-config/virtual-agent-topic-backend.md`

### 1.1 Preparar contexto do VA

1. Abrir Virtual Agent Designer.
2. Selecionar o escopo da aplicacao `x_783010_tocc_a1`.
3. Criar/usar categoria `TOCC - Training Operations`.
4. Garantir canal Web ativo para testes no portal.

### 1.2 Contrato backend dos topicos

Use `VirtualAgentTopicService` como adaptador unico de backend.

| Topico | Metodo backend principal | Resultado esperado |
|---|---|---|
| Find training sessions | `findAvailableSessions()` | Lista de sessoes abertas/lotadas com vagas |
| View my enrollments | `getMyEnrollments()` | Lista das inscricoes do aluno logado |
| Confirm my attendance | `confirmAttendance()` | Confirmacao em enrollment `approved` |
| Cancel an enrollment | `cancelEnrollment()` | Cancelamento em `pending/approved/waitlisted` |
| Training policies | `getTrainingPolicies()` | Politicas + links + escalacao |
| Talk to Backoffice | `getBackofficeEscalation()` | Email/canal de suporte |

### 1.3 Implementacao por topico

Para cada topico:
1. Criar Topic com utterances e intents.
2. Adicionar Scripted Action server-side chamando `new x_783010_tocc_a1.VirtualAgentTopicService()`.
3. Mapear inputs e outputs do node para variaveis de conversa.
4. Tratar falha padrao:
   - se `success=false`, responder `message` e oferecer escalacao.

Script base sugerido para nodes de integracao:

```javascript
(function execute(inputs, outputs) {
  var svc = new x_783010_tocc_a1.VirtualAgentTopicService();
  var result = svc.getMainMenu(); // substituir por metodo do topico

  outputs.success = result.success === true;
  outputs.payload = JSON.stringify(result);
  outputs.message = result.message || '';
})(inputs, outputs);
```

### 1.4 Regras de seguranca funcional no VA

1. Confirmacao/cancelamento devem aceitar `number` ou `sys_id` de enrollment.
2. O metodo `_resolveMyEnrollmentReference()` deve bloquear enrollment fora do usuario logado.
3. Nao expor tabelas diretamente no VA; sempre via Script Include.
4. Escalacao obrigatoria quando nao houver dados ou erro de permissao.

### 1.5 Validacao de publicacao

Executar teste rapido (impersonando `student`):
1. Encontrar sessoes.
2. Listar minhas inscricoes.
3. Confirmar presenca por `ENR...`.
4. Cancelar inscricao por `sys_id`.
5. Ler politicas.
6. Escalar para Backoffice.

Critico: topicos publicados e ativos no canal do portal.

---

## 2) Fiacao de Platform Analytics (TrainingKpiService -> Dashboard)

Referencias:
- `src/fluent/logic/training-kpi-service.now.ts`
- `src/fluent/dashboards/platform-analytics-dashboard.now.ts`
- `docs/manual-config/dashboard-indicator-wiring.md`
- `docs/manual-config/kpi-snapshot-collector.md`

### 2.1 Gerar baseline de KPI

1. Rodar coleta manual uma vez:

```javascript
var svc = new x_783010_tocc_a1.TrainingKpiService();
gs.info(JSON.stringify(svc.collectDailySnapshot(30), null, 2));
```

2. Validar tabela `x_783010_tocc_a1_kpi_snapshot`:
- 16 linhas para `snapshot_date` mais recente.
- `kpi_key` sem duplicidade no dia.

### 2.2 Criar indicadores no Analytics Hub

Criar indicadores baseados em `x_783010_tocc_a1_kpi_snapshot` filtrando por `kpi_key`.

KPI keys principais:
- `training_session_fill_rate`
- `no_show_rate`
- `attendance_confirmation_rate`
- `avg_reservation_approval_time_hours`
- `avg_enrollment_approval_time_hours`
- `room_occupancy_rate`
- `room_conflict_rate`
- `enrollment_cancellation_rate`
- `waitlist_conversion_rate`
- `feedback_average_rating`
- `knowledge_article_views`
- `sessions_by_status_count`
- `reservations_by_status_count`
- `most_used_rooms_top_count`
- `most_requested_resources_top_count`
- `blocked_late_cancellations`

### 2.3 Mapear widgets do dashboard

Dashboard: `Training Operations Performance Dashboard`

Mapeamento minimo obrigatorio:
- Session Fill Rate -> `training_session_fill_rate`
- No-Show Rate -> `no_show_rate`
- Attendance Confirmation Rate -> `attendance_confirmation_rate`
- Avg Reservation Approval Time -> `avg_reservation_approval_time_hours`
- Feedback Average Rating -> `feedback_average_rating`
- KB Article Views -> `knowledge_article_views`

Widgets de distribuicao (status/top N):
- manter agregacao por tabela operacional, com validacao cruzada contra KPIs de contagem.

### 2.4 Validacao de acesso e consistencia

1. Role `x_783010_tocc_a1.manager` deve ler dashboard.
2. Role `x_783010_tocc_a1.backoffice` deve ler dashboard.
3. `student` e `instructor` nao devem acessar dashboard gerencial.
4. Widgets nao podem ficar em branco apos a coleta diaria.

---

## 3) Relacionamentos CMDB Light (room_resource -> cmdb_ci)

Referencias:
- `src/fluent/tables/core-tables.now.ts`
- `src/fluent/logic/cmdb-resource-service.now.ts`
- `src/fluent/business-rules/cmdb-resource-validation.now.ts`
- `docs/manual-config/cmdb-bootstrap.md`

### 3.1 Garantir regra de validacao ativa

Business Rule obrigatoria:
- `Validate Room Resource CI Reference`
- Tabela: `x_783010_tocc_a1_room_resource`
- Quando: `before insert/update`

### 3.2 Validar qualidade dos links CMDB

Rodar auditoria em background:

```javascript
var invalid = 0;
var retired = 0;
var rr = new GlideRecord('x_783010_tocc_a1_room_resource');
rr.addNotNullQuery('ci_reference');
rr.query();

while (rr.next()) {
  var ci = new GlideRecord('cmdb_ci');
  if (!ci.get(rr.getValue('ci_reference'))) {
    invalid++;
    continue;
  }
  var status = String(ci.getValue('install_status') || '');
  if (status === '6' || status === '7' || status.toLowerCase() === 'retired') {
    retired++;
  }
}

gs.info('TOCC CMDB audit -> invalid=' + invalid + ', retired=' + retired);
```

### 3.3 Regras de enriquecimento

`CmdbResourceService.enrichResourceFromCi()` deve preencher automaticamente quando vazio:
- `resource_name` <- `cmdb_ci.name`
- `resource_type` <- mapeamento por `sys_class_name`

### 3.4 Validacao operacional

1. Lista `Resources Missing CI Link` no Workspace deve refletir backlog real.
2. Inserir `ci_reference` invalido deve ser bloqueado.
3. Inserir `ci_reference` aposentado deve ser bloqueado.
4. Inserir CI valido deve enriquecer campos vazios.

---

## 4) UI Builder - Workspace Backoffice (filtros + KPI tiles)

Referencias:
- `src/fluent/workspace/backoffice-workspace.now.ts`
- `src/fluent/logic/portal-api-service.now.ts` (`getOperationsSnapshot`)
- `docs/manual-config/workspace-composition.md`

### 4.1 Validar navegacao e listas scaffold

Workspace: `TOCC Backoffice Operations Workspace` (`tocc-backoffice-ops`)

Conferir categorias:
- Reservations
- Training Sessions
- Enrollments
- Attendance
- Assets and Resources

Conferir filtros-chave:
- Open Sessions: `statusINopen,full`
- Submitted Reservations: `status=submitted`
- Pending Enrollments: `status=pending`
- Pending Attendance Today: `attendance_status=pending` + janela de hoje
- Resources Missing CI Link: `active=true^ci_referenceISEMPTY`

### 4.2 Configurar tiles de KPI operacional

Na pagina Home do workspace, criar tiles consumindo `PortalApiService.getOperationsSnapshot()`:
- `pending_reservations`
- `todays_sessions`
- `pending_enrollments`
- `unconfirmed_approved_enrollments`
- `in_progress_attendance_pending`
- `resources_missing_ci`

Adicionar bloco de highlights usando `kpi_highlights.metrics`:
- `training_session_fill_rate`
- `no_show_rate`
- `attendance_confirmation_rate`
- `feedback_average_rating`

### 4.3 Regras de ACL/visibilidade

1. Backoffice e Manager com leitura do snapshot operacional.
2. Admin com leitura/escrita da composicao.
3. Sem erro de ACL nos widgets/listas (ver console + syslog).
4. Sem uso de consulta direta no client para tabelas sensiveis; usar Script Include/API do workspace.

### 4.4 Publicacao e smoke test

1. Publicar pagina.
2. Impersonar `x_783010_tocc_a1.backoffice` e validar listas + tiles.
3. Impersonar `x_783010_tocc_a1.manager` e validar leitura sem acoes operacionais de escrita.
4. Validar que navigation path e filtros persistem apos publish.

---

## 5) Definition of Done (modulos manuais)

Para considerar escopo 100% fechado:
- 6 topicos de VA publicados e testados.
- Dashboard com indicadores conectados e dados visiveis.
- Relacoes CMDB auditadas, sem CI invalido/retired vinculado.
- Workspace com filtros finais + tiles operacionais + highlights KPI.
- Evidencias anexadas por modulo (print, sys_id, log, ATF/smoke).
