# Novas User Stories - Finalizacao de Plataforma V1

Base de derivacao: `NOW_CREATE_BACKLOG.md` (itens com status `Pending` e dependencia manual):
- US-27 (KB publish manual)
- US-28 (VA topics manual)
- US-29 (PA indicator wiring manual)

Complementos necessarios para fechamento tecnico:
- CMDB Light relationship validation
- Workspace composition final (filters + KPI tiles)

## Mapa de rastreabilidade PRD

IDs usados nesta rodada (todos existentes no PRD):
- RM-03, RM-05
- RR-05
- TS-02, TS-04
- SE-05, SE-06, SE-07
- AT-03, AT-04
- KB-01, KB-02, KB-03, KB-04
- VA-01, VA-02, VA-03, VA-04, VA-05, VA-06
- BR-16, BR-17, BR-18

---

## [US-33] Publicar Base de Conhecimento Operacional V1

**User Story:** Como Backoffice, eu quero publicar a base de conhecimento inicial para que alunos e instrutores tenham autosservico no portal.

**Criterios de Aceitacao:**
1. `KnowledgeBaseBootstrapService.bootstrap()` executa com `success=true` e materializa o baseline de categorias/artigos esperado.
2. Artigos aplicam segmentacao por User Criteria (student/instructor/backoffice) sem vazamento de conteudo entre personas.
3. `PortalApiService.getHelpCenterContext()` retorna `kb_url` valido e navegavel no portal.
4. Topico VA de politicas (`VirtualAgentTopicService.getTrainingPolicies()`) inclui links de KB e escalacao consistentes.
5. Validacao UI: pagina de ajuda (`/tocc?id=tocc_help`) lista artigos sem erro de ACL para usuarios autorizados.

**Esforco Estimado:** M

**Relacao com PRD:** KB-01, KB-02, KB-03, KB-04

---

## [US-34] Publicar e Homologar 6 Topicos do Virtual Agent

**User Story:** Como Student, eu quero interagir com os 6 topicos do assistente virtual para resolver solicitacoes sem abrir chamado manual.

**Criterios de Aceitacao:**
1. Os 6 topicos (`find_sessions`, `my_enrollments`, `confirm_attendance`, `cancel_enrollment`, `training_policies`, `escalate_backoffice`) estao publicados no canal Web.
2. Cada topico usa `VirtualAgentTopicService` como backend unico (sem GlideRecord direto no node do VA).
3. `confirmAttendance()` e `cancelEnrollment()` aceitam `number` e `sys_id` de enrollment e rejeitam registros fora do usuario logado.
4. Em erro funcional (`success=false`), o topico responde mensagem de negocio e oferece escalacao para Backoffice.
5. Validacao de seguranca: Student executa topicos com sucesso; usuarios sem contexto de aluno recebem resposta controlada, sem stacktrace.

**Esforco Estimado:** M

**Relacao com PRD:** VA-01, VA-02, VA-03, VA-04, VA-05, VA-06

---

## [US-35] Fiacao de Indicadores no Dashboard de Performance

**User Story:** Como Training Operations Manager, eu quero os widgets conectados aos KPIs reais para que a tomada de decisao seja baseada em dados confiaveis.

**Criterios de Aceitacao:**
1. `TrainingKpiService.collectDailySnapshot(30)` grava 16 KPIs por `snapshot_date` na tabela `x_783010_tocc_a1_kpi_snapshot`.
2. Indicadores do Analytics Hub estao criados e vinculados aos widgets de score (fill rate, no-show, confirmation rate, avg approval time, feedback, KB views).
3. Os widgets de distribuicao/status mantem fonte operacional e passam validacao cruzada com KPIs de contagem (`sessions_by_status_count`, `reservations_by_status_count`).
4. ACL/visibilidade: `manager` e `backoffice` leem dashboard; `admin` gerencia; `student` nao acessa dashboard gerencial.
5. O agendamento diario de coleta (SCH-005) mantem dados atualizados sem duplicidade para o mesmo dia.

**Esforco Estimado:** G

**Relacao com PRD:** TS-02, SE-06, SE-07, AT-03, BR-16, BR-17, BR-18

---

## [US-36] Garantir Integridade dos Vinculos CMDB em Room Resources

**User Story:** Como Admin, eu quero validar e enriquecer os vinculos com CMDB para que os recursos de sala tenham rastreabilidade de ativos.

**Criterios de Aceitacao:**
1. Business Rule `Validate Room Resource CI Reference` permanece ativa em `before insert/update` na tabela `x_783010_tocc_a1_room_resource`.
2. `CmdbResourceService.validateRoomResourceCi()` bloqueia CI inexistente ou aposentado (`install_status` retired/6/7).
3. `CmdbResourceService.enrichResourceFromCi()` preenche automaticamente `resource_name` e `resource_type` quando os campos estao vazios.
4. Validacao UI/operacao: lista `Resources Missing CI Link` no Workspace reflete backlog real de saneamento.
5. Auditoria manual em background script reporta zero vinculos invalidos apos saneamento.

**Esforco Estimado:** M

**Relacao com PRD:** RM-03, RM-05

---

## [US-37] Finalizar Composicao do Workspace de Backoffice

**User Story:** Como Backoffice, eu quero o workspace final com filtros e tiles operacionais para agir rapidamente sobre pendencias.

**Criterios de Aceitacao:**
1. Workspace `tocc-backoffice-ops` mostra 5 categorias e 10 listas conforme `UxListMenuConfig` do scaffold.
2. Filtros tecnicos das listas estao aderentes ao processo (ex.: `statusINopen,full`, `status=submitted`, `ci_referenceISEMPTY`).
3. Tiles de operacao consomem `PortalApiService.getOperationsSnapshot()` e exibem contadores sem query direta no client.
4. Bloco de highlights exibe `kpi_highlights` com os 4 KPIs operacionais principais.
5. Validacao de ACL: `backoffice` e `manager` acessam leitura; `admin` administra; sem erro de permissao em listas/widgets.

**Esforco Estimado:** M

**Relacao com PRD:** RR-05, TS-04, SE-05, AT-04, BR-18

---

## [US-38] Homologacao Integrada dos Modulos Manuais de Plataforma

**User Story:** Como Arquiteto da Solucao, eu quero homologar os modulos manuais em um checklist unico para que o release V1 seja liberado com risco controlado.

**Criterios de Aceitacao:**
1. Runbook `docs/manual-config/platform-alignment-runbook.md` executado fim a fim com evidencia por bloco (VA, Analytics, CMDB, Workspace).
2. Dependencias de automacao ativas: 5 Flows + 5 Scheduled Jobs + Event Registry completo.
3. Smoke técnico aprovado:
   - VA: confirmar/cancelar enrollment por `number` e `sys_id`
   - Analytics: widgets preenchidos
   - CMDB: sem link invalido
   - Workspace: filtros e tiles corretos
4. Testes ATF relevantes executados sem falha para os servicos centrais (`VirtualAgentTopicService`, `TrainingKpiService`, CMDB, Workspace).
5. Registro de go/no-go anexado com pendencias residuais e plano de correcao.

**Esforco Estimado:** P

**Relacao com PRD:** VA-01, VA-02, VA-03, VA-04, VA-05, VA-06, KB-01, KB-02, KB-03, KB-04, RM-03, RR-05, TS-04, AT-03, AT-04, BR-16, BR-17, BR-18

