import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['x_783010_tocc_a1_script_include_training_config_service'],
    name: 'TrainingConfigService',
    apiName: 'x_783010_tocc_a1.TrainingConfigService',
    accessibleFrom: 'package_private',
    clientCallable: false,
    protectionPolicy: 'read',
    script: `var TrainingConfigService = Class.create();
TrainingConfigService.prototype = {
    initialize: function() {
        this.configTable = 'x_783010_tocc_a1_training_config';
        // Cache prefix unique to this app session — avoids key collision with other scoped apps.
        this._cachePrefix = 'x_783010_tocc_a1.config.';
    },

    // -------------------------------------------------------------------------
    // Public generic accessors
    // -------------------------------------------------------------------------

    getValue: function(name, defaultValue) {
        if (!name) {
            return defaultValue;
        }

        var cacheKey = this._cachePrefix + name;

        // GlideSessionCache persists for the lifetime of the current transaction/session.
        // This eliminates repeated DB hits when multiple BRs or Script Includes
        // call the same config key within a single server-side execution context.
        var cached = GlideSessionCache.get(cacheKey);
        if (cached !== null && cached !== undefined) {
            // Empty string is a valid stored value — only treat null/undefined as cache miss.
            return cached !== '' ? cached : defaultValue;
        }

        var gr = new GlideRecord(this.configTable);
        gr.addQuery('name', name);
        gr.addQuery('active', true);
        gr.setLimit(1);
        gr.query();

        var value = defaultValue;
        if (gr.next()) {
            var raw = gr.getValue('value');
            value = (raw !== null && raw !== undefined && raw !== '') ? raw : defaultValue;
        }

        GlideSessionCache.put(cacheKey, value !== null && value !== undefined ? value : '');
        return value;
    },

    getNumber: function(name, defaultValue) {
        var raw = this.getValue(name, String(defaultValue));
        var parsed = parseInt(raw, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    },

    getBoolean: function(name, defaultValue) {
        var raw = String(this.getValue(name, defaultValue ? 'true' : 'false')).toLowerCase();
        return raw === 'true' || raw === '1' || raw === 'yes';
    },

    getChoice: function(name, acceptedValues, defaultValue) {
        var value = this.getValue(name, defaultValue);
        for (var i = 0; i < acceptedValues.length; i++) {
            if (acceptedValues[i] === value) {
                return value;
            }
        }
        return defaultValue;
    },

    // -------------------------------------------------------------------------
    // Domain-specific accessors
    // Each method documents its config key and default so callers never need to
    // know the raw key name — TrainingConfigService is the single source of truth.
    // -------------------------------------------------------------------------

    // Key: minimum_advance_notice_hours | Default: 24
    // Minimum hours in advance a room reservation must be submitted.
    getMinimumAdvanceNoticeHours: function() {
        return this.getNumber('minimum_advance_notice_hours', 24);
    },

    // Key: late_cancellation_window_hours | Default: 4
    // Hours before session start within which Students/Instructors cannot cancel.
    getLateCancellationWindowHours: function() {
        return this.getNumber('late_cancellation_window_hours', 4);
    },

    // Key: waitlist_mode | Values: waitlist | block | Default: waitlist
    // Controls what happens when a student tries to enroll in a full session.
    getWaitlistMode: function() {
        return this.getChoice('waitlist_mode', ['waitlist', 'block'], 'waitlist');
    },

    // Key: enrollment_approval_mode | Values: direct | instructor_approval | Default: direct
    // Controls whether enrollment is auto-approved or requires instructor action.
    getEnrollmentApprovalMode: function() {
        return this.getChoice('enrollment_approval_mode', ['direct', 'instructor_approval'], 'direct');
    },

    // Key: confirmation_lead_hours | Default: 24
    // Hours before session start when the attendance confirmation deadline is set.
    getConfirmationLeadHours: function() {
        return this.getNumber('confirmation_lead_hours', 24);
    },

    // Key: reminder_lead_hours | Default: 24
    // Hours before session start when the session reminder notification is sent.
    getReminderLeadHours: function() {
        return this.getNumber('reminder_lead_hours', 24);
    },

    // Key: feedback_window_hours | Default: 48
    // Hours after session completion during which feedback can be submitted.
    getFeedbackWindowHours: function() {
        return this.getNumber('feedback_window_hours', 48);
    },

    // Key: stale_approval_hours | Default: 48
    // Hours after which a pending reservation or enrollment approval is flagged as stale.
    getStaleApprovalHours: function() {
        return this.getNumber('stale_approval_hours', 48);
    },

    type: 'TrainingConfigService'
};`,
})
