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
  var out = api.getOperationsSnapshot();

  gs.info('success=' + out.success);
  gs.info('pending_reservations=' + out.pending_reservations);
  gs.info('todays_sessions=' + out.todays_sessions);
  gs.info('pending_enrollments=' + out.pending_enrollments);
  gs.info('unconfirmed_approved_enrollments=' + out.unconfirmed_approved_enrollments);
  gs.info('in_progress_attendance_pending=' + out.in_progress_attendance_pending);
  gs.info('resources_missing_ci=' + out.resources_missing_ci);

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
    '[TOCC] Detect Stale Pending Approvals'
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
