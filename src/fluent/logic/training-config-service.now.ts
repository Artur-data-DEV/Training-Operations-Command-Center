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
        this.propertyPrefix = 'x_783010_tocc_a1.config.';
        // Session-local cache key prefix for fast repeated reads in the same execution context.
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

        var hasSessionCache = typeof GlideSessionCache !== 'undefined' && GlideSessionCache;
        if (hasSessionCache) {
            var cached = GlideSessionCache.get(cacheKey);
            if (cached !== null && cached !== undefined) {
                return cached !== '' ? cached : defaultValue;
            }
        }

        // 1) sys_properties override path (preferred when explicitly configured)
        var value = this._getPropertyOverride(name);

        // 2) custom table fallback path (default operational source of truth)
        if (value === null || value === undefined || value === '') {
            value = this._getTableValue(name, defaultValue);
        }

        if (hasSessionCache) {
            GlideSessionCache.put(cacheKey, value !== null && value !== undefined ? value : '');
        }
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

    getPropertyName: function(name) {
        return this.propertyPrefix + name;
    },

    // -------------------------------------------------------------------------
    // Domain-specific accessors
    // -------------------------------------------------------------------------

    getMinimumAdvanceNoticeHours: function() {
        return this.getNumber('minimum_advance_notice_hours', 48);
    },

    getMinimumReservationDurationMinutes: function() {
        return this.getNumber('minimum_reservation_duration_minutes', 60);
    },

    getLateCancellationWindowHours: function() {
        return this.getNumber('late_cancellation_window_hours', 4);
    },

    getWaitlistMode: function() {
        return this.getChoice('waitlist_mode', ['waitlist', 'block'], 'waitlist');
    },

    getEnrollmentApprovalMode: function() {
        return this.getChoice('enrollment_approval_mode', ['direct', 'instructor_approval'], 'direct');
    },

    getConfirmationLeadHours: function() {
        return this.getNumber('confirmation_lead_hours', 24);
    },

    getReminderLeadHours: function() {
        return this.getNumber('reminder_lead_hours', 24);
    },

    getFeedbackWindowHours: function() {
        return this.getNumber('feedback_window_hours', 48);
    },

    getStaleApprovalHours: function() {
        return this.getNumber('stale_approval_hours', 48);
    },

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    _getPropertyOverride: function(name) {
        var propertyName = this.getPropertyName(name);
        var propertyValue = gs.getProperty(propertyName, '');
        if (propertyValue === null || propertyValue === undefined) {
            return '';
        }
        return String(propertyValue);
    },

    _getTableValue: function(name, defaultValue) {
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
        return value;
    },

    type: 'TrainingConfigService'
};`,
})
