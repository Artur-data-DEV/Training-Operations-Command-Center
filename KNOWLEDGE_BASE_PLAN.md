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
