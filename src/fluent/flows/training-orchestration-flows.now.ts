import { action, Flow, Subflow, trigger, wfa } from '@servicenow/sdk/automation'
import { ReferenceColumn } from '@servicenow/sdk/core'

const reservationApprovalRoutingSubflow = Subflow(
    {
        $id: Now.ID['x_783010_tocc_a1_subflow_reservation_intake_signal_v2'],
        name: '[TOCC][SF] Reservation Approval Routing',
        description: 'Routes a submitted room reservation to the TOCC Backoffice group, requests approval, and applies the decision.',
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
        const backofficeGroup = wfa.action(
            action.core.lookUpRecord,
            { $id: Now.ID['x_783010_tocc_a1_subflow_reservation_intake_lookup_group'] },
            {
                table: 'sys_user_group',
                conditions: 'name=[TOCC] Backoffice^ORname=TOCC Backoffice^ORnameLIKEBackoffice',
                sort_type: 'sort_asc',
                if_multiple_records_are_found_action: 'use_first_record',
                dont_fail_flow_on_error: true,
            }
        )

        wfa.flowLogic.if(
            {
                $id: Now.ID['x_783010_tocc_a1_subflow_reservation_intake_group_found'],
                condition: `${wfa.dataPill(backofficeGroup.Record.sys_id, 'string')}ISNOTEMPTY`,
                annotation: 'Backoffice group found',
            },
            () => {
                wfa.action(
                    action.core.updateRecord,
                    { $id: Now.ID['x_783010_tocc_a1_flow_reservation_set_assignment'] },
                    {
                        table_name: 'x_783010_tocc_a1_room_reservation',
                        record: wfa.dataPill(params.inputs.reservationRecord, 'reference'),
                        values: TemplateValue({
                            assignment_group: wfa.dataPill(backofficeGroup.Record, 'string'),
                            work_notes: '[FLOW-01] Assignment group set on reservation submission.',
                        }),
                    }
                )

                const reservationApproval = wfa.action(
                    action.core.askForApproval,
                    { $id: Now.ID['x_783010_tocc_a1_subflow_reservation_intake_create_task_group'] },
                    {
                        record: wfa.dataPill(params.inputs.reservationRecord, 'reference'),
                        table: 'x_783010_tocc_a1_room_reservation',
                        approval_reason: 'Backoffice approval required for room reservation submission.',
                        approval_conditions: wfa.approvalRules({
                            conditionType: 'OR',
                            ruleSets: [
                                {
                                    action: 'ApprovesRejects',
                                    conditionType: 'AND',
                                    rules: [
                                        [
                                            {
                                                ruleType: 'Any',
                                                groups: [wfa.dataPill(backofficeGroup.Record, 'string')],
                                                users: [],
                                                manual: false,
                                            },
                                        ],
                                    ],
                                },
                            ],
                        }),
                        due_date: wfa.approvalDueDate({
                            action: 'none',
                            dateType: 'relative',
                            duration: 2,
                            durationType: 'days',
                            daysSchedule: '',
                        }),
                    }
                )

                wfa.action(
                    action.core.updateRecord,
                    { $id: Now.ID['x_783010_tocc_a1_subflow_reservation_intake_create_task_fallback'] },
                    {
                        table_name: 'x_783010_tocc_a1_room_reservation',
                        record: wfa.dataPill(params.inputs.reservationRecord, 'reference'),
                        values: TemplateValue({
                            status: wfa.dataPill(reservationApproval.approval_state, 'string'),
                            work_notes: `Reservation decision applied by FLOW-01 (${wfa.dataPill(reservationApproval.approval_state, 'string')}).`,
                        }),
                    }
                )
            }
        )

        wfa.flowLogic.else(
            { $id: Now.ID['x_783010_tocc_a1_subflow_reservation_intake_group_missing'] },
            () => {
                wfa.action(
                    action.core.createTask,
                    { $id: Now.ID['x_783010_tocc_a1_subflow_reservation_intake_create_task_group_v2'] },
                    {
                        task_table: 'task',
                        wait: false,
                        field_values: TemplateValue({
                            short_description: 'TOCC reservation pending manual routing',
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

Flow(
    {
        $id: Now.ID['x_783010_tocc_a1_flow_reservation_intake_signal_v2'],
        name: '[TOCC][FLOW] Reservation Approval',
        description: 'On submitted reservation, route to backoffice approval and apply decision.',
        runAs: 'system',
        flowPriority: 'HIGH',
    },
    wfa.trigger(
        trigger.record.created,
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
            reservationApprovalRoutingSubflow,
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
                log_message: '[TOCC] Reservation approval flow executed.',
            }
        )
    }
)

Flow(
    {
        $id: Now.ID['x_783010_tocc_a1_flow_reservation_decision_applied_v1'],
        name: '[TOCC][FLOW] Reservation Decision Applied',
        description: 'Runs when Backoffice/Admin applies an approved or rejected decision to a room reservation.',
        runAs: 'system',
        flowPriority: 'HIGH',
    },
    wfa.trigger(
        trigger.record.updated,
        { $id: Now.ID['x_783010_tocc_a1_flow_reservation_decision_applied_trigger_v1'] },
        {
            table: 'x_783010_tocc_a1_room_reservation',
            condition: 'statusINapproved,rejected',
            run_flow_in: 'background',
            trigger_strategy: 'once',
        }
    ),
    (params) => {
        wfa.action(
            action.core.updateRecord,
            { $id: Now.ID['x_783010_tocc_a1_flow_reservation_decision_applied_note_v1'] },
            {
                table_name: 'x_783010_tocc_a1_room_reservation',
                record: wfa.dataPill(params.trigger.current, 'reference'),
                values: TemplateValue({
                    work_notes: 'Reservation decision observed by FLOW-02.',
                }),
            }
        )

        wfa.action(
            action.core.log,
            { $id: Now.ID['x_783010_tocc_a1_flow_reservation_decision_applied_log_v1'] },
            {
                log_level: 'info',
                log_message: '[TOCC] Reservation decision flow executed.',
            }
        )
    }
)

Flow(
    {
        $id: Now.ID['x_783010_tocc_a1_flow_daily_kpi_refresh_signal_v2'],
        name: '[TOCC][FLOW] Enrollment Approval',
        description:
            'On pending enrollment, route instructor approval. Direct-mode auto-approval is handled by EnrollmentService and TrainingConfigService before this flow runs.',
        runAs: 'system',
        flowPriority: 'HIGH',
    },
    wfa.trigger(
        trigger.record.created,
        { $id: Now.ID['x_783010_tocc_a1_flow_daily_kpi_refresh_signal_trigger_v2'] },
        {
            table: 'x_783010_tocc_a1_student_enrollment',
            condition: 'status=pending',
            run_flow_in: 'background',
            trigger_strategy: 'once',
        }
    ),
    (params) => {
        const sessionRecord = wfa.action(
            action.core.lookUpRecord,
            { $id: Now.ID['x_783010_tocc_a1_flow_session_cancelled_update_work_notes'] },
            {
                table: 'x_783010_tocc_a1_training_session',
                // @ts-ignore Fluent parser requires direct property access expression for data pills.
                conditions: `sys_id=${wfa.dataPill(params.trigger.current.tocc_training_session, 'reference')}`,
                sort_type: 'sort_asc',
                if_multiple_records_are_found_action: 'use_first_record',
                dont_fail_flow_on_error: true,
            }
        )

        wfa.flowLogic.if(
            {
                $id: Now.ID['x_783010_tocc_a1_flow_session_reminder_loop_sessions'],
                condition: `${wfa.dataPill(sessionRecord.status, 'string')}=0`,
                annotation: 'Session found for enrollment',
            },
            () => {
                const instructorApproval = wfa.action(
                    action.core.askForApproval,
                    { $id: Now.ID['x_783010_tocc_a1_flow_session_cancelled_signal_log'] },
                    {
                        record: wfa.dataPill(params.trigger.current, 'reference'),
                        table: 'x_783010_tocc_a1_student_enrollment',
                        approval_reason:
                            'Instructor approval required because the enrollment remained pending after EnrollmentService evaluated configuration.',
                        approval_conditions: wfa.approvalRules({
                            conditionType: 'OR',
                            ruleSets: [
                                {
                                    action: 'ApprovesRejects',
                                    conditionType: 'AND',
                                    rules: [
                                        [
                                            {
                                                ruleType: 'Any',
                                                users: [wfa.dataPill(sessionRecord.Record.tocc_instructor, 'string')],
                                                groups: [],
                                                manual: false,
                                            },
                                        ],
                                    ],
                                },
                            ],
                        }),
                        due_date: wfa.approvalDueDate({
                            action: 'none',
                            dateType: 'relative',
                            duration: 2,
                            durationType: 'days',
                            daysSchedule: '',
                        }),
                    }
                )

                wfa.action(
                    action.core.updateRecord,
                    { $id: Now.ID['x_783010_tocc_a1_flow_session_reminder_lookup_sessions'] },
                    {
                        table_name: 'x_783010_tocc_a1_student_enrollment',
                        record: wfa.dataPill(params.trigger.current, 'reference'),
                        values: TemplateValue({
                            status: wfa.dataPill(instructorApproval.approval_state, 'string'),
                            work_notes: `Enrollment decision applied by FLOW-02 (${wfa.dataPill(instructorApproval.approval_state, 'string')}).`,
                        }),
                    }
                )

                wfa.action(
                    action.core.log,
                    { $id: Now.ID['x_783010_tocc_a1_flow_session_reminder_fire_event'] },
                    {
                        log_level: 'info',
                        log_message: '[TOCC] Enrollment decision applied by FLOW-02.',
                    }
                )
            }
        )

        wfa.flowLogic.else(
            { $id: Now.ID['x_783010_tocc_a1_subflow_session_cancelled_loop_enrollments'] },
            () => {
                wfa.action(
                    action.core.createTask,
                    { $id: Now.ID['x_783010_tocc_a1_flow_session_reminder_lookup_enrollments'] },
                    {
                        task_table: 'task',
                        wait: false,
                        field_values: TemplateValue({
                            short_description: 'TOCC enrollment pending manual routing',
                            description:
                                'Session/instructor was not found for pending enrollment. Manual decision required.',
                            parent: wfa.dataPill(params.trigger.current, 'reference'),
                        }),
                    }
                )
            }
        )

        wfa.action(
            action.core.log,
            { $id: Now.ID['x_783010_tocc_a1_flow_daily_kpi_refresh_signal_log_v2'] },
            {
                log_level: 'info',
                log_message: '[TOCC] Enrollment approval flow executed.',
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
        const approvedEnrollments = wfa.action(
            action.core.lookUpRecords,
            { $id: Now.ID['x_783010_tocc_a1_subflow_session_cancelled_lookup_enrollments_v2'] },
            {
                table: 'x_783010_tocc_a1_student_enrollment',
                conditions: `tocc_training_session=${wfa.dataPill(params.trigger.current, 'reference')}^status=approved`,
                max_results: 10000,
                sort_type: 'sort_asc',
            }
        )

        wfa.flowLogic.forEach(
            wfa.dataPill(approvedEnrollments.Records, 'array.object'),
            { $id: Now.ID['x_783010_tocc_a1_subflow_session_cancelled_loop_enrollments_v2'] },
            () => {
                wfa.action(
                    action.core.log,
                    { $id: Now.ID['x_783010_tocc_a1_subflow_session_cancelled_fire_event_v2'] },
                    {
                        log_level: 'info',
                        log_message: '[TOCC] Session cancellation processed for approved enrollment.',
                    }
                )
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
                        conditions: `tocc_training_session=${wfa.dataPill(session.sys_id, 'string')}^status=approved^confirmed=false`,
                        max_results: 10000,
                        sort_type: 'sort_asc',
                    }
                )

                wfa.flowLogic.forEach(
                    wfa.dataPill(pendingConfirmations.Records, 'array.object'),
                    { $id: Now.ID['x_783010_tocc_a1_flow_attendance_confirmation_loop_enrollments_v2'] },
                    () => {
                        wfa.action(
                            action.core.log,
                            { $id: Now.ID['x_783010_tocc_a1_flow_attendance_confirmation_fire_event_v2'] },
                            {
                                log_level: 'info',
                                log_message: '[TOCC] Attendance confirmation reminder scheduled.',
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
                        conditions: `tocc_training_session=${wfa.dataPill(session.sys_id, 'string')}^status=approved`,
                        max_results: 10000,
                        sort_type: 'sort_asc',
                    }
                )

                wfa.flowLogic.forEach(
                    wfa.dataPill(approvedEnrollments.Records, 'array.object'),
                    { $id: Now.ID['x_783010_tocc_a1_flow_session_reminder_loop_enrollments_v2'] },
                    () => {
                        wfa.action(
                            action.core.log,
                            { $id: Now.ID['x_783010_tocc_a1_flow_session_reminder_fire_event_v2'] },
                            {
                                log_level: 'info',
                                log_message: '[TOCC] Session reminder scheduled.',
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

