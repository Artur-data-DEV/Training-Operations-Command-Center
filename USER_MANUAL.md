# 📚 Training Operations Command Center
## Manual do Usuário — Versão 1.0

> Bem-vindo à plataforma de gestão de treinamentos da sua organização.
> Este guia mostra tudo que você pode fazer aqui — de acordo com o seu perfil.

---

# 🎓 Você é um Aluno (Student)

Você quer aprender. A plataforma está aqui para facilitar isso.

---

## Onde você começa

Acesse o portal em **`/tocc`** com seu usuário corporativo. Você vai ver:

- Uma **barra de ações rápidas** no topo
- Uma lista de **sessões de treinamento disponíveis** logo abaixo
- Links para suas inscrições e central de ajuda

---

## O que você pode fazer

### 🔍 Explorar treinamentos disponíveis

Na página **Sessões Disponíveis** (`/tocc?id=tocc_sessions`), você vê todos os treinamentos abertos com:

- Nome do curso e instrutor
- Data, horário e sala
- Quantidade de vagas disponíveis
- Status: **Aberta** (tem vagas) ou **Lotada** (lista de espera)

Você pode filtrar por curso, localização ou data.

---

### ✋ Se inscrever em um treinamento

Na página de detalhes da sessão, clique em **Inscrever-se**.

O que acontece depois:
- Se houver vagas → sua inscrição vai para **Aprovação** (ou é aprovada automaticamente, dependendo da configuração)
- Se estiver lotada → você entra na **Lista de Espera** e recebe uma posição
- Você recebe um e-mail confirmando o status

> 💡 Sua inscrição tem número próprio com prefixo **ENR**.

---

### 📋 Ver suas inscrições

Acesse **Minhas Inscrições** (`/tocc?id=tocc_my_enrollments`).

Você vê todas as suas inscrições com:

| Status | O que significa |
|---|---|
| 🟡 Pendente | Aguardando aprovação do instrutor |
| ✅ Aprovada | Você tem uma vaga confirmada |
| ⏳ Lista de Espera | Você entra se alguém cancelar |
| ❌ Cancelada | Inscrição cancelada |
| 🚫 Rejeitada | Não foi possível aprovar |

---

### ✅ Confirmar sua presença

Quando o treinamento estiver próximo, você receberá um **e-mail pedindo confirmação**.

Para confirmar:
1. Acesse **Minhas Inscrições**
2. Clique em **Confirmar Presença** na inscrição correspondente
3. Pronto — sua vaga está garantida

> ⚠️ Se você não confirmar antes do prazo, sua vaga pode ser liberada automaticamente para quem está na lista de espera.

---

### ❌ Cancelar uma inscrição

Na página **Minhas Inscrições**, clique em **Cancelar**.

Atenção à política:
- Se o treinamento começa em menos de **4 horas** (padrão), o cancelamento é bloqueado
- Nesse caso, entre em contato com o Backoffice pela **Central de Ajuda**

---

### ⭐ Dar feedback

Depois que o treinamento terminar, você receberá um e-mail pedindo avaliação.

Você pode dar uma nota de **1 a 5** e deixar um comentário. Sua opinião ajuda a melhorar os próximos treinamentos.

---

### 💬 Falar com o Assistente Virtual

Na **Central de Ajuda** (`/tocc?id=tocc_help`), você pode conversar com o **TOCC Assistant**.

Diga para ele:
- *"Mostrar treinamentos disponíveis"*
- *"Quais são minhas inscrições?"*
- *"Confirmar minha presença"*
- *"Cancelar minha inscrição"*
- *"Qual é a política de cancelamento?"*
- *"Quero falar com o backoffice"*

---

### 📖 Base de Conhecimento

Também na Central de Ajuda, você tem acesso a artigos de autosserviço:

- Como me inscrever
- Como funciona a lista de espera
- Como confirmar presença
- O que acontece se eu não aparecer
- Política de cancelamento

---

# 👩‍🏫 Você é um Instrutor (Instructor)

Você ministra treinamentos. A plataforma cuida da logística para você.

---

## O que você pode fazer

### 🏢 Reservar uma sala

No **Catálogo de Serviços**, selecione **Criar Reserva de Sala**.

Preencha:
- Curso
- Sala (com capacidade, tipo e localização)
- Data e hora de início e fim
- Número de participantes esperados
- Recursos necessários (projetor, sistema AV, computador)

A plataforma valida automaticamente:
- ❌ Conflito de horário na sala
- ❌ Participantes acima da capacidade
- ❌ Solicitação com menos de 24h de antecedência (padrão)

Sua reserva vai para aprovação do **Backoffice** e você recebe o número **RSV** gerado.

---

### 📬 Acompanhar sua reserva

Em **Minhas Reservas** (`/tocc?id=tocc_my_reservations`) você vê:

| Status | O que significa |
|---|---|
| 📝 Rascunho | Salva mas não submetida |
| ⏳ Submetida | Aguardando aprovação |
| ✅ Aprovada | Sala confirmada, sessão criada |
| ❌ Rejeitada | Revise e submeta novamente |
| 🚫 Cancelada | Reserva encerrada |

Quando aprovada → uma **Sessão de Treinamento** é criada automaticamente com os dados da reserva.

---

### 🚀 Iniciar a sessão

No dia do treinamento, abra o registro da sessão e clique em **Iniciar Sessão**.

Isso:
- Muda o status para **Em Andamento**
- Gera automaticamente os registros de presença para todos os alunos aprovados

---

### ✔️ Marcar presença

Com a sessão em andamento, você vê a lista de alunos.

Para cada um, marque:
- **Presente** — compareceu
- **Ausente** — não veio (justificado)
- **No-show** — não compareceu sem aviso

O sistema registra automaticamente hora e quem marcou.

---

### 🔐 Aprovar inscrições (quando aplicável)

Se o sistema estiver configurado para aprovação de inscrições pelo instrutor, você receberá uma **tarefa de aprovação** para cada aluno que se inscrever nas suas sessões.

Você pode **Aprovar** ou **Rejeitar** diretamente — o aluno é notificado automaticamente.

---

### 📊 Ver indicadores básicos

No **Workspace de Backoffice**, você consegue ver:
- Suas sessões abertas e lotadas
- Alunos inscritos e status de confirmação
- Taxa de ocupação da sessão

---

# 🗂️ Você é do Backoffice (Backoffice Operator)

Você mantém o sistema funcionando. A plataforma centraliza tudo no seu workspace.

---

## Seu workspace

Acesse o **TOCC Backoffice Operations Workspace** pelo Now Experience.

Você tem 5 categorias de navegação:

---

### 📅 Reservas

**Reservas Submetidas** — tudo que está aguardando sua aprovação.

Para cada reserva você pode:
- Ver detalhes: sala, instrutor, curso, datas, participantes
- Clicar **Aprovar** → sessão criada automaticamente
- Clicar **Rejeitar** → instrutor notificado
- Verificar alertas de aprovações paradas há mais de 48h (marcadas com `[ALERT]`)

**Reservas Recentes** — histórico dos últimos 30 dias.

---

### 📚 Sessões de Treinamento

**Sessões Abertas** — todas as sessões com status Aberta ou Lotada.

**Sessões de Hoje** — o que acontece hoje. Sua visão operacional diária.

Ações disponíveis em qualquer sessão:
- **Iniciar Sessão** → gera lista de presença
- **Fechar Sessão** → encerra antecipadamente, dispara pedido de feedback
- **Reabrir Sessão** → para casos excepcionais
- **Cancelar** → todos os alunos notificados automaticamente

---

### 👥 Inscrições

**Inscrições Pendentes** — aguardando aprovação (modo instructor_approval ativo).

**Alunos em Lista de Espera** — com posição e sessão.

Você pode **Aprovar** ou **Rejeitar** inscrições manualmente em qualquer caso.

Você também pode **cancelar** inscrições de alunos além do prazo — único perfil com essa permissão.

---

### ✅ Presença

**Presença de Sessões em Andamento** — lista de todos os alunos com status pendente nas sessões que estão rolando agora.

**Presença Pendente Hoje** — alunos de sessões de hoje que ainda não foram marcados.

---

### 🖥️ Ativos e Recursos

**Recursos sem Vínculo de CI** — lista de recursos de sala que não têm um CI do CMDB associado. Sua fila de auditoria de ativos.

**Recursos Ativos** — inventário completo de todos os recursos de sala ativos.

---

### Alertas automáticos que chegam para você

O sistema monitora e avisa sobre:

| Evento | Quando |
|---|---|
| Aprovação parada | Reserva ou inscrição pendente há mais de 48h |
| Vaga liberada | Aluno que não confirmou presença teve vaga liberada |
| Sessão encerrada | Sessões passadas fechadas automaticamente às 02:00 |
| KPI coletado | Snapshot diário de KPIs salvo às 01:15 |

---

# 📊 Você é Gestor de Operações (Training Operations Manager)

Você toma decisões com base em dados. A plataforma tem um dashboard dedicado para você.

---

## Seu dashboard

Acesse o **Training Operations Performance Dashboard** pelo Performance Analytics.

Ele tem **2 abas**:

---

### Aba 1 — Resumo Executivo

**4 tiles de KPI no topo:**

| KPI | O que mede | Meta |
|---|---|---|
| 📈 Taxa de Ocupação das Sessões | % de vagas preenchidas nas sessões concluídas | ≥ 75% |
| 🚫 Taxa de No-Show | % de alunos que não compareceram | < 15% |
| ✅ Taxa de Confirmação de Presença | % de aprovados que confirmaram | > 85% |
| ⏱️ Tempo Médio de Aprovação (h) | Horas para aprovar reservas | < 4h |

**2 gráficos centrais:**
- 🍩 Sessões por Status (donut)
- 📊 Reservas por Status (barras)

---

### Aba 2 — Inteligência Operacional

**Salas mais usadas** — quais salas têm mais sessões (últimos 90 dias).

**Recursos mais solicitados** — projetores, AV, computadores — o que mais é pedido.

**Avaliação média de feedback** — gauge de 1 a 5 com meta > 4.0.

**Visualizações de artigos da KB** — tendência de uso do autosserviço.

---

### Os 16 KPIs monitorados

O sistema coleta automaticamente, todo dia às 01:15, um snapshot dos seguintes indicadores:

1. Taxa de Ocupação de Salas (horas usadas vs disponíveis)
2. Taxa de Preenchimento de Sessões
3. Taxa de No-Show
4. Taxa de Confirmação de Presença
5. Tempo Médio de Aprovação de Reserva
6. Tempo Médio de Aprovação de Inscrição
7. Taxa de Cancelamento
8. Cancelamentos Tardios Bloqueados
9. Taxa de Conversão de Lista de Espera
10. Sessões por Status
11. Reservas por Status
12. Salas Mais Utilizadas
13. Recursos Mais Solicitados
14. Visualizações de Artigos da KB
15. Taxa de Deflexão do Virtual Agent
16. Média de Avaliação de Feedback

Todos os dados ficam em `x_783010_tocc_a1_kpi_snapshot` com histórico navegável.

---

# 🔧 Você é Administrador (Admin)

Você configura e mantém a plataforma. Você tem acesso total.

---

## Configuração inicial (pós-deploy)

### 1. Bootstrap da Knowledge Base

Execute no **Scripts - Background** (escopo `x_783010_tocc_a1`):

```javascript
var svc = new x_783010_tocc_a1.KnowledgeBaseBootstrapService();
var result = svc.bootstrap();
gs.info(JSON.stringify(result));
```

Cria automaticamente: 1 KB, 10 categorias, 13 artigos publicados.

---

### 2. Bootstrap de Ativos CMDB

Para cada sala, execute:

```javascript
var svc = new x_783010_tocc_a1.CmdbBootstrapService();
var result = svc.bootstrapSampleAssetsForRoom('<room_sys_id>');
gs.info(JSON.stringify(result));
```

Cria: Projector CI, AV System CI, Room Computer CI + vincula como `room_resource`.

---

### 3. Parâmetros operacionais configuráveis

Acesse `x_783010_tocc_a1_training_config` (ou via `sys_properties` com prefixo `x_783010_tocc_a1.config.*`):

| Parâmetro | Padrão | O que controla |
|---|---|---|
| `minimum_advance_notice_hours` | 24h | Antecedência mínima para reserva |
| `late_cancellation_window_hours` | 4h | Janela de bloqueio de cancelamento |
| `waitlist_mode` | `waitlist` | `waitlist` ou `block` para sessão lotada |
| `enrollment_approval_mode` | `direct` | `direct` ou `instructor_approval` |
| `confirmation_lead_hours` | 24h | Prazo para confirmar presença |
| `reminder_lead_hours` | 24h | Antecedência do lembrete |
| `feedback_window_hours` | 48h | Janela de feedback pós-sessão |
| `stale_approval_hours` | 48h | Alerta de aprovação parada |

---

### 4. Dados mestres que você gerencia

- **Salas** — `x_783010_tocc_a1_room` — nome, código, capacidade, tipo, localização
- **Recursos de Sala** — `x_783010_tocc_a1_room_resource` — link com CMDB CI
- **Cursos** — `x_783010_tocc_a1_course` — catálogo de cursos disponíveis
- **Perfis de Aluno** — `x_783010_tocc_a1_student` — um perfil por usuário do sistema

---

### 5. Jobs agendados que você monitora

| Job | Schedule | Função |
|---|---|---|
| Send Session Reminders | A cada hora | Envia lembretes 24h antes |
| Release Unconfirmed Seats | A cada 30min | Libera vagas não confirmadas |
| Close Past Training Sessions | Diário 02:00 | Fecha sessões passadas |
| Detect Stale Pending Approvals | Diário 06:00 | Alerta aprovações paradas |
| Collect KPI Snapshots | Diário 01:15 | Coleta 16 KPIs para o dashboard |

---

### 6. Segurança — o que cada perfil acessa

| Permissão | Aluno | Instrutor | Backoffice | Gestor | Admin |
|---|---|---|---|---|---|
| Ver salas | ✓ | ✓ | ✓ | ✓ | ✓ |
| Criar reserva | — | ✓ | ✓ | — | ✓ |
| Aprovar reserva | — | — | ✓ | — | ✓ |
| Criar inscrição | ✓ | — | ✓ | — | ✓ |
| Aprovar inscrição | — | ✓ | ✓ | — | ✓ |
| Marcar presença | — | ✓ (próprias) | ✓ | — | ✓ |
| Submeter feedback | ✓ | — | — | — | ✓ |
| Ver dashboard KPI | — | — | ✓ | ✓ | ✓ |
| Editar config | — | — | — | — | ✓ |
| Deletar registros | — | — | — | — | ✓ |

---

## Arquitetura resumida para o Admin

```
Service Portal (/tocc)
    └── 5 páginas + 5 widgets → PortalApiService (Script Include)

Approval Flows
    └── FLOW-01: Reserva → Backoffice group (askForApproval)
    └── FLOW-02: Inscrição → Direct ou Instrutor (config-driven)

Automação
    └── 5 Scheduled Jobs → limpeza, lembretes, KPIs
    └── 12 Notificações → via eventos (gs.eventQueue)

Workspace (Backoffice)
    └── 5 categorias, 10 listas filtradas

Dashboard (Manager)
    └── 2 abas, 10 widgets, 16 KPIs com snapshot diário

CMDB
    └── CIs de sala linkados via ci_reference em room_resource

Knowledge Base
    └── 13 artigos, 10 categorias, User Criteria por persona

Virtual Agent
    └── 6 tópicos com backend pronto via VirtualAgentTopicService
```

---

# 🚦 Guia de Resolução Rápida

| Problema | O que verificar |
|---|---|
| Não consigo me inscrever | Sessão está cancelada? Já existe uma inscrição sua nessa sessão? |
| Inscrição pendente há muito tempo | Contate Backoffice — pode ser aprovação parada (> 48h) |
| Não recebi e-mail de confirmação | Verifique spam ou contate Backoffice para checar event log |
| Sessão lotada e não entrei em lista de espera | Confirme o modo de waitlist com o Admin — pode estar em `block` |
| Cancelamento bloqueado | Treinamento em menos de 4h — contate Backoffice para override |
| Vaga perdida antes do treinamento | Prazo de confirmação de presença passou — contate Backoffice |
| Não vejo o dashboard | Verifique se você tem o perfil `x_783010_tocc_a1.manager` |

---

*Training Operations Command Center — Versão 1.0*
*Para suporte: Central de Ajuda (/tocc?id=tocc_help) ou contate o Backoffice*
