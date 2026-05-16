import { Record } from '@servicenow/sdk/core'

export const seed_training_config_001 = Record({
    $id: 'seed_training_config_001',
    table: 'x_783010_tocc_a1_training_config',
    data: {
        name: 'minimum_advance_notice_hours',
        value: '48',
        active: true,
        description: 'Minimum lead time required to submit a room reservation.',
    },
})

export const seed_training_config_002 = Record({
    $id: 'seed_training_config_002',
    table: 'x_783010_tocc_a1_training_config',
    data: {
        name: 'late_cancellation_window_hours',
        value: '4',
        active: true,
        description: 'Cancellation lock window before training start.',
    },
})

export const seed_training_config_003 = Record({
    $id: 'seed_training_config_003',
    table: 'x_783010_tocc_a1_training_config',
    data: {
        name: 'waitlist_mode',
        value: 'waitlist',
        active: true,
        description: 'Behavior when session has no seats: waitlist or block.',
    },
})

export const seed_training_config_004 = Record({
    $id: 'seed_training_config_004',
    table: 'x_783010_tocc_a1_training_config',
    data: {
        name: 'enrollment_approval_mode',
        value: 'direct',
        active: true,
        description: 'Enrollment mode: direct auto-approval or instructor approval.',
    },
})

export const seed_training_config_005 = Record({
    $id: 'seed_training_config_005',
    table: 'x_783010_tocc_a1_training_config',
    data: {
        name: 'confirmation_lead_hours',
        value: '24',
        active: true,
        description: 'Lead time before session start to request attendance confirmation.',
    },
})

export const seed_training_config_006 = Record({
    $id: 'seed_training_config_006',
    table: 'x_783010_tocc_a1_training_config',
    data: {
        name: 'reminder_lead_hours',
        value: '24',
        active: true,
        description: 'Hours before session start when the reminder notification is dispatched.',
    },
})

export const seed_training_config_007 = Record({
    $id: 'seed_training_config_007',
    table: 'x_783010_tocc_a1_training_config',
    data: {
        name: 'feedback_window_hours',
        value: '48',
        active: true,
        description: 'Hours after session completion during which students can submit feedback.',
    },
})

export const seed_training_config_008 = Record({
    $id: 'seed_training_config_008',
    table: 'x_783010_tocc_a1_training_config',
    data: {
        name: 'stale_approval_hours',
        value: '48',
        active: true,
        description: 'Hours after which a pending reservation or enrollment approval is flagged as stale.',
    },
})

export const seed_training_config_009 = Record({
    $id: 'seed_training_config_009',
    table: 'x_783010_tocc_a1_training_config',
    data: {
        name: 'minimum_reservation_duration_minutes',
        value: '60',
        active: true,
        description: 'Minimum duration required between reservation start and end date/time.',
    },
})
export const seed_room_001 = Record({
    $id: 'seed_room_001',
    table: 'x_783010_tocc_a1_room',
    data: {
        room_name: 'Conference Room A',
        room_code: 'CONF-A',
        capacity: 20,
        status: 'active',
        description: 'Modern conference room with AV equipment.',
    },
})
export const seed_room_002 = Record({
    $id: 'seed_room_002',
    table: 'x_783010_tocc_a1_room',
    data: {
        room_name: 'Laboratory 101',
        room_code: 'LAB-101',
        capacity: 15,
        status: 'active',
        description: 'Technical training lab with workstations.',
    },
})