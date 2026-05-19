# Platform Validation Scripts (Background Script Pack)

Use these scripts in `System Definition -> Scripts - Background`.
Scope: `x_783010_tocc_a1`

## 1) KPI snapshot integrity (US-35)

```javascript
(function() {
  var table = 'x_783010_tocc_a1_kpi_snapshot';
  var ga = new GlideAggregate(table);
  ga.addAggregate('COUNT');
  ga.groupBy('snapshot_date');
  ga.query();

  gs.info('=== KPI rows per snapshot_date ===');
  while (ga.next()) {
    gs.info(ga.getValue('snapshot_date') + ' -> ' + ga.getAggregate('COUNT'));
  }

  var dup = new GlideAggregate(table);
  dup.addAggregate('COUNT');
  dup.groupBy('snapshot_date');
  dup.groupBy('kpi_key');
  dup.addHaving('COUNT', '>', 1);
  dup.query();

  var dupCount = 0;
  while (dup.next()) {
    dupCount++;
    gs.info('DUPLICATE KPI: ' + dup.getValue('snapshot_date') + ' / ' + dup.getValue('kpi_key') + ' -> ' + dup.getAggregate('COUNT'));
  }

  gs.info('Duplicate KPI groups: ' + dupCount);
})();
```

Expected:
- Latest day with 16 KPI rows
- Duplicate KPI groups: 0

## 2) Force one KPI collection run (US-35)

```javascript
(function() {
  var svc = new x_783010_tocc_a1.TrainingKpiService();
  var result = svc.collectDailySnapshot(30);
  gs.info(JSON.stringify(result, null, 2));
})();
```

## 3) CMDB link audit for room resources (US-36)

```javascript
(function() {
  var invalid = 0;
  var retired = 0;
  var total = 0;

  var rr = new GlideRecord('x_783010_tocc_a1_room_resource');
  rr.addNotNullQuery('ci_reference');
  rr.query();

  while (rr.next()) {
    total++;

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

  gs.info('TOCC CMDB audit -> total=' + total + ', invalid=' + invalid + ', retired=' + retired);
})();
```

Expected:
- invalid=0
- retired=0 (for linked CIs)

## 4) Workspace snapshot contract smoke (US-37)

```javascript
(function() {
  var api = new x_783010_tocc_a1.PortalApiService();
  var out = JSON.parse(api.getOperationsSnapshot());

  gs.info('success=' + out.success);
  gs.info('pending_reservations=' + out.snapshot.pending_reservations);
  gs.info('todays_sessions=' + out.snapshot.todays_sessions);
  gs.info('pending_enrollments=' + out.snapshot.pending_enrollments);
  gs.info('unconfirmed_approved_enrollments=' + out.snapshot.unconfirmed_approved_enrollments);
  gs.info('in_progress_attendance_pending=' + out.snapshot.in_progress_attendance_pending);
  gs.info('resources_missing_ci=' + out.snapshot.resources_missing_ci);

  if (out.kpi_highlights && out.kpi_highlights.metrics) {
    gs.info('kpi_highlights.metrics=' + JSON.stringify(out.kpi_highlights.metrics));
  }
})();
```

Expected:
- `success=true`
- Operational keys populated (0+ values)

## 5) Virtual Agent backend smoke (non-user-specific methods)

```javascript
(function() {
  var va = new x_783010_tocc_a1.VirtualAgentTopicService();

  var policies = va.getTrainingPolicies();
  gs.info('getTrainingPolicies -> ' + JSON.stringify(policies));

  var escalation = va.getBackofficeEscalation();
  gs.info('getBackofficeEscalation -> ' + JSON.stringify(escalation));
})();
```

For user-specific methods (`getMyEnrollments`, `confirmAttendance`, `cancelEnrollment`), validate by impersonating a Student through VA Web channel.

## 6) Scheduled jobs health check

```javascript
(function() {
  var names = [
    '[TOCC] Collect KPI Snapshots',
    '[TOCC] Send Session Reminders',
    '[TOCC] Release Unconfirmed Seats',
    '[TOCC] Close Past Training Sessions',
    '[TOCC] Detect Stale Pending Approvals',
    '[TOCC] Repair Sessions Missing Room'
  ];

  for (var i = 0; i < names.length; i++) {
    var job = new GlideRecord('sysauto_script');
    job.addQuery('name', names[i]);
    job.query();

    if (job.next()) {
      gs.info(names[i] + ' -> active=' + job.getValue('active') + ', next_action=' + job.getValue('next_action'));
    } else {
      gs.info(names[i] + ' -> NOT FOUND');
    }
  }
})();
```

## 7) ACL persona smoke (post P0-01)

```javascript
(function() {
  // Replace these usernames with real smoke users (one role each).
  var personaUsers = [
    { persona: 'student', username: 'tocc.student' },
    { persona: 'instructor', username: 'tocc.instructor' },
    { persona: 'manager', username: 'tocc.manager' }
  ];

  var checks = [
    { persona: 'student', table: 'x_783010_tocc_a1_training_config', op: 'read', expected: false },
    { persona: 'manager', table: 'x_783010_tocc_a1_training_config', op: 'read', expected: true },
    { persona: 'student', table: 'x_783010_tocc_a1_student_enrollment', op: 'create', expected: true },
    { persona: 'instructor', table: 'x_783010_tocc_a1_room_reservation', op: 'create', expected: true },
    { persona: 'manager', table: 'x_783010_tocc_a1_room_reservation', op: 'write', expected: false }
  ];

  function findUsername(persona) {
    for (var i = 0; i < personaUsers.length; i++) {
      if (personaUsers[i].persona === persona) {
        return personaUsers[i].username;
      }
    }
    return '';
  }

  function findUserSysIdByUsername(username) {
    var u = new GlideRecord('sys_user');
    u.addQuery('user_name', username);
    u.setLimit(1);
    u.query();
    if (u.next()) {
      return u.getUniqueValue();
    }
    return '';
  }

  var session = gs.getSession();
  var originalUser = gs.getUserName();

  for (var i = 0; i < checks.length; i++) {
    var c = checks[i];
    var username = findUsername(c.persona);
    if (!username) {
      gs.info('[ACL-SMOKE] missing user mapping for persona=' + c.persona);
      continue;
    }

    var userSysId = findUserSysIdByUsername(username);
    if (!userSysId) {
      gs.info('[ACL-SMOKE] user not found username=' + username);
      continue;
    }

    session.impersonate(userSysId);
    var allowed = GlideSecurityManager.get().canTableOperation(c.table, c.op);
    gs.info(
      '[ACL-SMOKE] persona=' + c.persona +
      ' user=' + username +
      ' table=' + c.table +
      ' op=' + c.op +
      ' allowed=' + allowed +
      ' expected=' + c.expected
    );
  }

  session.impersonate(originalUser);
})();
```

Expected (policy baseline):
- Student read `training_config` = false
- Manager read `training_config` = true
- Student create `student_enrollment` = true
- Instructor create `room_reservation` = true
- Manager write `room_reservation` = false

## 8) TrainingConfigService property override and table fallback smoke

```javascript
(function() {
  var propertyName = 'x_783010_tocc_a1.config.minimum_advance_notice_hours';
  var original = gs.getProperty(propertyName, '');

  gs.setProperty(propertyName, '72');
  var overrideCfg = new x_783010_tocc_a1.TrainingConfigService();
  gs.info('[CONFIG-SMOKE] override minimum_advance_notice_hours=' + overrideCfg.getMinimumAdvanceNoticeHours() + ' expected=72');

  gs.setProperty(propertyName, '');
  var fallbackCfg = new x_783010_tocc_a1.TrainingConfigService();
  gs.info('[CONFIG-SMOKE] fallback minimum_advance_notice_hours=' + fallbackCfg.getMinimumAdvanceNoticeHours() + ' expected=training_config value or default');

  gs.setProperty(propertyName, original || '');
})();
```

Expected:
- Override read returns `72`.
- Empty property falls back to `x_783010_tocc_a1_training_config`.
- Original property value is restored at the end.

## 9) Flow and subflow active smoke

```javascript
(function() {
  var names = [
    '[TOCC][FLOW] Reservation Approval',
    '[TOCC][FLOW] Enrollment Approval',
    '[TOCC][FLOW] Session Cancelled',
    '[TOCC][FLOW] Attendance Confirmation Cadence',
    '[TOCC][FLOW] Session Reminder Cadence',
    '[TOCC][SF] Reservation Approval Routing'
  ];

  for (var i = 0; i < names.length; i++) {
    var flow = new GlideRecord('sys_hub_flow');
    flow.addQuery('name', names[i]);
    flow.setLimit(1);
    flow.query();
    if (flow.next()) {
      gs.info('[FLOW-SMOKE] ' + names[i] + ' -> active=' + flow.getValue('active') + ', sys_id=' + flow.getUniqueValue());
    } else {
      gs.info('[FLOW-SMOKE] ' + names[i] + ' -> NOT FOUND');
    }
  }
})();
```

Expected:
- All listed flows/subflows are found.
- Only reusable subflows are listed. Log-only subflows were intentionally removed.
- Active state matches the release decision. Reminder/confirmation cadence flows are scaffold/log-only; real notification dispatch is scheduled-job based.

## 10) Enrollment/session field model smoke for flow queries

```javascript
(function() {
  var invalid = 0;
  var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
  enrollment.addNotNullQuery('tocc_training_session');
  enrollment.query();

  while (enrollment.next()) {
    var session = new GlideRecord('x_783010_tocc_a1_training_session');
    if (!session.get(enrollment.getValue('tocc_training_session'))) {
      invalid++;
      gs.info('[FIELD-SMOKE] Invalid tocc_training_session on enrollment ' + enrollment.getValue('number'));
    }
  }

  gs.info('[FIELD-SMOKE] invalid tocc_training_session references=' + invalid);
})();
```

Expected:
- `invalid tocc_training_session references=0`.

## 11) Release unconfirmed seats service smoke

Run this in a sandbox/test record only. Replace `<ENROLLMENT_SYS_ID>` with an approved, unconfirmed enrollment whose linked session has passed `confirmation_deadline`.

```javascript
(function() {
  var enrollmentId = '<ENROLLMENT_SYS_ID>';
  var result = new x_783010_tocc_a1.EnrollmentService().releaseUnconfirmedSeat(enrollmentId);
  gs.info('[RELEASE-SMOKE] ' + JSON.stringify(result));
})();
```

Expected:
- `success=true`
- Enrollment status becomes `cancelled`.
- Linked session seats are recalculated by `EnrollmentService.syncSessionAfterEnrollmentChange()`.
