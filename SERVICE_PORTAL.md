# SERVICE_PORTAL.md — Training Operations Command Center

> **Sprint:** 5
> **Strategy:** SDK-assisted — `PortalApiService` Script Include is SDK-first.
> Portal structure (pages, widgets, theme) is configured on the instance via Service Portal Designer.
> This document is the authoritative runbook for portal configuration.

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

## Manual Configuration Steps

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
