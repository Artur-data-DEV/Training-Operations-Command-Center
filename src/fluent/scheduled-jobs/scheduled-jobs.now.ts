import { ScheduledScript } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// SCH-001 — Send Session Reminders
// Runs every hour. Finds sessions starting within the configured reminder
// window and dispatches reminder notifications to all approved enrollments.
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
    windowStart.addSeconds(reminderLeadHours * 3600 - 1800); // window open: lead time minus 30 min

    var windowEnd = new GlideDateTime(now.getValue());
    windowEnd.addSeconds(reminderLeadHours * 3600 + 1800); // window close: lead time plus 30 min

    var session = new GlideRecord('x_783010_tocc_a1_training_session');
    session.addQuery('status', 'open');
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
// Runs hourly. Finds approved enrollments past the confirmation deadline
// where the student has not confirmed. Cancels them and frees the seat.
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

    // Find sessions whose confirmation deadline has passed and are still open/full.
    var session = new GlideRecord('x_783010_tocc_a1_training_session');
    session.addQuery('status', 'IN', 'open,full');
    session.addQuery('confirmation_deadline', '!=', '');
    session.addQuery('confirmation_deadline', '<', now.getValue());
    session.query();

    var released = 0;

    while (session.next()) {
        var sessionId = session.getUniqueValue();

        // Find approved, unconfirmed enrollments for this session.
        var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
        enrollment.addQuery('training_session', sessionId);
        enrollment.addQuery('status', 'approved');
        enrollment.addQuery('confirmed', false);
        enrollment.query();

        while (enrollment.next()) {
            enrollment.setValue('status', 'cancelled');
            enrollment.setValue(
                'work_notes',
                'Seat automatically released: student did not confirm attendance before the deadline.'
            );
            enrollment.setWorkflow(true); // allow BR to fire → seat sync + waitlist promotion
            enrollment.update();
            released++;
        }
    }

    gs.info('[TOCC] ReleaseUnconfirmedSeats: released ' + released + ' seat(s).');
})();`,
})

// ---------------------------------------------------------------------------
// SCH-003 — Close Past Training Sessions
// Runs daily. Finds sessions whose end time has passed and are still in an
// active status, then transitions them to Completed.
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
        session.setValue(
            'work_notes',
            'Session automatically closed by scheduled job. Previous status: ' + previousStatus + '.'
        );
        session.setWorkflow(false);
        session.update();

        // Trigger feedback request to all approved enrolled students.
        helper.sendFeedbackRequests(session.getUniqueValue());

        closed++;
    }

    gs.info('[TOCC] ClosePastSessions: closed ' + closed + ' session(s).');
})();`,
})

// ---------------------------------------------------------------------------
// SCH-004 — Detect Stale Pending Approvals
// Runs daily. Finds reservations and enrollments in pending/submitted status
// for longer than the configured stale window and adds a work note alert.
// Does NOT auto-cancel — alerts the Backoffice team for manual action.
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

    // Check stale reservations in 'submitted' status.
    var reservation = new GlideRecord('x_783010_tocc_a1_room_reservation');
    reservation.addQuery('status', 'submitted');
    reservation.addQuery('sys_created_on', '<', cutoff.getValue());
    reservation.query();

    while (reservation.next()) {
        reservation.setValue(
            'work_notes',
            '[ALERT] Reservation has been awaiting approval for more than ' + staleHours + ' hours. Please review.'
        );
        reservation.setWorkflow(false);
        reservation.update();
        staleCount++;
    }

    // Check stale enrollments in 'pending' status.
    var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
    enrollment.addQuery('status', 'pending');
    enrollment.addQuery('sys_created_on', '<', cutoff.getValue());
    enrollment.query();

    while (enrollment.next()) {
        enrollment.setValue(
            'work_notes',
            '[ALERT] Enrollment has been pending approval for more than ' + staleHours + ' hours. Please review.'
        );
        enrollment.setWorkflow(false);
        enrollment.update();
        staleCount++;
    }

    gs.info('[TOCC] DetectStaleApprovals: flagged ' + staleCount + ' stale record(s).');
})();`,
})

// ---------------------------------------------------------------------------
// SCH-005 â€” Collect KPI Snapshots
// Runs daily. Calculates and upserts all dashboard KPIs into
// x_783010_tocc_a1_kpi_snapshot for analytics traceability.
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
        gs.info(
            '[TOCC] CollectKpiSnapshots: success. inserted=' +
            result.snapshots_inserted +
            ', updated=' +
            result.snapshots_updated
        );
    } else {
        gs.error('[TOCC] CollectKpiSnapshots failed: ' + result.message);
    }
})();`,
})
