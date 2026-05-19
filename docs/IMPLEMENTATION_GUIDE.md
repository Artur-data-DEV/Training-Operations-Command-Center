# Implementation & Configuration Guide

# SERVICE_PORTAL.md — Training Operations Command Center

> **Sprint:** 5
> **Strategy:** SDK-assisted — `PortalApiService` Script Include is SDK-first.
> Portal structure (pages/widgets/portal) is versioned in Fluent metadata under `src/fluent/portal/`.
> This document is the operational runbook for validation and optional instance-level adjustments.

---

## Portal Identity

| Property | Value |
|---|---|
| Portal URL suffix | `tocc` |
| Portal title | Training Operations |
| Portal ID | `x_783010_tocc_a1_portal` |
| Default theme | Based on `stock-theme`; customise colors to match org branding |
| Knowledge Base | Linked to TOCC KB (configured in Sprint 7) |
| Virtual Agent | Enabled after Sprint 7 VA configuration |

---

## Architecture

```
Service Portal (AngularJS 1.x widgets)
        │
        ├── GlideAjax → PortalApiService (SDK-deployed Script Include)
        │       ├── getAvailableSessions()
        │       ├── getSessionDetail()
        │       ├── getMyEnrollments()
        │       ├── getMyReservations()
        │       └── confirmMyAttendance()
        │
        ├── GlideAjax → TrainingContextAjax (SDK-deployed)
        │       ├── checkRoomAvailability()
        │       └── getAvailableRoomsByLocation()
        │
        └── Service Catalog → Record Producers (SDK-deployed)
                ├── Create Room Reservation
                └── Request Training Enrollment
```

**Widget data flow:**
Each widget has a `server script` (runs server-side, can use GlideRecord) and a `client controller` (AngularJS, calls server script or GlideAjax). Server scripts in widgets should be thin — use `PortalApiService` for all data access so logic stays testable and version-controlled.

---

## Pages

### Page 1 — Home (`/tocc`)

**Purpose:** Landing page for all personas. Shows upcoming sessions, quick links.

**Layout:** 2-column. Left: featured sessions list. Right: quick action cards.

**Widgets:**
- `TOCC - Hero Banner` — welcome message, search bar for sessions
- `TOCC - Upcoming Sessions` — top 5 next open sessions
- `TOCC - Quick Actions` — role-aware cards (Enroll, My Enrollments, Reserve Room, Help)

**User Criteria:** Public within portal (all authenticated users with any TOCC role).

---

### Page 2 — Available Sessions (`/tocc?id=tocc_sessions`)

**Purpose:** Full catalog of open/full sessions with filters.

**Widgets:**
- `TOCC - Session Filters` — filter by course, location, date range
- `TOCC - Session List` — paginated session cards showing title, instructor, room, seats, status

**Server script pattern:**
```javascript
// Widget server script
(function() {
    var ga = new x_783010_tocc_a1.PortalApiService();
    // PortalApiService is called server-side here; in the client controller use GlideAjax.
    data.sessions = [];
    var gr = new GlideRecordSecure('x_783010_tocc_a1_training_session');
    gr.addQuery('status', 'IN', 'open,full');
    gr.orderBy('start_datetime');
    gr.setLimit(20);
    gr.query();
    while (gr.next()) {
        data.sessions.push({
            sys_id:          gr.getUniqueValue(),
            title:           gr.getValue('title'),
            course_name:     gr.getDisplayValue('course'),
            instructor_name: gr.getDisplayValue('instructor'),
            room_name:       gr.getDisplayValue('room'),
            start_display:   gr.getDisplayValue('start_datetime'),
            available_seats: gr.getValue('available_seats'),
            status:          gr.getValue('status'),
        });
    }
})();
```

---

### Page 3 — Session Detail (`/tocc?id=tocc_session_detail&sys_id=<session_sys_id>`)

**Purpose:** Full detail for a single training session. Student can enroll or view their existing enrollment from here.

**Widgets:**
- `TOCC - Session Detail` — full session info (course, instructor, room, dates, seats, description)
- `TOCC - Enrollment Action` — context-aware: shows Enroll button, waitlist notice, or enrollment status depending on student state

**Client controller GlideAjax pattern:**
```javascript
// Widget client controller (AngularJS)
function($scope, $location, spUtil) {
    var sessionId = $location.search().sys_id;
    if (!sessionId) { return; }

    var ga = new GlideAjax('x_783010_tocc_a1.PortalApiService');
    ga.addParam('sysparm_name', 'getSessionDetail');
    ga.addParam('sysparm_session_id', sessionId);
    ga.getXMLAnswer(function(answer) {
        $scope.$apply(function() {
            var result = JSON.parse(answer);
            if (result.success) {
                $scope.session    = result.session;
                $scope.enrollment = result.enrollment;
            }
        });
    });
}
```

---

### Page 4 — My Enrollments (`/tocc?id=tocc_my_enrollments`)

**Purpose:** Student's personal enrollment history with status and confirmation action.

**Widgets:**
- `TOCC - My Enrollment List` — table of enrollments with status badges, session info, confirm button
- `TOCC - Confirm Attendance Button` — calls `PortalApiService.confirmMyAttendance()` via GlideAjax

**User Criteria:** Students only (`x_783010_tocc_a1.student` role required).

**Confirm attendance client pattern:**
```javascript
function confirmAttendance(enrollmentId) {
    var ga = new GlideAjax('x_783010_tocc_a1.PortalApiService');
    ga.addParam('sysparm_name', 'confirmMyAttendance');
    ga.addParam('sysparm_enrollment_id', enrollmentId);
    ga.getXMLAnswer(function(answer) {
        $scope.$apply(function() {
            var result = JSON.parse(answer);
            spUtil.addErrorMessage(result.message);
            if (result.success) { loadEnrollments(); }
        });
    });
}
```

---

### Page 5 — My Reservations (`/tocc?id=tocc_my_reservations`)

**Purpose:** Instructor's list of their own room reservation requests with status.

**Widgets:**
- `TOCC - My Reservation List` — cards with reservation number, course, room, dates, status badge

**User Criteria:** Instructors only (`x_783010_tocc_a1.instructor` role required).

---

### Page 6 — Help Center (`/tocc?id=tocc_help`)

**Purpose:** Self-service hub. Links to KB articles and Virtual Agent.

**Widgets:**
- Standard SP `KB Search` widget — scoped to TOCC Knowledge Base
- Standard SP `Virtual Agent Launcher` — after Sprint 7 VA setup
- `TOCC - Contact Backoffice` — mailto or catalog item link for escalation

---

## Widget Build Checklist

For each custom widget, navigate to **Service Portal → Widgets → Create New** and implement:

| Property | Value |
|---|---|
| Widget ID | `x_783010_tocc_a1_<slug>` |
| Name | `TOCC - <Descriptive Name>` |
| Server Script | Thin; query via GlideRecordSecure or call PortalApiService |
| HTML Template | AngularJS bindings; use Bootstrap 3 classes (SP default) |
| Client Controller | Handle GlideAjax calls, `$scope` updates, user interactions |
| CSS | Scope all selectors under `.tocc-<widget>` to avoid global conflicts |
| Link Function | Use only for DOM-level operations (e.g. chart init) |

---

## User Criteria

| Criteria Name | Condition | Applied To |
|---|---|---|
| TOCC Students | User has role `x_783010_tocc_a1.student` | My Enrollments page, Enroll button |
| TOCC Instructors | User has role `x_783010_tocc_a1.instructor` | My Reservations page, Reserve Room catalog item |
| TOCC Any Role | User has any of the 5 TOCC roles | Portal home, session list, help center |

**Create User Criteria:** Navigate to **Service Portal → User Criteria → New**
Set script-based criteria using `gs.hasRole('x_783010_tocc_a1.student')` pattern.

---

## Catalog Integration

Both Record Producers deployed via SDK are surfaced in the portal:

| Record Producer | Portal Entry Point | Audience |
|---|---|---|
| Create Room Reservation | My Reservations page → "New Reservation" button → opens catalog item | Instructors |
| Request Training Enrollment | Session Detail page → "Enroll" button → opens catalog item | Students |

To link a catalog item in a portal widget, use the standard SP `catalog-item` URL:
```
/tocc?id=sc_cat_item&sys_id=<record_producer_sys_id>
```

---

## Theme & Branding

Navigate to **Service Portal → Portals → TOCC Portal → Theme**:

| Token | Value |
|---|---|
| `$navbar-default-bg` | `#1a3c5e` (dark blue — adjust to org palette) |
| `$brand-primary` | `#0073e6` |
| `$brand-success` | `#28a745` |
| Font | Keep default `Source Sans Pro` or match org standard |

---

## Manual Configuration (Optional Overrides)

### Step 1 — Create the Portal
Navigate to **Service Portal → Portals → New**
- URL suffix: `tocc`
- Title: `Training Operations`
- Homepage: create Page 1 first, then link here

### Step 2 — Create Pages
Navigate to **Service Portal → Pages → New** for each page listed above.
- Set the page ID exactly as specified (used in URL routing)
- Add widgets to the page layout via drag-and-drop in the Designer

### Step 3 — Create Widgets
Navigate to **Service Portal → Widgets → New** for each custom widget.
Implement server script, HTML template, and client controller per patterns above.

### Step 4 — Configure User Criteria
Navigate to **Service Portal → User Criteria → New**
Create one criteria per row in the User Criteria table above.

### Step 5 — Link Knowledge Base
After Sprint 7 KB setup, navigate to **Portal record → Knowledge Bases** and link the TOCC KB.

### Step 6 — Enable Virtual Agent
After Sprint 7 VA setup, add the VA launcher widget to the Help Center page.

### Step 7 — Test Each Persona
Impersonate a user with each role (Student, Instructor, Backoffice) and walk through:
- Student: browse sessions → enroll → view My Enrollments → confirm attendance
- Instructor: view My Reservations → create reservation via catalog
- All: access Help Center → search KB → launch VA

---

*Last updated: Sprint 5 — Service Portal runbook, PortalApiService SDK-deployed.*


---

# VIRTUAL_AGENT_DESIGN.md — Training Operations Command Center

> **Version:** 1.1 — Sprint 7
> **Strategy:** Manual configuration required on instance.
> Topic build, NLU training, and conversation flow are authored in Virtual Agent Designer.
> This document is the authoritative spec for all TOCC VA topics.

---

## 1. VA Identity

| Property | Value |
|---|---|
| Bot Name | TOCC Assistant |
| Portal | TOCC Service Portal (`/tocc`) |
| NLU Model | Built-in ServiceNow NLU (English) |
| Fallback Topic | Escalate to Backoffice (Topic 5) |
| KB Integration | Training Operations Knowledge Base |

---

## 2. Topics

### Topic 1 — Find Available Training Sessions

**Intent:** User wants to browse or search for upcoming training sessions.

**Example utterances:**
- "Show me available training sessions"
- "What courses are coming up?"
- "I want to sign up for a training"
- "Are there any sessions next week?"

**Inputs collected by bot:**
- Course name or topic (optional, free text)
- Preferred date range (optional)
- Location (optional)

**Backend:**
- Calls `PortalApiService.getAvailableSessions()` via Script Include action step
- Returns top 5 matching sessions with title, date, room, available seats

**Response format:**
```
Here are upcoming sessions matching your search:

1. [Course Name] — [Date] — [Room] — [X seats available]
2. ...

Would you like to enroll in any of these, or see more details?
```

**KB fallback:** KB002 — How to Browse and Search Training Sessions

**Acceptance criteria:**
- Bot returns at least 1 session when open sessions exist
- Returns "no sessions found" message when none match
- Enroll option routes to Topic 2

---

### Topic 2 — View My Enrollments

**Intent:** Student wants to see their current enrollments and status.

**Example utterances:**
- "Show my enrollments"
- "What sessions am I registered for?"
- "My training registrations"
- "Did my enrollment go through?"

**Inputs collected:** None (uses logged-in user context)

**Backend:**
- Calls `PortalApiService.getMyEnrollments()` for the current user
- Returns all non-cancelled enrollments

**Response format:**
```
Here are your current enrollments:

1. [Session Title] — [Date] — Status: Approved / Pending / Waitlisted
   Confirmed: Yes / No

Would you like to confirm attendance, cancel an enrollment, or see session details?
```

**KB fallback:** KB003 — How to Enroll in a Training Session

**Acceptance criteria:**
- Bot shows correct enrollment list for logged-in student
- If no enrollments, offers to find sessions (routes to Topic 1)
- Status labels are human-readable (not raw database values)

---

### Topic 3 — Confirm Attendance

**Intent:** Student wants to confirm they will attend an upcoming session.

**Example utterances:**
- "Confirm my attendance"
- "I want to confirm for the training"
- "Mark me as attending"
- "Confirm presence for my session"

**Inputs collected:**
- If student has multiple approved unconfirmed enrollments: bot lists them and asks which one

**Backend:**
- Calls `PortalApiService.getMyEnrollments()` filtered to `approved` + `confirmed = false`
- On selection: calls `PortalApiService.confirmMyAttendance(enrollmentId)`

**Response format:**
```
I found the following upcoming sessions where you haven't confirmed yet:

1. [Session Title] — [Date]
2. ...

Which session would you like to confirm for?

[After selection:]
Your attendance for [Session Title] on [Date] has been confirmed. See you there!
```

**KB fallback:** KB006 — How to Confirm Your Attendance

**Acceptance criteria:**
- If student has exactly 1 unconfirmed approved enrollment, skip the list step
- If already confirmed, informs user and ends gracefully
- If confirmation deadline passed, informs user and offers Backoffice escalation
- Confirmation is reflected immediately in the enrollment record

---

### Topic 4 — Cancel My Enrollment

**Intent:** Student wants to cancel an enrollment.

**Example utterances:**
- "Cancel my enrollment"
- "I can't attend the training anymore"
- "Remove me from the session"
- "I want to unregister"

**Inputs collected:**
- Which enrollment to cancel (bot lists approved/pending enrollments)
- Confirmation: "Are you sure you want to cancel?" → Yes / No

**Backend:**
- Calls `PortalApiService.getMyEnrollments()` filtered to cancelable statuses
- On confirm: calls `PortalApiService.cancelMyEnrollment(enrollmentId)`
- Note: late cancellation validation is enforced server-side by `EnrollmentService` through PortalApiService

**Response format:**
```
You are currently enrolled in:

1. [Session Title] — [Date] — Status: Approved

Which enrollment would you like to cancel?

Are you sure you want to cancel [Session Title] on [Date]? (Yes / No)

[If Yes:]
Your cancellation request has been submitted. You will receive a confirmation notification.

[If within late window:]
This session starts in less than [X] hours and cannot be cancelled at this time.
Please contact the Backoffice team for assistance.
```

**KB fallback:** KB005 — How to Cancel Your Enrollment

**Acceptance criteria:**
- Bot correctly identifies late-window cases and offers escalation instead of proceeding
- Cancellation triggers notification to student
- Waitlist student is automatically promoted after cancellation (handled by `EnrollmentService`)

---

### Topic 5 — Escalate to Backoffice

**Intent:** User needs human assistance or has an issue the bot can't resolve.

**Example utterances:**
- "I need to talk to someone"
- "Connect me to support"
- "The bot can't help me"
- "I have a problem with my reservation"
- "I need a backoffice agent"

**Inputs collected:**
- Brief description of the issue (free text, optional)

**Backend:** No Script Include call. Bot sends a summary message and offers options.

**Response format:**
```
I'll connect you with the Training Operations team.

You can reach them via:
- Service Portal → Open a Request → Training Support
- Email: [backoffice-email@org.com]

Would you like me to open a support request on your behalf? (Yes / No)

[If Yes:] Redirects to catalog item or creates an incident via standard SP link.
```

**KB fallback:** KB012 — How to Handle Operational Exceptions

**Acceptance criteria:**
- This topic is always reachable as fallback from other topics
- Bot provides at least one concrete contact method
- Optional: opens catalog item directly if portal is available

---

### Topic 6 — Training Policies

**Intent:** User has a policy question (cancellation window, confirmation deadline, etc.).

**Example utterances:**
- "What is the cancellation policy?"
- "How far in advance do I need to book a room?"
- "When do I need to confirm my attendance?"
- "How does the waitlist work?"

**Inputs collected:** None

**Backend:** Calls `PortalApiService.getTrainingPolicies()` to return dynamic policy values.

**Response format:**
```
Here are the current Training Operations policies:

📅 Room reservations must be submitted at least [X] hours in advance.
🚫 Cancellations are not allowed within [X] hours of session start.
✅ Attendance confirmation is required [X] hours before the session.
⏳ Waitlist: if a session is full, you are automatically placed on a waitlist
   and promoted when a seat opens.

For the full policy guide, visit the Knowledge Base:
→ [Link to KB013]
```

**Note:** Policy values are configurable by Admin. VA topic shows the policy in plain language; for exact current values, bot links to KB013.

**Acceptance criteria:**
- Topic is reachable from the main menu and from policy-related utterances
- KB link is functional
- Response is clear for non-technical users

---

## 3. Main Menu Structure

When user first opens the Virtual Agent with no specific intent:

```
Hi! I'm the TOCC Assistant. How can I help you today?

1. 🔍 Find training sessions
2. 📋 View my enrollments
3. ✅ Confirm my attendance
4. ❌ Cancel an enrollment
5. 📖 Training policies
6. 🧑‍💼 Talk to Backoffice
```

---

## 4. NLU Training Notes

For each topic, add at least 10 training utterances covering:
- Formal phrasing ("I would like to view my enrollments")
- Casual phrasing ("show my sessions")
- Question form ("what am I enrolled in?")
- Action form ("cancel my registration")

Avoid overlap between Topic 2 (view) and Topic 3 (confirm) — add disambiguating examples.

---

## 5. Manual Configuration Steps

### Step 1 — Enable Virtual Agent
Navigate to **Virtual Agent → Configuration → Activate**
Ensure NLU is enabled for English.

### Step 2 — Create Topics
Navigate to **Virtual Agent → Designer → New Topic** for each topic above.
Set the example utterances listed in each topic spec.

### Step 3 — Configure Script Actions
For topics that call backend services, prefer `VirtualAgentTopicService` as adapter:
- Add a **Script Action step** in the flow
- Call the appropriate adapter method (`getMainMenu`, `findAvailableSessions`, `getMyEnrollments`, `confirmAttendance`, `cancelEnrollment`, `getTrainingPolicies`)
- Map output to conversation variables
- Keep `PortalApiService` calls encapsulated in the adapter only

### Step 4 — Link KB Articles
In each topic's fallback or "learn more" node, link to the corresponding KB article.

### Step 5 — Train NLU Model
Navigate to **NLU Workbench → Train Model** after adding all utterances.
Run test utterances for each topic before go-live.

### Step 6 — Add VA to Portal
Navigate to **Service Portal → TOCC Portal → Help Center page**
Add the **Virtual Agent Launcher** widget.
Set the bot identity to TOCC Assistant.

---

*Last updated: Sprint 12 — Full topic specs plus backend adapter contract and script-action guidance.*


---

# KNOWLEDGE_BASE_PLAN.md — Training Operations Command Center

> **Version:** 1.1 — Sprint 7
> **Strategy:** SDK-assisted — KB structure configured on instance; article content authored in instance UI.
> Export articles via Update Set for version control.

---

## 1. Knowledge Base Identity

| Property | Value |
|---|---|
| KB Name | Training Operations Knowledge Base |
| KB ID | `x_783010_tocc_a1_kb` |
| Language | English (primary); extend as needed |
| Linked Portal | TOCC Service Portal (`/tocc`) |
| Linked VA | TOCC Virtual Agent (Sprint 7) |

---

## 2. Category Structure

```
Training Operations Knowledge Base
├── For Students
│   ├── Getting Started
│   ├── Enrollments & Waitlist
│   └── Attendance & Cancellation
├── For Instructors
│   ├── Room Reservations
│   └── Session Management
├── For Backoffice
│   └── Operations & Approvals
└── Policies & Reference
```

---

## 3. Article Catalog

### Category: For Students — Getting Started

**KB001 — Welcome to the Training Portal**
- Audience: Student
- Summary: Overview of the portal, what you can do, and how to navigate.
- Content outline:
  - What is the Training Operations portal
  - How to log in and find your role
  - Quick links: Browse sessions, My enrollments, Help center
  - Contact Backoffice for access issues
- VA link: `Find available training sessions`

---

**KB002 — How to Browse and Search Training Sessions**
- Audience: Student
- Summary: How to find sessions by course, date, or location.
- Content outline:
  - Navigating to Available Sessions
  - Using filters (course, location, date)
  - Reading the session card (seats, status, instructor)
  - What "Full" status means vs "Open"
- VA link: `Find available training sessions`

---

### Category: For Students — Enrollments & Waitlist

**KB003 — How to Enroll in a Training Session**
- Audience: Student
- Summary: Step-by-step enrollment via portal.
- Content outline:
  - Open session detail page
  - Click Enroll — what happens next
  - Direct approval vs Instructor-approval mode
  - Enrollment confirmation email — what to expect
  - Enrollment deadline: when it closes
- VA link: `View my enrollments`

---

**KB004 — How the Waitlist Works**
- Audience: Student
- Summary: Explains waitlist behavior when a session is full.
- Content outline:
  - When you are added to the waitlist automatically
  - Your waitlist position
  - What happens when a seat opens (automatic promotion)
  - Waitlist promotion notification
  - How long you stay on the waitlist
- VA link: `View my enrollments`

---

**KB005 — How to Cancel Your Enrollment**
- Audience: Student
- Summary: Cancellation policy and steps.
- Content outline:
  - Where to cancel (My Enrollments page)
  - Late cancellation policy: cannot cancel within X hours of session start
  - What happens to your seat when you cancel (opens for waitlisted students)
  - Cancellation confirmation notification
  - Exceptions: contact Backoffice if within the late window
- VA link: `Cancel my enrollment`

---

### Category: For Students — Attendance & Cancellation

**KB006 — How to Confirm Your Attendance**
- Audience: Student
- Summary: Attendance confirmation deadline and steps.
- Content outline:
  - Why confirmation is required
  - Confirmation deadline (X hours before session start)
  - How to confirm: My Enrollments → Confirm Attendance button
  - What happens if you don't confirm: seat released automatically
  - Confirmation reminder notification
- VA link: `Confirm attendance`

---

**KB007 — What Happens If I Don't Show Up (No-Show Policy)**
- Audience: Student
- Summary: No-show impact and how to avoid it.
- Content outline:
  - How attendance is recorded (Instructor marks present/absent/no-show)
  - Impact of repeated no-shows (contact your manager/Backoffice)
  - How to notify if you can't attend last minute
  - Who to contact: Backoffice email/portal escalation

---

### Category: For Instructors — Room Reservations

**KB008 — How to Request a Room Reservation**
- Audience: Instructor
- Summary: End-to-end room booking via catalog.
- Content outline:
  - Navigate to Service Catalog → Create Room Reservation
  - Required fields: course, room, dates, expected participants
  - Minimum advance notice policy (X hours)
  - Capacity rule: participants cannot exceed room capacity
  - What happens after submission (Backoffice approval)
  - Reservation approval notification
- VA link: `Request room reservation help`

---

**KB009 — How to Request Extra Room Resources**
- Audience: Instructor
- Summary: Requesting projectors, AV equipment, etc. with a reservation.
- Content outline:
  - When to request resources (at reservation time or after)
  - Resource types available: projector, AV system, computer, microphone, display
  - How to add resources to a reservation
  - Resource confirmation handled by Backoffice

---

### Category: For Instructors — Session Management

**KB010 — How to Manage Your Training Session**
- Audience: Instructor
- Summary: Starting, marking attendance, and closing a session.
- Content outline:
  - Starting the session (Start Session UI action)
  - Marking attendance: present / absent / no-show
  - Closing the session early (Close Session action)
  - What triggers the feedback request to students

---

### Category: For Backoffice — Operations & Approvals

**KB011 — How to Approve or Reject a Room Reservation**
- Audience: Backoffice
- Summary: Approval workflow and what each decision triggers.
- Content outline:
  - Finding pending reservations (Reservations list filtered by status = submitted)
  - Reviewing conflict indicators
  - Approve: triggers session creation automatically
  - Reject: instructor notified, work note required
  - Stale approval alerts (flagged after X hours)

---

**KB012 — How to Handle Operational Exceptions**
- Audience: Backoffice
- Summary: Edge cases — cancellation overrides, seat management, escalation.
- Content outline:
  - Override late cancellation for a student
  - Manually adjust available seats
  - Reopen a completed session
  - Escalating to Admin for config changes

---

### Category: Policies & Reference

**KB013 — Training Operations Policies Summary**
- Audience: All
- Summary: Reference card for all configurable policies.
- Content outline:
  - Minimum advance notice for reservations
  - Late cancellation window
  - Attendance confirmation deadline
  - Waitlist behavior (waitlist vs block mode)
  - Feedback window
  - Stale approval threshold
- Note: Values are configurable by Admin in the Training Configuration table.

---

## 4. User Criteria Configuration

| Criteria | Articles |
|---|---|
| TOCC - Students Only | KB001–KB007 |
| TOCC - Instructors Only | KB008–KB010 |
| TOCC - Operations | KB011–KB012 |
| TOCC - Any Role | KB013 |

Apply criteria in **Service Portal → Knowledge Base → User Criteria** and on each article's **Can Read** field.

---

## 5. Manual Configuration Steps

### Step 1 — Create Knowledge Base
Navigate to **Knowledge → Knowledge Bases → New**
- Name: `Training Operations Knowledge Base`
- Owner group: `[TOCC] Backoffice`
- Link the KB to the TOCC portal under Portal record → Knowledge Bases

### Step 2 — Create Categories
Navigate to **Knowledge → Categories → New** for each category in section 2.

### Step 3 — Author Articles
Navigate to **Knowledge → Create New Article** for each entry in section 3.
- Set category per article catalog above
- Set audience via User Criteria (Can Read field)
- Publish each article after review

### Step 4 — Link to Virtual Agent
After Sprint 7 VA configuration, link each topic's fallback response to the relevant KB article via **NLU → Topics → [topic] → KB Article** reference.

---

*Last updated: Sprint 7 — Full article catalog, category structure, User Criteria plan.*


---

# PLATFORM_ANALYTICS_KPIS.md — Training Operations Command Center

> **Version:** 1.1 — Sprint 9
> **Strategy:** SDK-assisted. Indicator definitions configured on instance via Performance Analytics.
> Dashboard layout composed in Analytics Hub UI, with app-scoped KPI daily collector for baseline persistence.

---

## 1. Dashboard Identity

| Property | Value |
|---|---|
| Dashboard Name | Training Operations Performance Dashboard |
| Audience | Manager (primary), Backoffice (secondary), Admin |
| Refresh Cadence | Daily (automated) |
| Data Source | All `x_783010_tocc_a1_*` scoped app tables |

---

## 2. KPI Definitions

### KPI-01 — Room Conflict Rate

| Property | Value |
|---|---|
| **Objective** | Measure how often reservation submissions are blocked by room conflicts |
| **Source Table** | `x_783010_tocc_a1_room_reservation` |
| **Formula** | `(Reservations rejected for conflict / Total submissions) × 100` |
| **Filters** | Date range: rolling 30 days |
| **Visualization** | Single score widget + trend line |
| **Target** | 0% — any conflict is a scheduling failure |
| **Note** | System prevents conflicts at submission time; this measures misuse patterns |

---

### KPI-02 — Room Occupancy Rate

| Property | Value |
|---|---|
| **Objective** | Track how efficiently rooms are being used vs. available hours |
| **Source Table** | `x_783010_tocc_a1_training_session` + `x_783010_tocc_a1_room` |
| **Formula** | `(Total session hours in room / Total available room hours in period) × 100` |
| **Filters** | Status: `completed`, `in_progress`; date range: rolling 30 days |
| **Visualization** | Bar chart by room |
| **Target** | > 70% |

---

### KPI-03 — Training Session Fill Rate

| Property | Value |
|---|---|
| **Objective** | Measure how full sessions are when they run |
| **Source Table** | `x_783010_tocc_a1_training_session` |
| **Formula** | `((total_seats - available_seats) / total_seats) × 100` averaged across completed sessions |
| **Filters** | Status: `completed`; date range: rolling 30 days |
| **Visualization** | Gauge + trend |
| **Target** | > 75% |

---

### KPI-04 — No-Show Rate

| Property | Value |
|---|---|
| **Objective** | Track the percentage of enrolled students who don't attend |
| **Source Table** | `x_783010_tocc_a1_attendance` |
| **Formula** | `(Records with status = no_show / Total attendance records) × 100` |
| **Filters** | Date range: rolling 30 days |
| **Visualization** | Single score + trend line |
| **Target** | < 15% |

---

### KPI-05 — Attendance Confirmation Rate

| Property | Value |
|---|---|
| **Objective** | Track what percentage of approved students confirm attendance before the deadline |
| **Source Table** | `x_783010_tocc_a1_student_enrollment` |
| **Formula** | `(Enrollments with confirmed = true / Total approved enrollments) × 100` |
| **Filters** | Status: `approved`; date range: rolling 30 days |
| **Visualization** | Gauge |
| **Target** | > 85% |

---

### KPI-06 — Average Reservation Approval Time

| Property | Value |
|---|---|
| **Objective** | Measure how quickly Backoffice approves room reservations |
| **Source Table** | `x_783010_tocc_a1_room_reservation` |
| **Formula** | Average of `(approval timestamp - submission timestamp)` in hours |
| **Filters** | Status: `approved`; date range: rolling 30 days |
| **Visualization** | Single score (hours) + trend |
| **Target** | < 4 hours |

---

### KPI-07 — Average Enrollment Approval Time

| Property | Value |
|---|---|
| **Objective** | Measure how quickly instructor-gated enrollments are approved |
| **Source Table** | `x_783010_tocc_a1_student_enrollment` |
| **Formula** | Average of `(approved_at - requested_at)` in hours |
| **Filters** | Status: `approved`; enrollment_approval_mode: `instructor_approval`; rolling 30 days |
| **Visualization** | Single score (hours) |
| **Target** | < 4 hours |

---

### KPI-08 — Enrollment Cancellation Rate

| Property | Value |
|---|---|
| **Objective** | Track how often approved enrollments are later cancelled |
| **Source Table** | `x_783010_tocc_a1_student_enrollment` |
| **Formula** | `(Cancelled enrollments / Total approved enrollments) × 100` |
| **Filters** | Rolling 30 days |
| **Visualization** | Single score + trend |
| **Target** | < 20% |

---

### KPI-09 — Blocked Late Cancellations

| Property | Value |
|---|---|
| **Objective** | Track how often students attempt to cancel within the late-cancel window |
| **Source Table** | `x_783010_tocc_a1_student_enrollment` |
| **Formula** | Count of work notes containing `[BLOCKED] Late cancellation` in rolling 30 days |
| **Filters** | Date range: rolling 30 days |
| **Visualization** | Count widget |
| **Target** | Informational — no target; high values indicate scheduling behavior issue |

---

### KPI-10 — Waitlist Conversion Rate

| Property | Value |
|---|---|
| **Objective** | Measure how often waitlisted students eventually get a seat |
| **Source Table** | `x_783010_tocc_a1_student_enrollment` |
| **Formula** | `(Enrollments that moved from waitlisted → approved / Total ever-waitlisted enrollments) × 100` |
| **Filters** | Rolling 30 days |
| **Visualization** | Gauge |
| **Target** | > 40% |

---

### KPI-11 — Sessions by Status

| Property | Value |
|---|---|
| **Objective** | Snapshot of session pipeline |
| **Source Table** | `x_783010_tocc_a1_training_session` |
| **Formula** | Count grouped by `status` |
| **Filters** | Active sessions; current month |
| **Visualization** | Donut chart |
| **Target** | Informational |

---

### KPI-12 — Reservations by Status

| Property | Value |
|---|---|
| **Objective** | Snapshot of reservation pipeline |
| **Source Table** | `x_783010_tocc_a1_room_reservation` |
| **Formula** | Count grouped by `status` |
| **Filters** | Rolling 30 days |
| **Visualization** | Bar chart |
| **Target** | Informational |

---

### KPI-13 — Most Used Rooms

| Property | Value |
|---|---|
| **Objective** | Identify which rooms are most in demand |
| **Source Table** | `x_783010_tocc_a1_training_session` |
| **Formula** | Count of completed sessions grouped by `room` |
| **Filters** | Status: `completed`; rolling 90 days |
| **Visualization** | Horizontal bar chart (top 10) |
| **Target** | Informational — informs room investment decisions |

---

### KPI-14 — Most Requested Resources

| Property | Value |
|---|---|
| **Objective** | Identify which room resources are most requested |
| **Source Table** | `x_783010_tocc_a1_reservation_resource` |
| **Formula** | Count grouped by `resource` |
| **Filters** | Rolling 90 days |
| **Visualization** | Bar chart |
| **Target** | Informational |

---

### KPI-15 — Knowledge Article Views

| Property | Value |
|---|---|
| **Objective** | Measure KB effectiveness and self-service usage |
| **Source Table** | `kb_view` (platform table) |
| **Formula** | Count of views where knowledge base = TOCC KB |
| **Filters** | Rolling 30 days |
| **Visualization** | Trend line + top 5 articles |
| **Target** | Increasing trend = positive signal |

---

### KPI-16 — Feedback Average Rating

| Property | Value |
|---|---|
| **Objective** | Measure student satisfaction with training sessions |
| **Source Table** | `x_783010_tocc_a1_training_feedback` |
| **Formula** | Average of `rating` field across all submitted feedback |
| **Filters** | Rolling 30 days |
| **Visualization** | Gauge (1–5 scale) + trend |
| **Target** | > 4.0 / 5.0 |

---

## 3. Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ROW 1 — Executive Summary (4 score widgets)                    │
│  [Occupancy Rate] [Fill Rate] [No-Show Rate] [Avg Approval Time]│
├─────────────────────────────────────────────────────────────────┤
│  ROW 2 — Session & Reservation Pipeline (2 charts)              │
│  [Sessions by Status — donut] [Reservations by Status — bar]    │
├─────────────────────────────────────────────────────────────────┤
│  ROW 3 — Enrollment Health (3 widgets)                          │
│  [Confirmation Rate] [Cancellation Rate] [Waitlist Conversion]  │
├─────────────────────────────────────────────────────────────────┤
│  ROW 4 — Room & Resource Intelligence (2 charts)                │
│  [Most Used Rooms — bar] [Most Requested Resources — bar]       │
├─────────────────────────────────────────────────────────────────┤
│  ROW 5 — Self-Service & Satisfaction (2 widgets)                │
│  [Feedback Avg Rating — gauge] [KB Article Views — trend]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Manual Configuration Steps

### Step 0 - Validate App-Scoped KPI Collector
Run in **Scripts - Background**:

```javascript
new x_783010_tocc_a1.TrainingKpiService().collectDailySnapshot(30);
```

Confirm 16 rows in `x_783010_tocc_a1_kpi_snapshot` for current `snapshot_date`.


### Step 1 — Enable Performance Analytics
Navigate to **Performance Analytics → Activate** if not already enabled on the PDI.

### Step 2 — Create Indicators
Navigate to **Performance Analytics → Indicators → New** for each KPI.
Set source table, formula type (percentage / count / average), and filters per definitions above.

### Step 3 — Schedule Data Collection
Navigate to **Performance Analytics → Data Collector → New**
Set each indicator to collect daily at midnight.

### Step 4 — Build Dashboard
Navigate to **Performance Analytics → Dashboards → New**
- Name: `Training Operations Performance Dashboard`
- Add widgets per layout in section 3
- Set audience visibility to roles: `x_783010_tocc_a1.manager`, `x_783010_tocc_a1.backoffice`, `x_783010_tocc_a1.admin`

### Step 5 — Validate with Real Data
After first data collection run, verify each KPI value is plausible given the test data in the dev instance.

---

*Last updated: Sprint 12 — 16 KPIs defined, dashboard layout, and app-scoped collector integrated.*


---

# TEST_STRATEGY.md - Training Operations Command Center

> Version: 1.3 - Platform Closure
> ATF coverage target: >= 70% of core Script Include behaviors
> Current status: ATF suite is implemented and being stabilized against live schema and BR-driven flows.
> Execution status: Pending validated run in instance after latest ATF alignment.

Operational reading and manual homologation plan:
`docs/manual-config/project-operational-map-and-test-plan.md`

---

## 1. Test Layers

| Layer | Tool | Scope | Who Runs |
|---|---|---|---|
| ATF - Unit | ServiceNow ATF | Script Include methods, BR logic, ACL enforcement | SDK / CI pipeline |
| ATF - Integration | ServiceNow ATF | Reservation -> Session -> Enrollment lifecycle | Developer before PR |
| Manual - Portal | Browser | Service Portal widgets, GlideAjax, confirmation UX | Developer / QA |
| Manual - Flows | Instance | Flow Designer activation, routing, notifications | Developer |
| Manual - VA | VA Designer | Topic routing and response quality | Developer |
| Smoke - Post-deploy | ATF suite | Critical path after `now-sdk install` | Automated |

---

## 2. ATF Suite Structure

Suite: `x_783010_tocc_a1_atf_suite`

- Data and ACL baseline: TEST-001..003
- TrainingConfigService: TEST-004..007
- RoomService: TEST-008..012
- EnrollmentService: TEST-013..020
- TrainingSessionService: TEST-021..023
- Notification and Portal: TEST-024..030
- Knowledge Base: TEST-031
- Attendance: TEST-032..034
- CMDB resources: TEST-035..036
- Dashboard and Workspace: TEST-037..038
- KPI service: TEST-039..041
- Virtual Agent topics: TEST-042..046
- Flow and Subflow presence: TEST-047..049

---

## 3. ATF Patterns

### Pattern: Script Include method test (current service signature)

```javascript
var svc = new x_783010_tocc_a1.RoomService();
var hasConflict = svc.hasConflict(roomId, startDt, endDt, null);
gs.assertFalse(hasConflict, 'Expected no conflict for non-overlapping reservation');
```

### Pattern: BR-driven enrollment validation

```javascript
var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
enrollment.initialize();
enrollment.setValue('tocc_student', studentId);
enrollment.setValue('tocc_training_session', sessionId);
var id = enrollment.insert();
gs.assertNotNull(id, 'Enrollment should be created or blocked by BR with clear error');
```

### Pattern: ACL enforcement

```javascript
gs.impersonateUser(studentUserId);
var gr = new GlideRecord('x_783010_tocc_a1_training_config');
gr.query();
gs.assertTrue(!gr.next(), 'Student should not read training config');
gs.resetSession();
```

---

## 4. Manual Scenarios

- M-01 Reservation to enrollment end-to-end
- M-02 Waitlist and promotion
- M-03 Late cancellation block and backoffice override
- M-04 Unconfirmed seat release scheduled job
- M-05 Role isolation and ACL matrix
- M-06 Backoffice Queue data-quality gate
- M-07 Property override and training_config fallback
- M-08 Flow/subflow field model (`tocc_training_session`)
- M-09 CMDB room resource CI linkage
- M-10 Portal publishability filter for sessions

Expected outcome: no server errors, valid status transitions, event and notification traceability.

---

## 5. Notification Validation

After each flow or scheduled-job test:

1. Check Sent mailbox entries.
2. Validate recipient, subject and template body.
3. Confirm queued event in System Log -> Events.

---

## 6. Coverage Tracking Policy

Coverage table is maintained by observed execution evidence, not by planned test count.

Current note:
- The suite contains 49 definitions.
- Coverage percentage and pass-rate must be updated only after a full run in the target instance.
- Until that run is completed, report status as "implemented and pending validated execution".

---

Last updated: 2026-05-14
Updated for platform closure docs: 2026-05-19


---

# DEPLOYMENT_GUIDE.md — Training Operations Command Center

> **Version:** 2.0 — v1 Release Readiness
> **Target Instance:** `https://dev372264.service-now.com`
> **Release:** Australia Patch 1 (build 2026-03-31)
> **Scope:** `x_783010_tocc_a1`

---

## 1. Pre-Deploy Checklist

Complete every item before running `now-sdk install`.

### SDK & Environment
- [ ] `node --version` → v18 or higher
- [ ] `now-sdk --version` → 4.x confirmed
- [ ] `npm install` completed without errors
- [ ] `now-sdk auth --list` shows alias `dev` pointing to `dev372264.service-now.com`
- [ ] Instance is accessible and admin credentials are valid

### Code Quality
- [ ] `now-sdk build` exits with code 0 — zero errors, zero warnings
- [ ] No hardcoded sys_ids anywhere in `src/fluent/**`
- [ ] All `$id` values present in `generated/keys.ts`
- [ ] `generated/keys.ts` is committed and up to date

### Business Logic
- [ ] `TrainingConfigService` — all 8 seed records present in `data/training-config-seed.now.ts`
- [ ] `KnowledgeBaseBootstrapService` — 10 categories and 13 articles defined
- [ ] All 5 roles defined in `security/roles.now.ts`
- [ ] ACL matrix covers all 11 tables × 5 roles × CRUD operations
- [ ] `PortalApiService` ACL entry present in `security/acls.now.ts`

---

## 2. Deploy Sequence

Execute in this exact order. Each step depends on the previous completing successfully.

```bash
# Step 1 — Validate build
npm run build
# Expected: exit code 0, "Build successful" message

# Step 2 — Deploy to instance
now-sdk install --auth dev
# Expected: all artifacts installed, no conflicts reported

# Step 3 — Verify installation
# Open instance → System Applications → My Company Applications
# Confirm "Training Operations Command Center" version 1.0.0 is listed
```

---

## 3. Post-Deploy Instance Configuration

These steps must be completed manually on the instance after SDK deploy.
They cannot be automated via SDK and are required for full functionality.

### 3.1 — Seed Data Verification
Navigate to each table and confirm seed records were created:

| Table | Expected Records | Check |
|---|---|---|
| `x_783010_tocc_a1_training_config` | 8 config records | [ ] |
| `x_783010_tocc_a1_course` | 22 course records | [ ] |

### 3.2 — Knowledge Base Bootstrap
Run the bootstrap Script Include from a background script:

```javascript
// Navigate to: System Definition → Scripts - Background
// Scope: x_783010_tocc_a1
var svc = new x_783010_tocc_a1.KnowledgeBaseBootstrapService();
var result = svc.bootstrap();
gs.info(JSON.stringify(result, null, 2));
```

Expected output:
```json
{
  "success": true,
  "knowledge_base": { "action": "created" },
  "categories": { "total": 10, "created": 10 },
  "articles": { "total": 13, "created": 13 }
}
```

- [ ] KB created with 10 categories
- [ ] 13 articles published
- [ ] `sys_property` `x_783010_tocc_a1.portal.kb_url` created

### 3.3 — Event Registry
Navigate to **System Policy → Events → Event Registry**
Create one entry for each event in `FLOWS_AND_SUBFLOWS.md → Event Registry`:

- [ ] `x_783010_tocc_a1.reservation.submitted`
- [ ] `x_783010_tocc_a1.reservation.approved`
- [ ] `x_783010_tocc_a1.reservation.rejected`
- [ ] `x_783010_tocc_a1.enrollment.approved`
- [ ] `x_783010_tocc_a1.enrollment.rejected`
- [ ] `x_783010_tocc_a1.enrollment.waitlisted`
- [ ] `x_783010_tocc_a1.enrollment.waitlist_promoted`
- [ ] `x_783010_tocc_a1.enrollment.cancelled`
- [ ] `x_783010_tocc_a1.session.reminder`
- [ ] `x_783010_tocc_a1.session.confirmation_request`
- [ ] `x_783010_tocc_a1.session.cancelled`
- [ ] `x_783010_tocc_a1.session.feedback_request`

### 3.4 — Notification Event Bindings
Navigate to **System Notification → Email → Notifications**
For each of the 12 notification records deployed by SDK:
- [ ] Open each `[TOCC]` notification
- [ ] Confirm **When to send → Event** is bound to the correct event name
- [ ] Confirm **Who will receive** references the correct recipient field

### 3.5 — Approval Group
Navigate to **User Administration → Groups → New**
- [ ] Create group: `[TOCC] Backoffice`
- [ ] Add all users with role `x_783010_tocc_a1.backoffice` as members
- [ ] Note the group `sys_id` for flow configuration

### 3.6 — Activate Flows
Navigate to **Flow Designer → Flows**

| Flow | Action |
|---|---|
| `[TOCC] Reservation Approval` | Activate + verify trigger condition |
| `[TOCC] Enrollment Approval` | Activate + verify trigger condition |
| `[TOCC] Session Cancellation Notification` | Activate + verify trigger condition |
| `[TOCC] Attendance Confirmation Request` | Activate + verify schedule (08:00) |
| `[TOCC] Session Reminder Dispatch` | Activate + verify schedule (07:00) |

- [ ] All 5 flows active
- [ ] No activation errors in Flow Designer

### 3.7 — Activate Scheduled Jobs
Navigate to **System Definition → Scheduled Jobs**

| Job | Schedule | Action |
|---|---|---|
| `[TOCC] Send Session Reminders` | Every hour | Activate |
| `[TOCC] Release Unconfirmed Seats` | Every 30 min | Activate |
| `[TOCC] Close Past Training Sessions` | Daily 02:00 | Activate |
| `[TOCC] Detect Stale Pending Approvals` | Daily 06:00 | Activate |

- [ ] All 4 scheduled jobs active

### 3.8 — CMDB Location Setup
Navigate to **Organization → Locations → New**
- [ ] Create at least one location record for the training building
- [ ] Link location to at least one Room record in `x_783010_tocc_a1_room`

### 3.9 — Service Portal Verification
Navigate to `https://dev372264.service-now.com/tocc`
- [ ] Portal home page loads without errors
- [ ] Quick Links widget renders
- [ ] Session Browser widget renders
- [ ] Navigation to `/tocc?id=tocc_my_enrollments` works
- [ ] Navigation to `/tocc?id=tocc_help` works

### 3.10 — UI Builder Workspace
Navigate to **Now Experience → UI Builder**
- [ ] `TOCC Backoffice Operations Workspace` is listed and active
- [ ] 5 navigation categories visible: Reservations, Training Sessions, Enrollments, Attendance, Assets
- [ ] Lists load with correct filtered data

### 3.11 — Platform Analytics
Navigate to **Performance Analytics → Dashboards**
- [ ] `Training Operations Performance Dashboard` visible
- [ ] 2 tabs present: Executive Summary, Operational Intelligence
- [ ] Widgets render (may show empty data before collection runs)
- [ ] Create data collectors for each indicator

---

## 4. ATF Validation

Run the full ATF suite immediately after deploy:

```bash
# From CLI (if supported on Australia release)
now-sdk atf:run --suite x_783010_tocc_a1_atf_suite

# Or from instance UI:
# Navigate to: Automated Test Framework → Suites
# Open suite: x_783010_tocc_a1_atf_suite
# Click: Run Suite
```

Expected: **36 tests pass, 0 failures**

| Group | Tests | Expected |
|---|---|---|
| Smoke (CRUD + ACL) | TEST-001–003 | ✓ Pass |
| TrainingConfigService | TEST-004–007 | ✓ Pass |
| RoomService | TEST-008–012 | ✓ Pass |
| EnrollmentService | TEST-013–020 | ✓ Pass |
| TrainingSessionService | TEST-021–023 | ✓ Pass |
| NotificationHelper | TEST-024–026 | ✓ Pass |
| PortalApiService | TEST-027–030 | ✓ Pass |
| KnowledgeBaseBootstrapService | TEST-031 | ✓ Pass |
| Attendance BRs | TEST-032–034 | ✓ Pass |
| CmdbResourceService | TEST-035–036 | ✓ Pass |

- [ ] ATF suite completes with 0 failures
- [ ] Review any test output warnings even if tests pass

---

## 5. Manual Smoke Tests (Post-Deploy)

Execute each scenario as described in `TEST_STRATEGY.md`.

| Scenario | Persona | Steps |
|---|---|---|
| M-01: Full reservation → enrollment flow | Instructor + Student + Backoffice | Submit reservation → approve → enroll → confirm → start session → mark attendance |
| M-02: Waitlist and promotion | Student A + Student B | Fill session → B waitlisted → A cancels → B promoted |
| M-03: Late cancellation block | Student | Try cancel within 4h window → blocked → Backoffice override succeeds |
| M-04: Unconfirmed seat release | System | Trigger SCH-002 manually → unconfirmed seat released → waitlist promoted |
| M-05: Security role isolation | All personas | Impersonate each role → verify access matrix from `SECURITY_MODEL.md` |

- [ ] M-01 completed end-to-end without errors
- [ ] M-02 waitlist promotion confirmed
- [ ] M-03 late cancellation blocked correctly
- [ ] M-04 scheduled job seat release confirmed
- [ ] M-05 all 5 personas verified

---

## 6. Rollback Plan

If a critical issue is found after deploy:

### Option A — Revert via Update Set
```
Navigate to: System Update Sets → Retrieved Update Sets
Find the TOCC update set created during install
Click: Preview → Back Out
```

### Option B — Deactivate app
```
Navigate to: System Applications → My Company Applications
Find: Training Operations Command Center
Click: Deactivate
```

### Option C — Revert specific artifact
Identify the artifact from the error, fix in source, rebuild and redeploy:
```bash
now-sdk build
now-sdk install --auth dev
```

---

## 7. Go-Live Final Sign-Off

| Item | Verified By | Date |
|---|---|---|
| `now-sdk build` passes clean | | |
| `now-sdk install` completes | | |
| ATF suite pass (target: >= 70% coverage, current baseline ~51 tests) | | |
| KB bootstrapped (10 categories, 13 articles) | | |
| 12 events registered | | |
| 12 notifications bound | | |
| 5 flows activated | | |
| 5 scheduled jobs activated | | |
| Service Portal accessible | | |
| Workspace accessible | | |
| All 5 manual smoke tests pass | | |
| Security role isolation verified | | |
| Backoffice approval group created | | |

**Go-live approved when all items above are checked.**

---

*Last updated: v1.0 Release readiness — deploy checklist aligned with current ATF and scheduler baseline.*


---

