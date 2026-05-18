import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['x_783010_tocc_a1_fix_cleanup_legacy_default_view_and_backoffice_role'],
    table: 'sys_script_fix',
    data: {
        name: '[TOCC] Cleanup legacy default_view and backoffice role mapping',
        active: true,
        run_once: false,
        flush_cache: true,
        description:
            'Hides legacy default_view, removes legacy form artifacts for room reservation, and ensures backoffice group has scoped role.',
        script: `(function executeFixScript() {
    var LEGACY_VIEW_NAME = 'default_view';
    var TARGET_VIEW_NAME = 'Default view';
    var TARGET_TABLE = 'x_783010_tocc_a1_room_reservation';
    var BACKOFFICE_GROUP_NAME = '[TOCC] Backoffice';
    var BACKOFFICE_ROLE_NAME = 'x_783010_tocc_a1.backoffice';
    var WORKSPACE_ROUTE_PATTERNS = [
        'tocc-backoffice-ops.*',
        'now.tocc-backoffice-ops.*',
        'x.783010.tocc-backoffice-ops.*'
    ];

    var legacyView = new GlideRecord('sys_ui_view');
    legacyView.addQuery('name', LEGACY_VIEW_NAME);
    legacyView.setLimit(1);
    legacyView.query();

    var legacyViewId = '';
    if (legacyView.next()) {
        legacyViewId = legacyView.getUniqueValue();
        legacyView.setValue('hidden', true);
        legacyView.update();
        gs.info('[TOCC][FIX] Legacy view hidden: ' + LEGACY_VIEW_NAME + ' (' + legacyViewId + ')');
    }

    var defaultView = new GlideRecord('sys_ui_view');
    defaultView.addQuery('name', TARGET_VIEW_NAME);
    defaultView.setLimit(1);
    defaultView.query();
    if (defaultView.next()) {
        defaultView.setValue('hidden', false);
        defaultView.update();
        gs.info('[TOCC][FIX] Default view forced visible: ' + TARGET_VIEW_NAME);
    }

    if (legacyViewId) {
        var uiElement = new GlideRecord('sys_ui_element');
        uiElement.addEncodedQuery('sys_ui_section.name=' + TARGET_TABLE + '^sys_ui_section.view=' + legacyViewId);
        uiElement.query();
        while (uiElement.next()) {
            uiElement.deleteRecord();
        }

        var uiSection = new GlideRecord('sys_ui_section');
        uiSection.addQuery('name', TARGET_TABLE);
        uiSection.addQuery('view', legacyViewId);
        uiSection.query();
        while (uiSection.next()) {
            uiSection.deleteRecord();
        }

        var uiForm = new GlideRecord('sys_ui_form');
        uiForm.addQuery('name', TARGET_TABLE);
        uiForm.addQuery('view', legacyViewId);
        uiForm.query();
        while (uiForm.next()) {
            uiForm.deleteRecord();
        }

        gs.info('[TOCC][FIX] Legacy form artifacts removed for table: ' + TARGET_TABLE);
    }

    var backofficeGroup = new GlideRecord('sys_user_group');
    backofficeGroup.addQuery('name', BACKOFFICE_GROUP_NAME);
    backofficeGroup.setLimit(1);
    backofficeGroup.query();

    var backofficeRole = new GlideRecord('sys_user_role');
    backofficeRole.addQuery('name', BACKOFFICE_ROLE_NAME);
    backofficeRole.setLimit(1);
    backofficeRole.query();

    if (backofficeGroup.next() && backofficeRole.next()) {
        var groupRole = new GlideRecord('sys_group_has_role');
        groupRole.addQuery('group', backofficeGroup.getUniqueValue());
        groupRole.addQuery('role', backofficeRole.getUniqueValue());
        groupRole.setLimit(1);
        groupRole.query();

        if (!groupRole.next()) {
            groupRole.initialize();
            groupRole.setValue('group', backofficeGroup.getUniqueValue());
            groupRole.setValue('role', backofficeRole.getUniqueValue());
            groupRole.insert();
            gs.info('[TOCC][FIX] Backoffice role linked to group.');
        }

        for (var i = 0; i < WORKSPACE_ROUTE_PATTERNS.length; i++) {
            var routeName = WORKSPACE_ROUTE_PATTERNS[i];
            var acl = new GlideRecord('sys_security_acl');
            acl.addQuery('type', 'ux_route');
            acl.addQuery('operation', 'read');
            acl.addQuery('name', routeName);
            acl.setLimit(1);
            acl.query();

            var aclId = '';
            if (acl.next()) {
                aclId = acl.getUniqueValue();
            } else {
                acl.initialize();
                acl.setValue('type', 'ux_route');
                acl.setValue('operation', 'read');
                acl.setValue('name', routeName);
                acl.setValue('active', true);
                acl.setValue('admin_overrides', true);
                acl.setValue('decision_type', 'allow');
                aclId = acl.insert();
                gs.info('[TOCC][FIX] Created workspace route ACL: ' + routeName);
            }

            if (aclId) {
                var aclRole = new GlideRecord('sys_security_acl_role');
                aclRole.addQuery('sys_security_acl', aclId);
                aclRole.addQuery('sys_user_role', backofficeRole.getUniqueValue());
                aclRole.setLimit(1);
                aclRole.query();
                if (!aclRole.next()) {
                    aclRole.initialize();
                    aclRole.setValue('sys_security_acl', aclId);
                    aclRole.setValue('sys_user_role', backofficeRole.getUniqueValue());
                    aclRole.insert();
                    gs.info('[TOCC][FIX] Linked backoffice role to workspace route ACL: ' + routeName);
                }
            }
        }
    }
})();`,
    },
})
