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
    },

    getValue: function(name, defaultValue) {
        if (!name) {
            return defaultValue;
        }

        var gr = new GlideRecord(this.configTable);
        gr.addQuery('name', name);
        gr.addQuery('active', true);
        gr.setLimit(1);
        gr.query();

        if (!gr.next()) {
            return defaultValue;
        }

        return gr.getValue('value') || defaultValue;
    },

    getNumber: function(name, defaultValue) {
        var raw = this.getValue(name, defaultValue + '');
        var parsed = parseInt(raw, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    },

    getBoolean: function(name, defaultValue) {
        var raw = (this.getValue(name, defaultValue ? 'true' : 'false') + '').toLowerCase();
        return raw == 'true' || raw == '1' || raw == 'yes';
    },

    getChoice: function(name, acceptedValues, defaultValue) {
        var value = this.getValue(name, defaultValue);
        var i = 0;
        for (i = 0; i < acceptedValues.length; i++) {
            if (acceptedValues[i] == value) {
                return value;
            }
        }

        return defaultValue;
    },

    getMinimumAdvanceNoticeHours: function() {
        return this.getNumber('minimum_advance_notice_hours', 24);
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

    type: 'TrainingConfigService'
};`,
})
