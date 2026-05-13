import { action, Flow, Subflow, trigger, wfa } from '@servicenow/sdk/automation'
import { BooleanColumn, ReferenceColumn, StringColumn } from '@servicenow/sdk/core'

// ===========================================================================
// TOCC Flow Designer — Approval & Orchestration Flows
//
// These flows handle the real business orchestration:
//   - FLOW-01: Reservation Approval (Ask for Approval → create session or notify rejection)
//   - FLOW-02: Enrollment Approval (direct or instructor-gated, based on config)
//   - FLOW-03: Session Cancellation Notification (mass notify enrolled students)
//   - FLOW-04: Attendance Confirmation Request (request confirmation from enrolled students)
//   - FLOW-05: Session Reminder Dispatch (24h before, scheduled)
//
// Subflows (reusable units called from multiple flows):
//   - SF-01: Process Reservation Decision
//   - SF-02: Process Enrollment Decision
//   - SF-03: Notify Session Participants
//   - SF-04: Promote Waitlisted Student
//
// Design rule: ALL business logic stays in Script Includes.
// Flows own: approval routing, condition branching, notification dispatch,
//            work note logging, and calling Script Include action steps.
// ===========================================================================

// ---------------------------------------------------------------------------
// SF-01 — Process Reservation Decision
// Called after approval step resolves. Executes the business action
// (create session on approve, work-note on reject) and dispatches notification.
// ---------------------------------------------------------------------------
const sfProcessReservationDecision = Subflow(
    {
        $id: Now.ID['x_783010_tocc_a1_sf_process_reservation_decision'],
        name: '[TOCC][SF] Process Reservation Decision',
        description: 'Executes post-approval logic for a room reservation: syncs session and notifies instructor.',
        runAs: 'system',
        inputs: {
            reservationId: StringColumn({ label: 'Reservation Sys ID', mandatory: true }),
            decision:      StringColumn({ label: 'Decision (approved|rejected)', mandatory: true }),
            decidedBy:     StringColumn({ label: 'Decided By User Sys ID', mandatory: false }),
            rejectionNote: StringColumn({ label: 'Rejection Note', mandatory: false }),
        },
    },
    (params) => {
        // Step 1 — Sync session or log rejection via Script Include
        wfa.action(
            action.core.executeScript,
            { $id: Now.ID['x_783010_tocc_a1_sf_res_decision_execute_logic'] },
            {
                script: `
                    var reservationId = fd_data.subflow_inputs.reservationId;
                    var decision      = fd_data.subflow_inputs.decision;
                    var rejectionNote = fd_data.subflow_inputs.rejectionNote || '';
                    var decidedBy     = fd_data.subflow_inputs.decidedBy || gs.getUserID();

                    var gr = new GlideRecord('x_783010_tocc_a1_room_reservation');
                    if (!gr.get(reservationId)) {
                        gs.warn('[TOCC][SF] ProcessReservationDecision: reservation not found ' + reservationId);
                        return;
                    }

                    gr.setValue('status', decision);
                    var workNote = decision === 'approved'
                        ? 'Reservation approved via Flow by ' + gs.getDisplayName(decidedBy) + '.'
                        : 'Reservation rejected via Flow by ' + gs.getDisplayName(decidedBy) + '.' + (rejectionNote ? ' Reason: ' + rejectionNote : '');
                    gr.setValue('work_notes', workNote);
                    gr.setWorkflow(true); // allow BR_SyncTrainingSession to fire on approved
                    gr.update();

                    // Dispatch notification event
                    var helper = new x_783010_tocc_a1.NotificationHelper();
                    helper.sendReservationDecision(reservationId);
                `,
            }
        )
    }
)

// ---------------------------------------------------------------------------
// SF-02 — Process Enrollment Decision
// Called after approval step resolves. Updates status, syncs seats,
// handles waitlist promotion if rejected, and notifies student.
// ---------------------------------------------------------------------------
const sfProcessEnrollmentDecision = Subflow(
    {
        $id: Now.ID['x_783010_tocc_a1_sf_process_enrollment_decision'],
        name: '[TOCC][SF] Process Enrollment Decision',
        description: 'Applies approval/rejection to an enrollment, syncs seats, and notifies student.',
        runAs: 'system',
        inputs: {
            enrollmentId: StringColumn({ label: 'Enrollment Sys ID', mandatory: true }),
            decision:     StringColumn({ label: 'Decision (approved|rejected)', mandatory: true }),
            decidedBy:    StringColumn({ label: 'Decided By User Sys ID', mandatory: false }),
        },
    },
    (params) => {
        wfa.action(
            action.core.executeScript,
            { $id: Now.ID['x_783010_tocc_a1_sf_enroll_decision_execute_logic'] },
            {
                script: `
                    var enrollmentId = fd_data.subflow_inputs.enrollmentId;
                    var decision     = fd_data.subflow_inputs.decision;
                    var decidedBy    = fd_data.subflow_inputs.decidedBy || gs.getUserID();

                    var svc = new x_783010_tocc_a1.EnrollmentService();

                    if (decision === 'approved') {
                        svc.approve(enrollmentId);
                    } else {
                        svc.reject(enrollmentId, 'Rejected via Flow approval by ' + gs.getDisplayName(decidedBy));
                    }

                    var helper = new x_783010_tocc_a1.NotificationHelper();
                    helper.sendEnrollmentDecision(enrollmentId);
                `,
            }
        )
    }
)

// ---------------------------------------------------------------------------
// SF-03 — Notify Session Participants
// Dispatches a given notification type to all approved enrollments of a session.
// Reused by FLOW-03 (cancellation) and FLOW-04 (confirmation request).
// ---------------------------------------------------------------------------
const sfNotifySessionParticipants = Subflow(
    {
        $id: Now.ID['x_783010_tocc_a1_sf_notify_session_participants'],
        name: '[TOCC][SF] Notify Session Participants',
        description: 'Dispatches a notification to all approved enrolled students for a given session.',
        runAs: 'system',
        inputs: {
            sessionId:        StringColumn({ label: 'Session Sys ID', mandatory: true }),
            notificationType: StringColumn({ label: 'Notification Type (cancelled|reminder|confirmation_request|feedback_request)', mandatory: true }),
        },
    },
    (params) => {
        wfa.action(
            action.core.executeScript,
            { $id: Now.ID['x_783010_tocc_a1_sf_notify_participants_script'] },
            {
                script: `
                    var sessionId        = fd_data.subflow_inputs.sessionId;
                    var notificationType = fd_data.subflow_inputs.notificationType;
                    var helper           = new x_783010_tocc_a1.NotificationHelper();

                    if (notificationType === 'cancelled') {
                        helper.sendSessionCancelled(sessionId);
                    } else if (notificationType === 'reminder') {
                        helper.sendSessionReminders(sessionId);
                    } else if (notificationType === 'confirmation_request') {
                        helper.sendConfirmationRequests(sessionId);
                    } else if (notificationType === 'feedback_request') {
                        helper.sendFeedbackRequests(sessionId);
                    } else {
                        gs.warn('[TOCC][SF] NotifySessionParticipants: unknown notification type: ' + notificationType);
                    }
                `,
            }
        )
    }
)

// ---------------------------------------------------------------------------
// SF-04 — Promote Waitlisted Student
// Promotes the next waitlisted enrollment for a session when a seat opens.
// Called from enrollment cancellation path in FLOW-02.
// ---------------------------------------------------------------------------
const sfPromoteWaitlistedStudent = Subflow(
    {
        $id: Now.ID['x_783010_tocc_a1_sf_promote_waitlisted_student'],
        name: '[TOCC][SF] Promote Waitlisted Student',
        description: 'Promotes the next waitlisted student to approved when a seat becomes available.',
        runAs: 'system',
        inputs: {
            sessionId: StringColumn({ label: 'Session Sys ID', mandatory: true }),
        },
    },
    (params) => {
        wfa.action(
            action.core.executeScript,
            { $id: Now.ID['x_783010_tocc_a1_sf_promote_waitlist_script'] },
            {
                script: `
                    var sessionId = fd_data.subflow_inputs.sessionId;
                    var svc       = new x_783010_tocc_a1.EnrollmentService();
                    svc._promoteWaitlistedEnrollments(sessionId, 1);
                `,
            }
        )
    }
)

// ===========================================================================
// FLOW-01 — Reservation Approval Flow
//
// Trigger: Room Reservation status changes to 'submitted'
// Path:
//   1. Ask for Approval → Backoffice group
//   2. If Approved → SF-01 (approved) → session created by BR on status change
//   3. If Rejected → SF-01 (rejected) → instructor notified
// ===========================================================================
Flow(
    {
        $id: Now.ID['x_783010_tocc_a1_flow_reservation_approval'],
        name: '[TOCC] Reservation Approval',
        description: 'Routes room reservation requests to Backoffice for approval. On approval, the session is created automatically via BR. On rejection, the instructor is notified.',
        runAs: 'system',
        flowPriority: 'HIGH',
    },
    wfa.trigger(
        trigger.record.createdOrUpdated,
        { $id: Now.ID['x_783010_tocc_a1_flow_reservation_approval_trigger'] },
        {
            table:            'x_783010_tocc_a1_room_reservation',
            condition:        'status=submitted',
            run_flow_in:      'background',
            trigger_strategy: 'once',
        }
    ),
    (params) => {
        // Step 1 — Log flow start
        wfa.action(
            action.core.log,
            { $id: Now.ID['x_783010_tocc_a1_flow_res_approval_log_start'] },
            {
                log_level:   'info',
                log_message: '[TOCC][FLOW] Reservation Approval started for: ' +
                    wfa.dataPill(params.trigger.current, 'reference.number'),
            }
        )

        // Step 2 — Ask for Approval (Backoffice group)
        // Group reference: configure [TOCC] Backoffice group sys_id on the instance
        // after deploy. Use the approval group field on the reservation if present.
        const approvalStep = wfa.action(
            action.core.askForApproval,
            { $id: Now.ID['x_783010_tocc_a1_flow_res_approval_ask'] },
            {
                record:           wfa.dataPill(params.trigger.current, 'reference'),
                approval_field:   'state',
                approver_source:  'group',
                approval_group:   wfa.dataPill(params.trigger.current, 'reference.approval_group'),
                wait_for:         'any_approver',
                instructions:     'Please review and approve or reject this room reservation request.',
            }
        )

        // Step 3a — Approved path
        wfa.if(
            { $id: Now.ID['x_783010_tocc_a1_flow_res_approval_if_approved'] },
            wfa.condition(
                wfa.dataPill(approvalStep, 'approval_state'),
                'is',
                'approved'
            ),
            () => {
                wfa.subflow(
                    sfProcessReservationDecision,
                    { $id: Now.ID['x_783010_tocc_a1_flow_res_approval_call_approved'] },
                    {
                        reservationId: wfa.dataPill(params.trigger.current, 'reference.sys_id'),
                        decision:      'approved',
                        decidedBy:     wfa.dataPill(approvalStep, 'approver'),
                        rejectionNote: '',
                        waitForCompletion: true,
                    }
                )
            },
            // Step 3b — Rejected / cancelled path (else)
            () => {
                wfa.subflow(
                    sfProcessReservationDecision,
                    { $id: Now.ID['x_783010_tocc_a1_flow_res_approval_call_rejected'] },
                    {
                        reservationId: wfa.dataPill(params.trigger.current, 'reference.sys_id'),
                        decision:      'rejected',
                        decidedBy:     wfa.dataPill(approvalStep, 'approver'),
                        rejectionNote: wfa.dataPill(approvalStep, 'comments'),
                        waitForCompletion: true,
                    }
                )
            }
        )

        // Step 4 — Log flow end
        wfa.action(
            action.core.log,
            { $id: Now.ID['x_783010_tocc_a1_flow_res_approval_log_end'] },
            {
                log_level:   'info',
                log_message: '[TOCC][FLOW] Reservation Approval completed.',
            }
        )
    }
)

// ===========================================================================
// FLOW-02 — Enrollment Approval Flow
//
// Trigger: Student Enrollment created with status = 'pending'
// Path:
//   1. Check config: enrollment_approval_mode
//   2a. mode = direct       → SF-02 (approved) immediately
//   2b. mode = instructor   → Ask for Approval → Instructor of the session
//                           → Approved/Rejected → SF-02
// ===========================================================================
Flow(
    {
        $id: Now.ID['x_783010_tocc_a1_flow_enrollment_approval'],
        name: '[TOCC] Enrollment Approval',
        description: 'Routes enrollment requests through direct approval or instructor-gated approval based on TrainingConfigService.getEnrollmentApprovalMode().',
        runAs: 'system',
        flowPriority: 'HIGH',
    },
    wfa.trigger(
        trigger.record.created,
        { $id: Now.ID['x_783010_tocc_a1_flow_enrollment_approval_trigger'] },
        {
            table:       'x_783010_tocc_a1_student_enrollment',
            condition:   'status=pending',
            run_flow_in: 'background',
        }
    ),
    (params) => {
        wfa.action(
            action.core.log,
            { $id: Now.ID['x_783010_tocc_a1_flow_enroll_approval_log_start'] },
            {
                log_level:   'info',
                log_message: '[TOCC][FLOW] Enrollment Approval started for: ' +
                    wfa.dataPill(params.trigger.current, 'reference.number'),
            }
        )

        // Step 1 — Read approval mode from config
        const modeStep = wfa.action(
            action.core.executeScript,
            { $id: Now.ID['x_783010_tocc_a1_flow_enroll_approval_read_mode'] },
            {
                script: `
                    var svc = new x_783010_tocc_a1.TrainingConfigService();
                    fd_data.approval_mode = svc.getEnrollmentApprovalMode();
                `,
                outputs: {
                    approval_mode: StringColumn({ label: 'Approval Mode' }),
                },
            }
        )

        // Step 2 — Branch on approval mode
        wfa.if(
            { $id: Now.ID['x_783010_tocc_a1_flow_enroll_approval_if_direct'] },
            wfa.condition(
                wfa.dataPill(modeStep, 'approval_mode'),
                'is',
                'direct'
            ),
            // Direct mode — auto-approve immediately
            () => {
                wfa.subflow(
                    sfProcessEnrollmentDecision,
                    { $id: Now.ID['x_783010_tocc_a1_flow_enroll_approval_direct_call'] },
                    {
                        enrollmentId:      wfa.dataPill(params.trigger.current, 'reference.sys_id'),
                        decision:          'approved',
                        decidedBy:         '',
                        waitForCompletion: true,
                    }
                )
            },
            // Instructor-gated mode
            () => {
                // Step 3 — Ask instructor for approval
                const instructorApproval = wfa.action(
                    action.core.askForApproval,
                    { $id: Now.ID['x_783010_tocc_a1_flow_enroll_approval_ask_instructor'] },
                    {
                        record:          wfa.dataPill(params.trigger.current, 'reference'),
                        approval_field:  'state',
                        approver_source: 'user',
                        approver:        wfa.dataPill(
                            params.trigger.current,
                            'reference.training_session.instructor'
                        ),
                        wait_for:        'any_approver',
                        instructions:    'A student has requested enrollment in your training session. Please approve or reject.',
                    }
                )

                // Step 4a — Instructor approved
                wfa.if(
                    { $id: Now.ID['x_783010_tocc_a1_flow_enroll_approval_if_instr_approved'] },
                    wfa.condition(
                        wfa.dataPill(instructorApproval, 'approval_state'),
                        'is',
                        'approved'
                    ),
                    () => {
                        wfa.subflow(
                            sfProcessEnrollmentDecision,
                            { $id: Now.ID['x_783010_tocc_a1_flow_enroll_approval_instr_approved'] },
                            {
                                enrollmentId:      wfa.dataPill(params.trigger.current, 'reference.sys_id'),
                                decision:          'approved',
                                decidedBy:         wfa.dataPill(instructorApproval, 'approver'),
                                waitForCompletion: true,
                            }
                        )
                    },
                    // Step 4b — Instructor rejected
                    () => {
                        wfa.subflow(
                            sfProcessEnrollmentDecision,
                            { $id: Now.ID['x_783010_tocc_a1_flow_enroll_approval_instr_rejected'] },
                            {
                                enrollmentId:      wfa.dataPill(params.trigger.current, 'reference.sys_id'),
                                decision:          'rejected',
                                decidedBy:         wfa.dataPill(instructorApproval, 'approver'),
                                waitForCompletion: true,
                            }
                        )
                    }
                )
            }
        )

        wfa.action(
            action.core.log,
            { $id: Now.ID['x_783010_tocc_a1_flow_enroll_approval_log_end'] },
            {
                log_level:   'info',
                log_message: '[TOCC][FLOW] Enrollment Approval completed.',
            }
        )
    }
)

// ===========================================================================
// FLOW-03 — Session Cancellation Notification Flow
//
// Trigger: Training Session status changes to 'cancelled'
// Path:
//   1. Notify all enrolled students via SF-03
//   2. Log on session record
// ===========================================================================
Flow(
    {
        $id: Now.ID['x_783010_tocc_a1_flow_session_cancellation_notification'],
        name: '[TOCC] Session Cancellation Notification',
        description: 'When a training session is cancelled, notifies all approved enrolled students and logs the event.',
        runAs: 'system',
        flowPriority: 'HIGH',
    },
    wfa.trigger(
        trigger.record.updated,
        { $id: Now.ID['x_783010_tocc_a1_flow_session_cancellation_trigger'] },
        {
            table:            'x_783010_tocc_a1_training_session',
            condition:        'status=cancelled^statusCHANGES',
            run_flow_in:      'background',
            trigger_strategy: 'unique_changes',
        }
    ),
    (params) => {
        // Step 1 — Notify enrolled students
        wfa.subflow(
            sfNotifySessionParticipants,
            { $id: Now.ID['x_783010_tocc_a1_flow_session_cancel_notify_call'] },
            {
                sessionId:         wfa.dataPill(params.trigger.current, 'reference.sys_id'),
                notificationType:  'cancelled',
                waitForCompletion: true,
            }
        )

        // Step 2 — Add work note to session
        wfa.action(
            action.core.updateRecord,
            { $id: Now.ID['x_783010_tocc_a1_flow_session_cancel_work_note'] },
            {
                record:  wfa.dataPill(params.trigger.current, 'reference'),
                fields: {
                    work_notes: 'Session cancellation notification dispatched to all enrolled students via Flow.',
                },
            }
        )

        wfa.action(
            action.core.log,
            { $id: Now.ID['x_783010_tocc_a1_flow_session_cancel_log'] },
            {
                log_level:   'info',
                log_message: '[TOCC][FLOW] Session Cancellation Notification completed for: ' +
                    wfa.dataPill(params.trigger.current, 'reference.number'),
            }
        )
    }
)

// ===========================================================================
// FLOW-04 — Attendance Confirmation Request Flow
//
// Trigger: Scheduled daily at 08:00
// Path:
//   1. Find sessions whose confirmation window opens today (lead time from config)
//   2. For each session → SF-03 (confirmation_request)
// ===========================================================================
Flow(
    {
        $id: Now.ID['x_783010_tocc_a1_flow_attendance_confirmation_request'],
        name: '[TOCC] Attendance Confirmation Request',
        description: 'Daily scheduled flow that sends attendance confirmation requests to enrolled students whose session confirmation deadline falls within the configured lead window.',
        runAs: 'system',
        flowPriority: 'MEDIUM',
    },
    wfa.trigger(
        trigger.scheduled.daily,
        { $id: Now.ID['x_783010_tocc_a1_flow_confirmation_trigger'] },
        { time: '08:00:00' }
    ),
    () => {
        // Single script step — finds matching sessions and dispatches
        // Using executeScript because Flow Designer does not natively support
        // "for each record" with dynamic GlideRecord inside a scheduled flow.
        wfa.action(
            action.core.executeScript,
            { $id: Now.ID['x_783010_tocc_a1_flow_confirmation_dispatch_script'] },
            {
                script: `
                    var config = new x_783010_tocc_a1.TrainingConfigService();
                    var leadHours = config.getConfirmationLeadHours();

                    var now = new GlideDateTime();

                    // Window: sessions whose confirmation_deadline is between
                    // now and now + leadHours (i.e. deadline is approaching)
                    var windowEnd = new GlideDateTime(now.getValue());
                    windowEnd.addSeconds(leadHours * 3600);

                    var session = new GlideRecord('x_783010_tocc_a1_training_session');
                    session.addQuery('status', 'IN', 'open,full');
                    session.addQuery('confirmation_deadline', '>=', now.getValue());
                    session.addQuery('confirmation_deadline', '<=', windowEnd.getValue());
                    session.query();

                    var helper = new x_783010_tocc_a1.NotificationHelper();
                    var count  = 0;

                    while (session.next()) {
                        helper.sendConfirmationRequests(session.getUniqueValue());
                        count++;
                    }

                    gs.info('[TOCC][FLOW] AttendanceConfirmationRequest: dispatched for ' + count + ' session(s).');
                `,
            }
        )

        wfa.action(
            action.core.log,
            { $id: Now.ID['x_783010_tocc_a1_flow_confirmation_log'] },
            {
                log_level:   'info',
                log_message: '[TOCC][FLOW] Attendance Confirmation Request flow completed.',
            }
        )
    }
)

// ===========================================================================
// FLOW-05 — Session Reminder Dispatch Flow
//
// Trigger: Scheduled daily at 07:00
// Complements SCH-001 (hourly) with a morning batch for same-day sessions.
// ===========================================================================
Flow(
    {
        $id: Now.ID['x_783010_tocc_a1_flow_session_reminder_dispatch'],
        name: '[TOCC] Session Reminder Dispatch',
        description: 'Morning scheduled flow that sends 24h reminders to enrolled students for sessions starting within the configured reminder window.',
        runAs: 'system',
        flowPriority: 'MEDIUM',
    },
    wfa.trigger(
        trigger.scheduled.daily,
        { $id: Now.ID['x_783010_tocc_a1_flow_reminder_trigger'] },
        { time: '07:00:00' }
    ),
    () => {
        wfa.action(
            action.core.executeScript,
            { $id: Now.ID['x_783010_tocc_a1_flow_reminder_dispatch_script'] },
            {
                script: `
                    var config      = new x_783010_tocc_a1.TrainingConfigService();
                    var leadHours   = config.getReminderLeadHours();

                    var now         = new GlideDateTime();
                    var windowStart = new GlideDateTime(now.getValue());
                    windowStart.addSeconds(leadHours * 3600 - 1800);
                    var windowEnd   = new GlideDateTime(now.getValue());
                    windowEnd.addSeconds(leadHours * 3600 + 1800);

                    var session = new GlideRecord('x_783010_tocc_a1_training_session');
                    session.addQuery('status', 'IN', 'open,full');
                    session.addQuery('start_datetime', '>=', windowStart.getValue());
                    session.addQuery('start_datetime', '<=', windowEnd.getValue());
                    session.query();

                    var helper = new x_783010_tocc_a1.NotificationHelper();
                    var count  = 0;

                    while (session.next()) {
                        helper.sendSessionReminders(session.getUniqueValue());
                        count++;
                    }

                    gs.info('[TOCC][FLOW] SessionReminderDispatch: dispatched for ' + count + ' session(s).');
                `,
            }
        )

        wfa.action(
            action.core.log,
            { $id: Now.ID['x_783010_tocc_a1_flow_reminder_log'] },
            {
                log_level:   'info',
                log_message: '[TOCC][FLOW] Session Reminder Dispatch completed.',
            }
        )
    }
)
