import { action, Flow, Subflow, trigger, wfa } from '@servicenow/sdk/automation'
import { ReferenceColumn } from '@servicenow/sdk/core'

const reservationSignalSubflow = Subflow(
    {
        $id: Now.ID['x_783010_tocc_a1_subflow_reservation_intake_signal_v2'],
        name: '[TOCC][SF] Reservation Intake Processing',
        description: 'Queues reservation submitted notification and creates a backoffice follow-up task.',
        runAs: 'system',
        inputs: {
            reservationRecord: ReferenceColumn({
                label: 'Reservation Record',
                referenceTable: 'x_783010_tocc_a1_room_reservation',
                mandatory: true,
            }),
        },
    },
    (params) => {
        wfa.action(
            action.core.fireEvent,
            { $id: Now.ID['x_783010_tocc_a1_subflow_reservation_intake_fire_event_v2'] },
            {
                event_name: 'x_783010_tocc_a1.reservation.submitted',
                table: 'x_783010_tocc_a1_room_reservation',
                record: wfa.dataPill(params.inputs.reservationRecord, 'reference'),
                parm1: 'reservation_submitted',
                parm2: 'flow',
            }
        )

        const backofficeGroup = wfa.action(
            action.core.lookUpRecord,
            { $id: Now.ID['x_783010_tocc_a1_subflow_reservation_intake_lookup_group_v2'] },
            {
                table: 'sys_user_group',
                conditions: 'name=[TOCC] Backoffice',
                sort_type: 'sort_asc',
                if_multiple_records_are_found_action: 'use_first_record',
                dont_fail_flow_on_error: true,
            }
        )

        wfa.flowLogic.if(
            {
                $id: Now.ID['x_783010_tocc_a1_subflow_reservation_intake_group_found_v2'],
                condition: `${wfa.dataPill(backofficeGroup.status, 'string')}=0`,
                annotation: 'Backoffice group found',
            },
            () => {
                wfa.action(
                    action.core.createTask,
                    { $id: Now.ID['x_783010_tocc_a1_subflow_reservation_intake_create_task_group_v2'] },
                    {
                        task_table: 'task',
                        wait: false,
                        field_values: TemplateValue({
                            short_description: 'TOCC reservation pending approval',
                            description: 'Review reservation and decide using reservation UI actions.',
                            parent: wfa.dataPill(params.inputs.reservationRecord, 'reference'),
                            assignment_group: wfa.dataPill(backofficeGroup.Record, 'reference'),
                        }),
                    }
                )
            }
        )

        wfa.flowLogic.else(
            { $id: Now.ID['x_783010_tocc_a1_subflow_reservation_intake_group_missing_v2'] },
            () => {
                wfa.action(
                    action.core.createTask,
                    { $id: Now.ID['x_783010_tocc_a1_subflow_reservation_intake_create_task_fallback_v2'] },
                    {
                        task_table: 'task',
                        wait: false,
                        field_values: TemplateValue({
                            short_description: 'TOCC reservation pending approval',
                            description:
                                'Backoffice group [TOCC] Backoffice was not found. Route this reservation manually.',
                            parent: wfa.dataPill(params.inputs.reservationRecord, 'reference'),
                        }),
                    }
                )
            }
        )
    }
)

const sessionCancelledSignalSubflow = Subflow(
    {
        $id: Now.ID['x_783010_tocc_a1_subflow_session_cancelled_signal_v2'],
        name: '[TOCC][SF] Session Cancelled Processing',
        description: 'Dispatches cancellation notifications for approved enrollments in a cancelled session.',
        runAs: 'system',
        inputs: {
            sessionRecord: ReferenceColumn({
                label: 'Training Session Record',
                referenceTable: 'x_783010_tocc_a1_training_session',
                mandatory: true,
            }),
        },
    },
    (params) => {
        const approvedEnrollments = wfa.action(
            action.core.lookUpRecords,
            { $id: Now.ID['x_783010_tocc_a1_subflow_session_cancelled_lookup_enrollments_v2'] },
            {
                table: 'x_783010_tocc_a1_student_enrollment',
                conditions: `training_session=${wfa.dataPill(params.inputs.sessionRecord, 'reference')}^status=approved`,
                max_results: 10000,
                sort_type: 'sort_asc',
            }
        )

        wfa.flowLogic.forEach(
            wfa.dataPill(approvedEnrollments.Records, 'array.object'),
            { $id: Now.ID['x_783010_tocc_a1_subflow_session_cancelled_loop_enrollments_v2'] },
            (enrollment) => {
                wfa.action(
                    action.core.fireEvent,
                    { $id: Now.ID['x_783010_tocc_a1_subflow_session_cancelled_fire_event_v2'] },
                    {
                        event_name: 'x_783010_tocc_a1.session.cancelled',
                        table: 'x_783010_tocc_a1_student_enrollment',
                        record: wfa.dataPill(enrollment.sys_id, 'reference'),
                        parm1: wfa.dataPill(params.inputs.sessionRecord, 'reference'),
                        parm2: 'flow',
                    }
                )
            }
        )
    }
)

Flow(
    {
        $id: Now.ID['x_783010_tocc_a1_flow_reservation_intake_signal_v2'],
        name: '[TOCC][FLOW] Reservation Intake',
        description: 'On submitted reservation, queue notifications and create backoffice approval task.',
        runAs: 'system',
        flowPriority: 'HIGH',
    },
    wfa.trigger(
        trigger.record.createdOrUpdated,
        { $id: Now.ID['x_783010_tocc_a1_flow_reservation_intake_signal_trigger_v2'] },
        {
            table: 'x_783010_tocc_a1_room_reservation',
            condition: 'status=submitted',
            run_flow_in: 'background',
            trigger_strategy: 'once',
        }
    ),
    (params) => {
        wfa.subflow(
            reservationSignalSubflow,
            { $id: Now.ID['x_783010_tocc_a1_flow_reservation_intake_signal_subflow_call_v2'] },
            {
                reservationRecord: wfa.dataPill(params.trigger.current, 'reference'),
                waitForCompletion: true,
            }
        )

        wfa.action(
            action.core.log,
            { $id: Now.ID['x_783010_tocc_a1_flow_reservation_intake_signal_log_v2'] },
            {
                log_level: 'info',
                log_message: '[TOCC] Reservation intake flow executed.',
            }
        )
    }
)

Flow(
    {
        $id: Now.ID['x_783010_tocc_a1_flow_session_cancelled_signal_v2'],
        name: '[TOCC][FLOW] Session Cancelled',
        description: 'On session cancellation, dispatch cancellation notifications to approved enrollments.',
        runAs: 'system',
        flowPriority: 'MEDIUM',
    },
    wfa.trigger(
        trigger.record.updated,
        { $id: Now.ID['x_783010_tocc_a1_flow_session_cancelled_signal_trigger_v2'] },
        {
            table: 'x_783010_tocc_a1_training_session',
            condition: 'status=cancelled^statusCHANGES',
            run_flow_in: 'background',
            trigger_strategy: 'unique_changes',
        }
    ),
    (params) => {
        wfa.subflow(
            sessionCancelledSignalSubflow,
            { $id: Now.ID['x_783010_tocc_a1_flow_session_cancelled_signal_subflow_call_v2'] },
            {
                sessionRecord: wfa.dataPill(params.trigger.current, 'reference'),
                waitForCompletion: true,
            }
        )

        wfa.action(
            action.core.updateRecord,
            { $id: Now.ID['x_783010_tocc_a1_flow_session_cancelled_update_work_notes_v2'] },
            {
                table_name: 'x_783010_tocc_a1_training_session',
                record: wfa.dataPill(params.trigger.current, 'reference'),
                values: TemplateValue({
                    work_notes: 'Session cancellation notifications dispatched via Flow.',
                }),
            }
        )

        wfa.action(
            action.core.log,
            { $id: Now.ID['x_783010_tocc_a1_flow_session_cancelled_signal_log_v2'] },
            {
                log_level: 'info',
                log_message: '[TOCC] Session cancelled flow executed.',
            }
        )
    }
)

Flow(
    {
        $id: Now.ID['x_783010_tocc_a1_flow_daily_kpi_refresh_signal_v2'],
        name: '[TOCC][FLOW] Daily KPI Refresh Observation',
        description: 'Collects daily operational count context for KPI refresh observability.',
        runAs: 'system',
        flowPriority: 'LOW',
    },
    wfa.trigger(
        trigger.scheduled.daily,
        { $id: Now.ID['x_783010_tocc_a1_flow_daily_kpi_refresh_signal_trigger_v2'] },
        {
            time: '01:10:00',
        }
    ),
    () => {
        const dailySnapshots = wfa.action(
            action.core.lookUpRecords,
            { $id: Now.ID['x_783010_tocc_a1_flow_daily_kpi_refresh_lookup_snapshots_v2'] },
            {
                table: 'x_783010_tocc_a1_kpi_snapshot',
                conditions:
                    'snapshot_dateONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()',
                max_results: 10000,
                sort_type: 'sort_asc',
            }
        )

        wfa.action(
            action.core.log,
            { $id: Now.ID['x_783010_tocc_a1_flow_daily_kpi_refresh_signal_log_v2'] },
            {
                log_level: 'info',
                log_message: `Daily KPI flow observed ${wfa.dataPill(dailySnapshots.Count, 'integer')} snapshot row(s) for today.`,
            }
        )
    }
)

Flow(
    {
        $id: Now.ID['x_783010_tocc_a1_flow_attendance_confirmation_cadence_signal_v2'],
        name: '[TOCC][FLOW] Attendance Confirmation Cadence',
        description: 'Daily cadence to request attendance confirmation for sessions with confirmation deadline today.',
        runAs: 'system',
        flowPriority: 'LOW',
    },
    wfa.trigger(
        trigger.scheduled.daily,
        { $id: Now.ID['x_783010_tocc_a1_flow_attendance_confirmation_cadence_signal_trigger_v2'] },
        {
            time: '08:00:00',
        }
    ),
    () => {
        const sessions = wfa.action(
            action.core.lookUpRecords,
            { $id: Now.ID['x_783010_tocc_a1_flow_attendance_confirmation_lookup_sessions_v2'] },
            {
                table: 'x_783010_tocc_a1_training_session',
                conditions:
                    'statusINopen,full^confirmation_deadlineONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()',
                max_results: 10000,
                sort_type: 'sort_asc',
            }
        )

        wfa.flowLogic.forEach(
            wfa.dataPill(sessions.Records, 'array.object'),
            { $id: Now.ID['x_783010_tocc_a1_flow_attendance_confirmation_loop_sessions_v2'] },
            (session) => {
                const pendingConfirmations = wfa.action(
                    action.core.lookUpRecords,
                    { $id: Now.ID['x_783010_tocc_a1_flow_attendance_confirmation_lookup_enrollments_v2'] },
                    {
                        table: 'x_783010_tocc_a1_student_enrollment',
                        conditions: `training_session=${wfa.dataPill(session.sys_id, 'string')}^status=approved^confirmed=false`,
                        max_results: 10000,
                        sort_type: 'sort_asc',
                    }
                )

                wfa.flowLogic.forEach(
                    wfa.dataPill(pendingConfirmations.Records, 'array.object'),
                    { $id: Now.ID['x_783010_tocc_a1_flow_attendance_confirmation_loop_enrollments_v2'] },
                    (enrollment) => {
                        wfa.action(
                            action.core.fireEvent,
                            { $id: Now.ID['x_783010_tocc_a1_flow_attendance_confirmation_fire_event_v2'] },
                            {
                                event_name: 'x_783010_tocc_a1.session.confirmation_request',
                                table: 'x_783010_tocc_a1_student_enrollment',
                                record: wfa.dataPill(enrollment.sys_id, 'reference'),
                                parm1: wfa.dataPill(session.number, 'string'),
                                parm2: 'flow',
                            }
                        )
                    }
                )
            }
        )

        wfa.action(
            action.core.log,
            { $id: Now.ID['x_783010_tocc_a1_flow_attendance_confirmation_cadence_signal_log_v2'] },
            {
                log_level: 'info',
                log_message: '[TOCC] Attendance confirmation cadence flow executed.',
            }
        )
    }
)

Flow(
    {
        $id: Now.ID['x_783010_tocc_a1_flow_session_reminder_cadence_signal_v2'],
        name: '[TOCC][FLOW] Session Reminder Cadence',
        description: 'Daily morning cadence to send session reminders for sessions starting tomorrow.',
        runAs: 'system',
        flowPriority: 'LOW',
    },
    wfa.trigger(
        trigger.scheduled.daily,
        { $id: Now.ID['x_783010_tocc_a1_flow_session_reminder_cadence_signal_trigger_v2'] },
        {
            time: '07:00:00',
        }
    ),
    () => {
        const sessions = wfa.action(
            action.core.lookUpRecords,
            { $id: Now.ID['x_783010_tocc_a1_flow_session_reminder_lookup_sessions_v2'] },
            {
                table: 'x_783010_tocc_a1_training_session',
                conditions:
                    'statusINopen,full^start_datetimeONTomorrow@javascript:gs.beginningOfTomorrow()@javascript:gs.endOfTomorrow()',
                max_results: 10000,
                sort_type: 'sort_asc',
            }
        )

        wfa.flowLogic.forEach(
            wfa.dataPill(sessions.Records, 'array.object'),
            { $id: Now.ID['x_783010_tocc_a1_flow_session_reminder_loop_sessions_v2'] },
            (session) => {
                const approvedEnrollments = wfa.action(
                    action.core.lookUpRecords,
                    { $id: Now.ID['x_783010_tocc_a1_flow_session_reminder_lookup_enrollments_v2'] },
                    {
                        table: 'x_783010_tocc_a1_student_enrollment',
                        conditions: `training_session=${wfa.dataPill(session.sys_id, 'string')}^status=approved`,
                        max_results: 10000,
                        sort_type: 'sort_asc',
                    }
                )

                wfa.flowLogic.forEach(
                    wfa.dataPill(approvedEnrollments.Records, 'array.object'),
                    { $id: Now.ID['x_783010_tocc_a1_flow_session_reminder_loop_enrollments_v2'] },
                    (enrollment) => {
                        wfa.action(
                            action.core.fireEvent,
                            { $id: Now.ID['x_783010_tocc_a1_flow_session_reminder_fire_event_v2'] },
                            {
                                event_name: 'x_783010_tocc_a1.session.reminder',
                                table: 'x_783010_tocc_a1_student_enrollment',
                                record: wfa.dataPill(enrollment.sys_id, 'reference'),
                                parm1: wfa.dataPill(session.number, 'string'),
                                parm2: 'flow',
                            }
                        )
                    }
                )
            }
        )

        wfa.action(
            action.core.log,
            { $id: Now.ID['x_783010_tocc_a1_flow_session_reminder_cadence_signal_log_v2'] },
            {
                log_level: 'info',
                log_message: '[TOCC] Session reminder cadence flow executed.',
            }
        )
    }
)

