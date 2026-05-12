import { action, Flow, Subflow, trigger, wfa } from '@servicenow/sdk/automation'
import { ReferenceColumn } from '@servicenow/sdk/core'

const reservationSignalSubflow = Subflow(
    {
        $id: Now.ID['x_783010_tocc_a1_subflow_reservation_intake_signal'],
        name: '[TOCC][SF] Emit Reservation Intake Signal',
        description: 'Reusable signal dispatcher for reservation-intake orchestration.',
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
            { $id: Now.ID['x_783010_tocc_a1_subflow_reservation_intake_fire_event'] },
            {
                event_name: 'x_783010_tocc_a1.flow.reservation_intake_signal',
                table: 'x_783010_tocc_a1_room_reservation',
                record: wfa.dataPill(params.inputs.reservationRecord, 'reference'),
                parm1: 'reservation_intake',
                parm2: 'flow_scaffold',
            }
        )
    }
)

const sessionCancelledSignalSubflow = Subflow(
    {
        $id: Now.ID['x_783010_tocc_a1_subflow_session_cancelled_signal'],
        name: '[TOCC][SF] Emit Session Cancelled Signal',
        description: 'Reusable signal dispatcher for cancelled-session orchestration.',
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
        wfa.action(
            action.core.fireEvent,
            { $id: Now.ID['x_783010_tocc_a1_subflow_session_cancelled_fire_event'] },
            {
                event_name: 'x_783010_tocc_a1.flow.session_cancelled_signal',
                table: 'x_783010_tocc_a1_training_session',
                record: wfa.dataPill(params.inputs.sessionRecord, 'reference'),
                parm1: 'session_cancelled',
                parm2: 'flow_scaffold',
            }
        )
    }
)

Flow(
    {
        $id: Now.ID['x_783010_tocc_a1_flow_reservation_intake_signal'],
        name: '[TOCC][FLOW] Reservation Intake Signal',
        description: 'Record-triggered orchestration signal for submitted room reservations.',
        runAs: 'system',
        flowPriority: 'HIGH',
    },
    wfa.trigger(
        trigger.record.createdOrUpdated,
        { $id: Now.ID['x_783010_tocc_a1_flow_reservation_intake_signal_trigger'] },
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
            { $id: Now.ID['x_783010_tocc_a1_flow_reservation_intake_signal_subflow_call'] },
            {
                reservationRecord: wfa.dataPill(params.trigger.current, 'reference'),
                waitForCompletion: true,
            }
        )

        wfa.action(
            action.core.log,
            { $id: Now.ID['x_783010_tocc_a1_flow_reservation_intake_signal_log'] },
            {
                log_level: 'info',
                log_message: '[TOCC] Reservation Intake Signal dispatched from Flow scaffold.',
            }
        )
    }
)

Flow(
    {
        $id: Now.ID['x_783010_tocc_a1_flow_session_cancelled_signal'],
        name: '[TOCC][FLOW] Session Cancelled Signal',
        description: 'Record-triggered orchestration signal when training sessions are cancelled.',
        runAs: 'system',
        flowPriority: 'MEDIUM',
    },
    wfa.trigger(
        trigger.record.updated,
        { $id: Now.ID['x_783010_tocc_a1_flow_session_cancelled_signal_trigger'] },
        {
            table: 'x_783010_tocc_a1_training_session',
            condition: 'status=cancelled',
            run_flow_in: 'background',
            trigger_strategy: 'unique_changes',
        }
    ),
    (params) => {
        wfa.subflow(
            sessionCancelledSignalSubflow,
            { $id: Now.ID['x_783010_tocc_a1_flow_session_cancelled_signal_subflow_call'] },
            {
                sessionRecord: wfa.dataPill(params.trigger.current, 'reference'),
                waitForCompletion: true,
            }
        )

        wfa.action(
            action.core.log,
            { $id: Now.ID['x_783010_tocc_a1_flow_session_cancelled_signal_log'] },
            {
                log_level: 'info',
                log_message: '[TOCC] Session Cancelled Signal dispatched from Flow scaffold.',
            }
        )
    }
)

Flow(
    {
        $id: Now.ID['x_783010_tocc_a1_flow_daily_kpi_refresh_signal'],
        name: '[TOCC][FLOW] Daily KPI Refresh Signal',
        description: 'Scheduled orchestration signal for KPI refresh cadence and observability.',
        runAs: 'system',
        flowPriority: 'LOW',
    },
    wfa.trigger(
        trigger.scheduled.daily,
        { $id: Now.ID['x_783010_tocc_a1_flow_daily_kpi_refresh_signal_trigger'] },
        {
            time: '01:10:00',
        }
    ),
    () => {
        wfa.action(
            action.core.log,
            { $id: Now.ID['x_783010_tocc_a1_flow_daily_kpi_refresh_signal_log'] },
            {
                log_level: 'info',
                log_message: '[TOCC] Daily KPI refresh signal flow executed.',
            }
        )
    }
)
