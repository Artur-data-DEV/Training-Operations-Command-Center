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
