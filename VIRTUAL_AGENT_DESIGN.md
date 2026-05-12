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
For topics that call `PortalApiService`:
- Add a **Script Action step** in the flow
- Call the appropriate method via server-side script
- Map output to conversation variables

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

*Last updated: Sprint 7 — Full topic specs, NLU notes, manual config steps.*
