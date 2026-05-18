import { Form, Formatter } from '@servicenow/sdk/core'

export const roomReservationDefaultForm = Form({
    table: 'x_783010_tocc_a1_room_reservation',
    view: Now.ref('sys_ui_view', { name: 'Default view' }),
    roles: ['x_783010_tocc_a1.admin', 'x_783010_tocc_a1.backoffice', 'admin'],
    sections: [
        {
            caption: 'Reservation Details',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { type: 'table_field', field: 'number' },
                        { type: 'table_field', field: 'status' },
                        { type: 'table_field', field: 'assigned_to' },
                        { type: 'table_field', field: 'assignment_group' },
                        { type: 'table_field', field: 'course' },
                        { type: 'table_field', field: 'room' },
                        { type: 'table_field', field: 'instructor' },
                        { type: 'table_field', field: 'start_datetime' },
                        { type: 'table_field', field: 'end_datetime' },
                        { type: 'table_field', field: 'expected_participants' },
                        { type: 'table_field', field: 'training_session' },
                    ],
                },
            ],
        },
        {
            caption: 'Notes',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { type: 'table_field', field: 'short_description' },
                        { type: 'table_field', field: 'description' },
                        { type: 'table_field', field: 'work_notes' },
                        { type: 'formatter', formatterRef: Formatter.Activities_Filtered },
                    ],
                },
            ],
        },
    ],
})
