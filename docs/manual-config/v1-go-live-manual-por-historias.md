# Manual V1 por Historias

Este guia organiza o go-live da V1 por historias operacionais, com foco em entrega incremental e validacao rapida.
Base de historias: `NOW_CREATE_BACKLOG.md` (US-01 ate US-32).

## Como usar

1. Execute as historias na ordem.
2. So avance quando os criterios de pronto da historia atual estiverem completos.
3. Registre evidencias (prints, links, sys_id, logs) em cada historia.

## H00 - Preparar ambiente V1

**Objetivo:** garantir base tecnica antes das historias funcionais.

**Passos:**
- Rodar `npm run build`
- Rodar `now-sdk install --auth dev`
- Validar app instalada em `sys_app`

**Pronto quando:**
- Build sem erro
- Deploy sem erro
- Flows SDK ativados

---

## H01 - Reserva de sala com aprovacao (US-03, US-04, US-05, US-06)

**Objetivo:** instrutor envia reserva e Backoffice aprova/rejeita.

**Dependencias manuais:**
- Event Registry (12 eventos)
- Grupo `[TOCC] Backoffice`
- Flow `[TOCC] Reservation Approval` ativo

**Validacao:**
- Reserva `submitted` gera aprovacao
- Decisao de aprovacao atualiza status da reserva
- Notificacao correta e enviada

**Pronto quando:**
- Caso aprovado e caso rejeitado funcionam ponta a ponta

---

## H02 - Inscricao com aprovacao (US-11, US-12, US-13, US-14, US-15)

**Objetivo:** aluno se inscreve e o fluxo aplica modo direto ou aprovacao por instrutor.

**Dependencias manuais:**
- Flow `[TOCC] Enrollment Approval` ativo
- Notificacoes com event binding correto

**Validacao:**
- Modo `direct`: inscricao aprovada automaticamente
- Modo `instructor_approval`: gera aprovacao para instrutor
- Mudancas de status notificam aluno

**Pronto quando:**
- Seat sync e notificacoes estao corretos

---

## H03 - Confirmacao e lembretes de sessao (US-16, US-17, FLOW-04, FLOW-05, SCH-001)

**Objetivo:** confirmar presenca no prazo e enviar lembretes.

**Dependencias manuais:**
- Flow `[TOCC] Attendance Confirmation Request` ativo
- Flow `[TOCC] Session Reminder Dispatch` ativo
- Job `[TOCC] Send Session Reminders` ativo

**Validacao:**
- Aluno recebe pedido de confirmacao
- Aluno recebe lembrete de sessao
- Sessao `full` tambem recebe lembrete

**Pronto quando:**
- Mensagens disparam para o publico esperado

---

## H04 - Liberacao de vagas nao confirmadas (US-18, SCH-002)

**Objetivo:** liberar assento de quem nao confirmou e promover waitlist.

**Dependencias manuais:**
- Job `[TOCC] Release Unconfirmed Seats` ativo

**Validacao:**
- Enrollments aprovados e nao confirmados sao cancelados apos deadline
- Vaga retorna para sessao
- Promocao de waitlist ocorre quando aplicavel

**Pronto quando:**
- Cenario de liberacao foi testado com dados reais

---

## H05 - Fechamento, cancelamento e notificacao de sessao (US-07, US-08, US-09, US-10, FLOW-03, SCH-003)

**Objetivo:** garantir encerramento operacional e comunicacao.

**Dependencias manuais:**
- Flow `[TOCC] Session Cancellation Notification` ativo
- Job `[TOCC] Close Past Training Sessions` ativo

**Validacao:**
- Cancelamento de sessao notifica participantes
- Sessao passada fecha automaticamente
- Feedback request e disparado apos fechamento

**Pronto quando:**
- Logs e notificacoes confirmam disparos

---

## H06 - Operacao de backlog e alertas (US-20, US-21, US-22, SCH-004)

**Objetivo:** detectar aprovacoes paradas e reduzir filas.

**Dependencias manuais:**
- Job `[TOCC] Detect Stale Pending Approvals` ativo

**Validacao:**
- Reservas/enrollments pendentes recebem alerta em `work_notes`

**Pronto quando:**
- Alertas aparecem dentro da janela configurada

---

## H07 - Ajuda digital (US-23, US-24, US-25, US-26, US-27, US-28)

**Objetivo:** disponibilizar autosservico para aluno e instrutor.

**Dependencias manuais:**
- Rodar `KnowledgeBaseBootstrapService.bootstrap()`
- Criar topicos no Virtual Agent Designer

**Validacao:**
- Portal mostra artigos de KB
- VA responde topicos de V1 e consegue escalar para Backoffice

**Pronto quando:**
- KB e VA estao acessiveis sem erro no portal

---

## H08 - Indicadores e dashboard de operacao (US-29, US-30, US-31, US-32)

**Objetivo:** ativar visao de KPI para gerente e backoffice.

**Dependencias manuais:**
- Job `[TOCC] Collect KPI Snapshots` ativo
- Indicadores no Analytics Hub criados e vinculados aos widgets

**Validacao:**
- Snapshot diario popula `x_783010_tocc_a1_kpi_snapshot`
- Widgets deixam de ficar vazios

**Pronto quando:**
- Dashboard exibe dados com consistencia

---

## Evidencias minimas para liberar V1

- 1 evidenca por historia (H01 ate H08)
- ATF verde para blocos criticos
- Checklist manual completo (ver `v1-manual-desenvolvimento-plataforma.md`)
