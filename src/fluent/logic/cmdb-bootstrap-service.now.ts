import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['x_783010_tocc_a1_script_include_cmdb_bootstrap_service'],
    name: 'CmdbBootstrapService',
    apiName: 'x_783010_tocc_a1.CmdbBootstrapService',
    accessibleFrom: 'package_private',
    clientCallable: false,
    protectionPolicy: 'read',
    script: `var CmdbBootstrapService = Class.create();
CmdbBootstrapService.prototype = {
    initialize: function() {},

    bootstrapSampleAssetsForRoom: function(roomSysId) {
        var summary = {
            success: true,
            message: '',
            room_sys_id: roomSysId || '',
            ci_created: 0,
            ci_existing: 0,
            resource_created: 0,
            resource_updated: 0,
            resources_total: 0,
            ci_ids: [],
            resource_ids: [],
        };

        try {
            var room = this._getRoom(roomSysId);
            if (!room) {
                summary.success = false;
                summary.message = 'No active room found to bootstrap CMDB sample assets.';
                return summary;
            }

            summary.room_sys_id = room.getUniqueValue();
            var roomName = room.getDisplayValue('room_name') || room.getValue('room_name') || room.getValue('name') || 'Room';
            var roomLocation = room.getValue('location') || '';

            var definitions = [
                { ciClass: 'cmdb_ci_hardware', resourceType: 'projector', label: 'Projector' },
                { ciClass: 'cmdb_ci_hardware', resourceType: 'av', label: 'AV System' },
                { ciClass: 'cmdb_ci_computer', resourceType: 'computer', label: 'Room Computer' },
            ];

            for (var i = 0; i < definitions.length; i++) {
                var def = definitions[i];
                var ciName = '[TOCC] ' + def.label + ' - ' + roomName;
                var ciInfo = this._ensureCi(def.ciClass, ciName, roomLocation);

                if (ciInfo.action === 'created') {
                    summary.ci_created = summary.ci_created + 1;
                } else {
                    summary.ci_existing = summary.ci_existing + 1;
                }
                summary.ci_ids.push(ciInfo.sys_id);

                var resourceInfo = this._ensureRoomResource(room.getUniqueValue(), ciInfo.sys_id, def.resourceType, def.label);
                if (resourceInfo.action === 'created') {
                    summary.resource_created = summary.resource_created + 1;
                } else {
                    summary.resource_updated = summary.resource_updated + 1;
                }
                summary.resource_ids.push(resourceInfo.sys_id);
            }

            summary.resources_total = summary.resource_ids.length;
            summary.message = 'CMDB sample asset bootstrap completed.';
        } catch (ex) {
            summary.success = false;
            summary.message = 'CMDB sample asset bootstrap failed: ' + this._toErrorMessage(ex);
            gs.error('[TOCC][CmdbBootstrapService] ' + summary.message);
        }

        return summary;
    },

    bootstrapSampleAssetsForRoomAsJson: function(roomSysId) {
        return JSON.stringify(this.bootstrapSampleAssetsForRoom(roomSysId));
    },

    _getRoom: function(roomSysId) {
        var room = new GlideRecordSecure('x_783010_tocc_a1_room');
        if (roomSysId && room.get(roomSysId)) {
            return room;
        }

        room = new GlideRecordSecure('x_783010_tocc_a1_room');
        room.addQuery('status', 'active');
        room.setLimit(1);
        room.query();
        return room.next() ? room : null;
    },

    _ensureCi: function(ciClassName, ciName, locationSysId) {
        var ci = new GlideRecord(ciClassName);
        ci.addQuery('name', ciName);
        ci.setLimit(1);
        ci.query();

        if (ci.next()) {
            var changedExisting = false;
            changedExisting = this._setIfChanged(ci, 'location', locationSysId) || changedExisting;
            changedExisting = this._setIfChanged(ci, 'install_status', '1') || changedExisting;
            if (changedExisting) {
                ci.update();
            }
            return { sys_id: ci.getUniqueValue(), action: changedExisting ? 'updated' : 'existing' };
        }

        ci.initialize();
        this._setIfPresent(ci, 'name', ciName);
        this._setIfPresent(ci, 'location', locationSysId);
        this._setIfPresent(ci, 'install_status', '1');
        this._setIfPresent(ci, 'short_description', 'Auto-generated sample CI for TOCC CMDB bootstrap.');
        var ciId = ci.insert();
        if (!ciId) {
            throw new Error('Unable to create CI in class ' + ciClassName + ': ' + ciName);
        }

        return { sys_id: ciId, action: 'created' };
    },

    _ensureRoomResource: function(roomSysId, ciSysId, resourceType, resourceLabel) {
        var resource = new GlideRecord('x_783010_tocc_a1_room_resource');
        resource.addQuery('room', roomSysId);
        resource.addQuery('ci_reference', ciSysId);
        resource.setLimit(1);
        resource.query();

        if (resource.next()) {
            var changedExisting = false;
            changedExisting = this._setIfChanged(resource, 'resource_name', resourceLabel) || changedExisting;
            changedExisting = this._setIfChanged(resource, 'resource_type', resourceType) || changedExisting;
            changedExisting = this._setIfChanged(resource, 'quantity', '1') || changedExisting;
            changedExisting = this._setIfChanged(resource, 'active', true) || changedExisting;
            if (changedExisting) {
                resource.update();
            }
            return { sys_id: resource.getUniqueValue(), action: changedExisting ? 'updated' : 'existing' };
        }

        resource.initialize();
        resource.setValue('room', roomSysId);
        resource.setValue('ci_reference', ciSysId);
        resource.setValue('resource_name', resourceLabel);
        resource.setValue('resource_type', resourceType);
        resource.setValue('quantity', '1');
        resource.setValue('active', true);
        var resourceId = resource.insert();
        if (!resourceId) {
            throw new Error('Unable to create room resource for CI ' + ciSysId);
        }

        return { sys_id: resourceId, action: 'created' };
    },

    _setIfPresent: function(record, fieldName, value) {
        if (!record.isValidField(fieldName)) {
            return false;
        }
        if (value === undefined || value === null || value === '') {
            return false;
        }
        record.setValue(fieldName, value);
        return true;
    },

    _setIfChanged: function(record, fieldName, value) {
        if (!record.isValidField(fieldName)) {
            return false;
        }
        var previous = this._safe(record.getValue(fieldName));
        var next = this._safe(value);
        if (previous === next) {
            return false;
        }
        record.setValue(fieldName, value);
        return true;
    },

    _safe: function(value) {
        if (value === null || value === undefined) {
            return '';
        }
        return String(value);
    },

    _toErrorMessage: function(error) {
        if (!error) {
            return 'Unknown error';
        }
        if (error.message) {
            return String(error.message);
        }
        return String(error);
    },

    type: 'CmdbBootstrapService'
};`,
})
