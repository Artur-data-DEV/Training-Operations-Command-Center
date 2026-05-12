import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['x_783010_tocc_a1_script_include_cmdb_resource_service'],
    name: 'CmdbResourceService',
    apiName: 'x_783010_tocc_a1.CmdbResourceService',
    accessibleFrom: 'package_private',
    clientCallable: false,
    protectionPolicy: 'read',
    script: `var CmdbResourceService = Class.create();
CmdbResourceService.prototype = {
    initialize: function() {},

    applyBeforeSave: function(current) {
        var error = this.validateRoomResourceCi(current);
        if (error) {
            return error;
        }

        this.enrichResourceFromCi(current);
        return '';
    },

    validateRoomResourceCi: function(current) {
        if (!current) {
            return '';
        }

        var ciId = current.getValue('ci_reference');
        if (!ciId) {
            return '';
        }

        var ci = new GlideRecordSecure('cmdb_ci');
        if (!ci.get(ciId)) {
            return 'Selected CMDB CI does not exist or is not accessible.';
        }

        if (this._isRetiredCi(ci)) {
            return 'Selected CMDB CI is retired. Choose an active CI.';
        }

        return '';
    },

    enrichResourceFromCi: function(current) {
        if (!current) {
            return;
        }

        var ciId = current.getValue('ci_reference');
        if (!ciId) {
            return;
        }

        var ci = new GlideRecordSecure('cmdb_ci');
        if (!ci.get(ciId)) {
            return;
        }

        if (gs.nil(current.getValue('resource_name'))) {
            current.setValue('resource_name', ci.getDisplayValue('name'));
        }

        if (gs.nil(current.getValue('resource_type'))) {
            current.setValue('resource_type', this._mapResourceType(ci.getValue('sys_class_name')));
        }
    },

    _isRetiredCi: function(ci) {
        if (!ci || !ci.isValidField('install_status')) {
            return false;
        }

        var status = String(ci.getValue('install_status') || '').toLowerCase();
        return status === 'retired' || status === '6' || status === '7';
    },

    _mapResourceType: function(sysClassName) {
        var className = String(sysClassName || '').toLowerCase();

        if (className.indexOf('computer') >= 0) {
            return 'computer';
        }
        if (className.indexOf('projector') >= 0 || className.indexOf('display') >= 0) {
            return 'projector';
        }
        if (className.indexOf('audio') >= 0 || className.indexOf('video') >= 0 || className.indexOf('microphone') >= 0 || className.indexOf('av') >= 0) {
            return 'av';
        }

        return 'other';
    },

    type: 'CmdbResourceService'
};`,
})
