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
