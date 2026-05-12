import { Property } from '@servicenow/sdk/core'

const readRoleNames = [
    'x_783010_tocc_a1.admin',
    'x_783010_tocc_a1.backoffice',
    'x_783010_tocc_a1.manager',
    'x_783010_tocc_a1.instructor',
    'x_783010_tocc_a1.student',
]

const writeRoleNames = ['x_783010_tocc_a1.admin']

// ---------------------------------------------------------------------------
// Configuration override properties (primary override path).
// Empty value means "fallback to x_783010_tocc_a1_training_config table".
// ---------------------------------------------------------------------------

Property({
    $id: Now.ID['x_783010_tocc_a1_property_config_minimum_advance_notice_hours'],
    name: 'x_783010_tocc_a1.config.minimum_advance_notice_hours',
    type: 'integer',
    description: 'Override for minimum reservation advance notice in hours. Empty uses training_config table.',
    roles: { read: readRoleNames, write: writeRoleNames },
})

Property({
    $id: Now.ID['x_783010_tocc_a1_property_config_late_cancellation_window_hours'],
    name: 'x_783010_tocc_a1.config.late_cancellation_window_hours',
    type: 'integer',
    description: 'Override for late cancellation lock window in hours. Empty uses training_config table.',
    roles: { read: readRoleNames, write: writeRoleNames },
})

Property({
    $id: Now.ID['x_783010_tocc_a1_property_config_waitlist_mode'],
    name: 'x_783010_tocc_a1.config.waitlist_mode',
    type: 'short_string',
    description: "Override for waitlist mode ('waitlist' or 'block'). Empty uses training_config table.",
    roles: { read: readRoleNames, write: writeRoleNames },
})

Property({
    $id: Now.ID['x_783010_tocc_a1_property_config_enrollment_approval_mode'],
    name: 'x_783010_tocc_a1.config.enrollment_approval_mode',
    type: 'short_string',
    description: "Override for enrollment approval mode ('direct' or 'instructor_approval'). Empty uses training_config table.",
    roles: { read: readRoleNames, write: writeRoleNames },
})

Property({
    $id: Now.ID['x_783010_tocc_a1_property_config_confirmation_lead_hours'],
    name: 'x_783010_tocc_a1.config.confirmation_lead_hours',
    type: 'integer',
    description: 'Override for attendance confirmation lead time in hours. Empty uses training_config table.',
    roles: { read: readRoleNames, write: writeRoleNames },
})

Property({
    $id: Now.ID['x_783010_tocc_a1_property_config_reminder_lead_hours'],
    name: 'x_783010_tocc_a1.config.reminder_lead_hours',
    type: 'integer',
    description: 'Override for reminder lead time in hours. Empty uses training_config table.',
    roles: { read: readRoleNames, write: writeRoleNames },
})

Property({
    $id: Now.ID['x_783010_tocc_a1_property_config_feedback_window_hours'],
    name: 'x_783010_tocc_a1.config.feedback_window_hours',
    type: 'integer',
    description: 'Override for feedback window in hours. Empty uses training_config table.',
    roles: { read: readRoleNames, write: writeRoleNames },
})

Property({
    $id: Now.ID['x_783010_tocc_a1_property_config_stale_approval_hours'],
    name: 'x_783010_tocc_a1.config.stale_approval_hours',
    type: 'integer',
    description: 'Override for stale approval threshold in hours. Empty uses training_config table.',
    roles: { read: readRoleNames, write: writeRoleNames },
})

// ---------------------------------------------------------------------------
// Portal and support properties consumed directly by portal/VA services.
// ---------------------------------------------------------------------------

Property({
    $id: Now.ID['x_783010_tocc_a1_property_portal_support_page'],
    name: 'x_783010_tocc_a1.portal.support_page',
    type: 'string',
    value: '?id=tocc_help',
    description: 'Service Portal support/help page for TOCC.',
    roles: { read: readRoleNames, write: writeRoleNames },
})

Property({
    $id: Now.ID['x_783010_tocc_a1_property_portal_kb_url'],
    name: 'x_783010_tocc_a1.portal.kb_url',
    type: 'string',
    value: '?id=kb_home',
    description: 'Default Service Portal knowledge base URL. Bootstrap can enrich with specific KB sys_id.',
    roles: { read: readRoleNames, write: writeRoleNames },
})

Property({
    $id: Now.ID['x_783010_tocc_a1_property_backoffice_email'],
    name: 'x_783010_tocc_a1.backoffice.email',
    type: 'string',
    value: 'training-backoffice@example.com',
    description: 'Backoffice escalation email surfaced to VA and help center.',
    roles: { read: readRoleNames, write: writeRoleNames },
})

Property({
    $id: Now.ID['x_783010_tocc_a1_property_portal_va_url'],
    name: 'x_783010_tocc_a1.portal.va_url',
    type: 'string',
    value: '/$sn-va-web-client-app.do',
    description: 'Virtual Agent entrypoint URL used by the TOCC Help Center widget.',
    roles: { read: readRoleNames, write: writeRoleNames },
})

Property({
    $id: Now.ID['x_783010_tocc_a1_property_portal_support_catalog_url'],
    name: 'x_783010_tocc_a1.portal.support_catalog_url',
    type: 'string',
    value: '?id=tocc_sessions',
    description: 'Support catalog/page URL shown in Help Center quick actions.',
    roles: { read: readRoleNames, write: writeRoleNames },
})
