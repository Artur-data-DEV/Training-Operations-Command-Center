import { ScheduledScript } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// SCH-001 — Send Session Reminders
// Runs every hour. Finds sessions starting within the configured reminder
// window and dispatches reminder notifications to all approved enrollments.
// Fix: status filter now includes 'full' — enrolled students in full sessions
// also need reminders.
// ---------------------------------------------------------------------------
ScheduledScript({
    $id: Now.ID['x_783010_tocc_a1_sch_send_session_reminders'],
    name: '[TOCC] Send Session Reminders',
    active: true,
    runAs: 'system',
    frequency: 'periodically',
    executionInterval: { hours: 1 },
    executionStart: '2026-01-01 00:00:00',
    script: `(function sendSessionReminders() {
    var config = new TrainingConfigService();
    var reminderLeadHours = config.getReminderLeadHours();

    var now = new GlideDateTime();

    var windowStart = new GlideDateTime(now.getValue());
    windowStart.addSeconds(reminderLeadHours * 3600 - 1800);

    var windowEnd = new GlideDateTime(now.getValue());
    windowEnd.addSeconds(reminderLeadHours * 3600 + 1800);

    var session = new GlideRecord('x_783010_tocc_a1_training_session');
    session.addQuery('status', 'IN', 'open,full');
    session.addQuery('start_datetime', '>=', windowStart.getValue());
    session.addQuery('start_datetime', '<=', windowEnd.getValue());
    session.query();

    var helper = new NotificationHelper();
    var count = 0;

    while (session.next()) {
        helper.sendSessionReminders(session.getUniqueValue());
        count++;
    }

    gs.info('[TOCC] SendSessionReminders: dispatched reminders for ' + count + ' session(s).');
})();`,
})

// ---------------------------------------------------------------------------
// SCH-002 — Release Unconfirmed Seats
// ---------------------------------------------------------------------------
ScheduledScript({
    $id: Now.ID['x_783010_tocc_a1_sch_release_unconfirmed_seats'],
    name: '[TOCC] Release Unconfirmed Seats',
    active: true,
    runAs: 'system',
    frequency: 'periodically',
    executionInterval: { hours: 1 },
    executionStart: '2026-01-01 00:30:00',
    script: `(function releaseUnconfirmedSeats() {
    var now = new GlideDateTime();

    var session = new GlideRecord('x_783010_tocc_a1_training_session');
    session.addQuery('status', 'IN', 'open,full');
    session.addQuery('confirmation_deadline', '!=', '');
    session.addQuery('confirmation_deadline', '<', now.getValue());
    session.query();

    var released = 0;
    var skipped = 0;
    var enrollmentService = new EnrollmentService();

    while (session.next()) {
        var sessionId = session.getUniqueValue();

        var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
        enrollment.addQuery('tocc_training_session', sessionId);
        enrollment.addQuery('status', 'approved');
        enrollment.addQuery('confirmed', false);
        enrollment.query();

        while (enrollment.next()) {
            var result = enrollmentService.releaseUnconfirmedSeat(enrollment.getUniqueValue());
            if (result && result.success) {
                released++;
            } else {
                skipped++;
                gs.warn('[TOCC] ReleaseUnconfirmedSeats skipped ' + enrollment.getValue('number') + ': ' + ((result && result.message) || 'unknown error'));
            }
        }
    }

    gs.info('[TOCC] ReleaseUnconfirmedSeats: released ' + released + ' seat(s), skipped ' + skipped + ' enrollment(s).');
})();`,
})

// ---------------------------------------------------------------------------
// SCH-003 — Close Past Training Sessions
// ---------------------------------------------------------------------------
ScheduledScript({
    $id: Now.ID['x_783010_tocc_a1_sch_close_past_sessions'],
    name: '[TOCC] Close Past Training Sessions',
    active: true,
    runAs: 'system',
    frequency: 'daily',
    executionTime: { hours: 2, minutes: 0, seconds: 0 },
    script: `(function closePastSessions() {
    var now = new GlideDateTime();

    var session = new GlideRecord('x_783010_tocc_a1_training_session');
    session.addQuery('status', 'IN', 'open,full,in_progress');
    session.addQuery('end_datetime', '<', now.getValue());
    session.query();

    var helper = new NotificationHelper();
    var closed = 0;

    while (session.next()) {
        var previousStatus = session.getValue('status');
        session.setValue('status', 'completed');
        session.setValue('work_notes', 'Session automatically closed by scheduled job. Previous status: ' + previousStatus + '.');
        session.setWorkflow(false);
        session.update();
        helper.sendFeedbackRequests(session.getUniqueValue());
        closed++;
    }

    gs.info('[TOCC] ClosePastSessions: closed ' + closed + ' session(s).');
})();`,
})

// ---------------------------------------------------------------------------
// SCH-004 — Detect Stale Pending Approvals
// ---------------------------------------------------------------------------
ScheduledScript({
    $id: Now.ID['x_783010_tocc_a1_sch_detect_stale_approvals'],
    name: '[TOCC] Detect Stale Pending Approvals',
    active: true,
    runAs: 'system',
    frequency: 'daily',
    executionTime: { hours: 6, minutes: 0, seconds: 0 },
    script: `(function detectStaleApprovals() {
    var config = new TrainingConfigService();
    var staleHours = config.getStaleApprovalHours();

    var cutoff = new GlideDateTime();
    cutoff.addSeconds(-1 * staleHours * 3600);

    var staleCount = 0;

    var reservation = new GlideRecord('x_783010_tocc_a1_room_reservation');
    reservation.addQuery('status', 'submitted');
    reservation.addQuery('sys_created_on', '<', cutoff.getValue());
    reservation.query();

    while (reservation.next()) {
        reservation.setValue('work_notes', '[ALERT] Reservation has been awaiting approval for more than ' + staleHours + ' hours. Please review.');
        reservation.setWorkflow(false);
        reservation.update();
        staleCount++;
    }

    var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
    enrollment.addQuery('status', 'pending');
    enrollment.addQuery('sys_created_on', '<', cutoff.getValue());
    enrollment.query();

    while (enrollment.next()) {
        enrollment.setValue('work_notes', '[ALERT] Enrollment has been pending approval for more than ' + staleHours + ' hours. Please review.');
        enrollment.setWorkflow(false);
        enrollment.update();
        staleCount++;
    }

    gs.info('[TOCC] DetectStaleApprovals: flagged ' + staleCount + ' stale record(s).');
})();`,
})

// ---------------------------------------------------------------------------
// SCH-005 — Collect KPI Snapshots
// ---------------------------------------------------------------------------
ScheduledScript({
    $id: Now.ID['x_783010_tocc_a1_sch_collect_kpi_snapshots'],
    name: '[TOCC] Collect KPI Snapshots',
    active: true,
    runAs: 'system',
    frequency: 'daily',
    executionTime: { hours: 1, minutes: 15, seconds: 0 },
    script: `(function collectKpiSnapshots() {
    var svc = new TrainingKpiService();
    var result = svc.collectDailySnapshot(30);

    if (result.success) {
        gs.info('[TOCC] CollectKpiSnapshots: success. inserted=' + result.snapshots_inserted + ', updated=' + result.snapshots_updated);
    } else {
        gs.error('[TOCC] CollectKpiSnapshots failed: ' + result.message);
    }
})();`,
})

// ---------------------------------------------------------------------------
// SCH-006 — Repair Training Sessions Missing Room
// ---------------------------------------------------------------------------
ScheduledScript({
    $id: Now.ID['x_783010_tocc_a1_sch_repair_sessions_missing_room'],
    name: '[TOCC] Repair Sessions Missing Room',
    active: true,
    runAs: 'system',
    frequency: 'daily',
    executionTime: { hours: 1, minutes: 40, seconds: 0 },
    script: `(function repairSessionsMissingRoom() {
    var svc = new TrainingSessionService();
    var result = svc.repairMissingRooms(500);

    gs.info(
        '[TOCC] RepairSessionsMissingRoom: scanned=' + result.scanned +
        ', repaired=' + result.repaired +
        ', skipped_no_reservation=' + result.skipped_no_reservation +
        ', skipped_no_room_in_reservation=' + result.skipped_no_room_in_reservation
    );
})();`,
})
