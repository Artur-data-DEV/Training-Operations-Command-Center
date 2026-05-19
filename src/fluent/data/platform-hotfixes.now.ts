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
            'Hides legacy default_view, migrates legacy operational references, removes legacy form/list artifacts, and ensures backoffice group has scoped role.',
        script: `(function executeFixScript() {
    var LEGACY_VIEW_NAME = 'default_view';
    var TARGET_VIEW_NAME = 'default';
    var TARGET_TABLE = 'x_783010_tocc_a1_room_reservation';
    var BACKOFFICE_GROUP_NAME = '[TOCC] Backoffice';
    var BACKOFFICE_USER_NAME = 'tocc.backoffice';
    var BACKOFFICE_ROLE_NAME = 'x_783010_tocc_a1.backoffice';
    var REQUIRED_USER_ROLE_NAMES = [
        'x_783010_tocc_a1.backoffice',
        'workspace_user',
        'canvas_user'
    ];
    var WORKSPACE_ROUTE_PATTERNS = [
        'tocc-backoffice-ops.*',
        'tocc-backoffice-ops/list',
        'now.tocc-backoffice-ops.*',
        'now.tocc-backoffice-ops.list',
        'x.783010.tocc-backoffice-ops.*',
        'x/783010/tocc-backoffice-ops/*',
        'x/783010/tocc-backoffice-ops/list',
        '/x/783010/tocc-backoffice-ops/list'
    ];

    var legacyViewIds = [];
    var legacyView = new GlideRecord('sys_ui_view');
    legacyView.addQuery('name', LEGACY_VIEW_NAME);
    legacyView.query();

    while (legacyView.next()) {
        legacyViewIds.push(String(legacyView.getUniqueValue()));
        legacyView.setValue('hidden', true);
        legacyView.update();
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

    if (legacyViewIds.length > 0) {
        var uiElement = new GlideRecord('sys_ui_element');
        uiElement.addEncodedQuery('sys_ui_section.name=' + TARGET_TABLE + '^sys_ui_section.viewIN' + legacyViewIds.join(','));
        uiElement.query();
        while (uiElement.next()) {
            uiElement.deleteRecord();
        }

        var uiSection = new GlideRecord('sys_ui_section');
        uiSection.addQuery('name', TARGET_TABLE);
        uiSection.addQuery('view', 'IN', legacyViewIds.join(','));
        uiSection.query();
        while (uiSection.next()) {
            uiSection.deleteRecord();
        }

        var uiForm = new GlideRecord('sys_ui_form');
        uiForm.addQuery('name', TARGET_TABLE);
        uiForm.addQuery('view', 'IN', legacyViewIds.join(','));
        uiForm.query();
        while (uiForm.next()) {
            uiForm.deleteRecord();
        }

        var legacyViewCleanup = new GlideRecord('sys_ui_view');
        legacyViewCleanup.addQuery('name', LEGACY_VIEW_NAME);
        legacyViewCleanup.query();
        while (legacyViewCleanup.next()) {
            legacyViewCleanup.deleteRecord();
        }

        gs.info('[TOCC][FIX] Legacy form artifacts removed for table: ' + TARGET_TABLE);
    }

    var formCleanup = new GlideRecord('sys_ui_form');
    formCleanup.addQuery('name', TARGET_TABLE);
    formCleanup.query();
    while (formCleanup.next()) {
        var formView = String(formCleanup.getValue('view') || '');
        if (formView !== 'default') {
            formCleanup.setValue('view', 'default');
            formCleanup.update();
        }
    }

    var sectionCleanup = new GlideRecord('sys_ui_section');
    sectionCleanup.addQuery('name', TARGET_TABLE);
    sectionCleanup.query();

    var keepByCaption = {};
    while (sectionCleanup.next()) {
        var caption = String(sectionCleanup.getValue('caption') || '').trim();
        var sectionId = String(sectionCleanup.getUniqueValue());

        if (gs.nil(caption)) {
            var blankElement = new GlideRecord('sys_ui_element');
            blankElement.addQuery('sys_ui_section', sectionId);
            blankElement.query();
            while (blankElement.next()) {
                blankElement.deleteRecord();
            }
            sectionCleanup.deleteRecord();
            continue;
        }

        var key = caption.toLowerCase();
        if (!keepByCaption[key]) {
            keepByCaption[key] = sectionId;
            continue;
        }

        var duplicateElement = new GlideRecord('sys_ui_element');
        duplicateElement.addQuery('sys_ui_section', sectionId);
        duplicateElement.query();
        while (duplicateElement.next()) {
            duplicateElement.deleteRecord();
        }
        sectionCleanup.deleteRecord();
    }
    gs.info('[TOCC][FIX] Room reservation form sections normalized.');

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

        var backofficeUser = new GlideRecord('sys_user');
        backofficeUser.addQuery('user_name', BACKOFFICE_USER_NAME);
        backofficeUser.setLimit(1);
        backofficeUser.query();
        if (backofficeUser.next()) {
            var changed = false;
            if (String(backofficeUser.getValue('active')) !== 'true') {
                backofficeUser.setValue('active', true);
                changed = true;
            }
            if (String(backofficeUser.getValue('locked_out')) === 'true') {
                backofficeUser.setValue('locked_out', false);
                changed = true;
            }
            if (String(backofficeUser.getValue('password_needs_reset')) === 'true') {
                backofficeUser.setValue('password_needs_reset', false);
                changed = true;
            }
            if (changed) {
                backofficeUser.update();
                gs.info('[TOCC][FIX] Backoffice user flags normalized.');
            }

            var membership = new GlideRecord('sys_user_grmember');
            membership.addQuery('group', backofficeGroup.getUniqueValue());
            membership.addQuery('user', backofficeUser.getUniqueValue());
            membership.setLimit(1);
            membership.query();
            if (!membership.next()) {
                membership.initialize();
                membership.setValue('group', backofficeGroup.getUniqueValue());
                membership.setValue('user', backofficeUser.getUniqueValue());
                membership.insert();
                gs.info('[TOCC][FIX] Backoffice user added to backoffice group.');
            }

            for (var r = 0; r < REQUIRED_USER_ROLE_NAMES.length; r++) {
                var roleName = REQUIRED_USER_ROLE_NAMES[r];
                var role = new GlideRecord('sys_user_role');
                role.addQuery('name', roleName);
                role.setLimit(1);
                role.query();
                if (!role.next()) {
                    gs.error('[TOCC][FIX] Required role not found: ' + roleName);
                    continue;
                }

                var userRole = new GlideRecord('sys_user_has_role');
                userRole.addQuery('user', backofficeUser.getUniqueValue());
                userRole.addQuery('role', role.getUniqueValue());
                userRole.setLimit(1);
                userRole.query();
                if (!userRole.next()) {
                    userRole.initialize();
                    userRole.setValue('user', backofficeUser.getUniqueValue());
                    userRole.setValue('role', role.getUniqueValue());
                    userRole.insert();
                    gs.info('[TOCC][FIX] Role granted to backoffice user: ' + roleName);
                }
            }
        } else {
            gs.error('[TOCC][FIX] Backoffice user not found: ' + BACKOFFICE_USER_NAME);
        }

        for (var i = 0; i < WORKSPACE_ROUTE_PATTERNS.length; i++) {
            var routeName = WORKSPACE_ROUTE_PATTERNS[i];
            var operations = ['read', 'execute'];
            for (var o = 0; o < operations.length; o++) {
                var operation = operations[o];
                var acl = new GlideRecord('sys_security_acl');
                acl.addQuery('type', 'ux_route');
                acl.addQuery('operation', operation);
                acl.addQuery('name', routeName);
                acl.setLimit(1);
                acl.query();

                var aclId = '';
                if (acl.next()) {
                    aclId = acl.getUniqueValue();
                } else {
                    acl.initialize();
                    acl.setValue('type', 'ux_route');
                    acl.setValue('operation', operation);
                    acl.setValue('name', routeName);
                    acl.setValue('active', true);
                    acl.setValue('admin_overrides', true);
                    acl.setValue('decision_type', 'allow');
                    aclId = acl.insert();
                    gs.info('[TOCC][FIX] Created workspace route ACL: ' + routeName + ' (' + operation + ')');
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
                        gs.info('[TOCC][FIX] Linked backoffice role to workspace route ACL: ' + routeName + ' (' + operation + ')');
                    }
                }
            }
        }

        var canvasRole = new GlideRecord('sys_user_role');
        canvasRole.addQuery('name', 'canvas_user');
        canvasRole.setLimit(1);
        canvasRole.query();
        if (canvasRole.next()) {
            var menuConfigAcl = new GlideRecord('sys_security_acl');
            menuConfigAcl.addQuery('name', 'sys_ux_list_menu_config');
            menuConfigAcl.addQuery('operation', 'read');
            menuConfigAcl.setLimit(1);
            menuConfigAcl.query();
            if (menuConfigAcl.next()) {
                var menuAclRole = new GlideRecord('sys_security_acl_role');
                menuAclRole.addQuery('sys_security_acl', menuConfigAcl.getUniqueValue());
                menuAclRole.addQuery('sys_user_role', canvasRole.getUniqueValue());
                menuAclRole.setLimit(1);
                menuAclRole.query();
                if (!menuAclRole.next()) {
                    menuAclRole.initialize();
                    menuAclRole.setValue('sys_security_acl', menuConfigAcl.getUniqueValue());
                    menuAclRole.setValue('sys_user_role', canvasRole.getUniqueValue());
                    menuAclRole.insert();
                    gs.info('[TOCC][FIX] Linked canvas_user role to sys_ux_list_menu_config read ACL.');
                }
            }
        }

        var scopedTable = new GlideRecord('sys_db_object');
        scopedTable.addEncodedQuery('nameSTARTSWITHx_783010_tocc_a1_');
        scopedTable.query();
        while (scopedTable.next()) {
            if (String(scopedTable.getValue('ws_access')) !== 'true') {
                scopedTable.setValue('ws_access', true);
                scopedTable.update();
            }
        }
        gs.info('[TOCC][FIX] ws_access normalized for scoped TOCC tables.');

        var backofficeModule = new GlideRecord('sys_app_module');
        backofficeModule.addQuery('title', 'Backoffice Workspace');
        backofficeModule.addQuery('application.name', 'x_783010_tocc_a1_tocc');
        backofficeModule.query();
        while (backofficeModule.next()) {
            backofficeModule.setValue('title', 'Backoffice Queue');
            backofficeModule.setValue('query', '/tocc?id=tocc_backoffice_queue');
            backofficeModule.setValue('active', true);
            backofficeModule.update();
            gs.info('[TOCC][FIX] Backoffice module mapped to portal queue: /tocc?id=tocc_backoffice_queue');
        }

        function setIfChanged(record, fieldName, value) {
            if (!record.isValidField(fieldName)) {
                return false;
            }
            if (String(record.getValue(fieldName) || '') === String(value || '')) {
                return false;
            }
            record.setValue(fieldName, value);
            return true;
        }

        function findOne(tableName, fieldName, value) {
            var record = new GlideRecord(tableName);
            record.addQuery(fieldName, value);
            record.setLimit(1);
            record.query();
            return record.next() ? record : null;
        }

        function migrateLegacyReferenceFields(tableName, fieldPairs) {
            var gr = new GlideRecord(tableName);
            gr.query();

            var migrated = 0;
            while (gr.next()) {
                var changedRecord = false;
                for (var p = 0; p < fieldPairs.length; p++) {
                    var pair = fieldPairs[p];
                    if (!gr.isValidField(pair.legacy) || !gr.isValidField(pair.target)) {
                        continue;
                    }

                    var legacyValue = gr.getValue(pair.legacy);
                    var targetValue = gr.getValue(pair.target);
                    if (!gs.nil(legacyValue) && gs.nil(targetValue)) {
                        gr.setValue(pair.target, legacyValue);
                        changedRecord = true;
                    }
                }

                if (changedRecord) {
                    gr.setWorkflow(false);
                    gr.update();
                    migrated++;
                }
            }

            if (migrated > 0) {
                gs.info('[TOCC][FIX] Migrated legacy references for ' + tableName + ': ' + migrated);
            }
        }

        function removeLegacyFieldsFromForms(tableName, fields) {
            var sections = new GlideRecord('sys_ui_section');
            sections.addQuery('name', tableName);
            sections.query();

            var sectionIds = [];
            while (sections.next()) {
                sectionIds.push(String(sections.getUniqueValue()));
            }

            if (sectionIds.length === 0) {
                return;
            }

            for (var f = 0; f < fields.length; f++) {
                var element = new GlideRecord('sys_ui_element');
                element.addQuery('sys_ui_section', 'IN', sectionIds.join(','));
                element.addQuery('element', fields[f]);
                element.query();
                while (element.next()) {
                    element.deleteRecord();
                }
            }
        }

        function removeLegacyFieldsFromLists(tableName, fields) {
            for (var f = 0; f < fields.length; f++) {
                var list = new GlideRecord('sys_ui_list');
                list.addQuery('name', tableName);
                list.addQuery('element', fields[f]);
                list.query();
                while (list.next()) {
                    list.deleteRecord();
                }
            }
        }

        function hideLegacyOperationalFields() {
            var layouts = [
                {
                    table: 'x_783010_tocc_a1_room_reservation',
                    fields: ['course', 'room', 'instructor']
                },
                {
                    table: 'x_783010_tocc_a1_training_session',
                    fields: ['course', 'instructor', 'reservation']
                },
                {
                    table: 'x_783010_tocc_a1_student_enrollment',
                    fields: ['student', 'training_session']
                }
            ];

            for (var i = 0; i < layouts.length; i++) {
                removeLegacyFieldsFromForms(layouts[i].table, layouts[i].fields);
                removeLegacyFieldsFromLists(layouts[i].table, layouts[i].fields);
            }
            gs.info('[TOCC][FIX] Legacy operational fields removed from generated forms/lists.');
        }

        function ensureCi(tableName, name, location) {
            var ci = new GlideRecord(tableName);
            ci.addQuery('name', name);
            ci.setLimit(1);
            ci.query();
            if (!ci.next()) {
                ci.initialize();
                ci.setValue('name', name);
                if (location && ci.isValidField('location')) {
                    ci.setValue('location', location);
                }
                if (ci.isValidField('install_status')) {
                    ci.setValue('install_status', '1');
                }
                ci.setValue('short_description', 'TOCC managed room resource CI.');
                var createdId = ci.insert();
                return createdId || '';
            }

            var changedCi = false;
            if (location && ci.isValidField('location')) {
                changedCi = setIfChanged(ci, 'location', location) || changedCi;
            }
            if (ci.isValidField('install_status')) {
                changedCi = setIfChanged(ci, 'install_status', '1') || changedCi;
            }
            if (changedCi) {
                ci.update();
            }
            return ci.getUniqueValue();
        }

        function patchRoomResource(resourceName, roomCode, ciTable, ciName) {
            var room = findOne('x_783010_tocc_a1_room', 'room_code', roomCode);
            if (!room) {
                gs.warn('[TOCC][FIX] Cannot patch resource ' + resourceName + ': room not found ' + roomCode);
                return;
            }

            var ciId = ensureCi(ciTable, ciName, room.getValue('location'));
            if (!ciId) {
                gs.warn('[TOCC][FIX] Cannot patch resource ' + resourceName + ': CI not available ' + ciName);
                return;
            }

            var resource = new GlideRecord('x_783010_tocc_a1_room_resource');
            resource.addQuery('resource_name', resourceName);
            resource.query();
            while (resource.next()) {
                var changedResource = false;
                changedResource = setIfChanged(resource, 'room', room.getUniqueValue()) || changedResource;
                changedResource = setIfChanged(resource, 'ci_reference', ciId) || changedResource;
                changedResource = setIfChanged(resource, 'active', true) || changedResource;
                if (changedResource) {
                    resource.update();
                    gs.info('[TOCC][FIX] Resource linked to room and CI: ' + resourceName);
                }
            }
        }

        function patchSession(title, number, courseId, roomCode, instructorUserName) {
            var course = findOne('x_783010_tocc_a1_course', 'course_id', courseId);
            var room = findOne('x_783010_tocc_a1_room', 'room_code', roomCode);
            var instructor = findOne('sys_user', 'user_name', instructorUserName);
            var session = new GlideRecord('x_783010_tocc_a1_training_session');
            session.addQuery('title', title);
            session.query();
            while (session.next()) {
                var changedSession = false;
                if (number && gs.nil(session.getValue('number'))) {
                    changedSession = setIfChanged(session, 'number', number) || changedSession;
                }
                if (course) {
                    changedSession = setIfChanged(session, 'tocc_course', course.getUniqueValue()) || changedSession;
                }
                if (room) {
                    changedSession = setIfChanged(session, 'room', room.getUniqueValue()) || changedSession;
                }
                if (instructor) {
                    changedSession = setIfChanged(session, 'tocc_instructor', instructor.getUniqueValue()) || changedSession;
                }
                if (changedSession) {
                    session.update();
                    gs.info('[TOCC][FIX] Session operational references normalized: ' + title);
                }
            }
        }

        function forceUiActionButtons(actionName, formStyle, listStyle) {
            var uiAction = new GlideRecord('sys_ui_action');
            uiAction.addQuery('table', TARGET_TABLE);
            uiAction.addQuery('action_name', actionName);
            uiAction.query();
            while (uiAction.next()) {
                var changedAction = false;
                changedAction = setIfChanged(uiAction, 'show_update', true) || changedAction;
                changedAction = setIfChanged(uiAction, 'form_button', true) || changedAction;
                changedAction = setIfChanged(uiAction, 'list_button', true) || changedAction;
                changedAction = setIfChanged(uiAction, 'list_choice', true) || changedAction;
                changedAction = setIfChanged(uiAction, 'list_banner_button', true) || changedAction;
                if (uiAction.isValidField('workspace_form_button')) {
                    changedAction = setIfChanged(uiAction, 'workspace_form_button', true) || changedAction;
                }
                if (formStyle && uiAction.isValidField('form_style')) {
                    changedAction = setIfChanged(uiAction, 'form_style', formStyle) || changedAction;
                }
                if (listStyle && uiAction.isValidField('list_style')) {
                    changedAction = setIfChanged(uiAction, 'list_style', listStyle) || changedAction;
                }
                if (changedAction) {
                    uiAction.update();
                    gs.info('[TOCC][FIX] UI Action button flags enforced: ' + actionName);
                }
            }
        }

        patchRoomResource('Projector - Demo Unit', 'TOCC-DEMO-ROOM-01', 'cmdb_ci_hardware', '[TOCC] Projector - Demo Unit');
        patchRoomResource('Lab Workstations', 'TOCC-DEMO-LAB-01', 'cmdb_ci_computer', '[TOCC] Lab Workstations');
        patchRoomResource('PA System', 'TOCC-DEMO-AUD-01', 'cmdb_ci_hardware', '[TOCC] PA System');
        patchRoomResource('Wireless Microphones', 'TOCC-DEMO-AUD-01', 'cmdb_ci_hardware', '[TOCC] Wireless Microphones');

        patchSession('TOCC Demo Session - Foundations', 'SES0000001', 'TOCC-DEMO-101', 'TOCC-DEMO-ROOM-01', 'tocc.instructor');
        patchSession('TOCC Demo Session - Lab Intensive', 'SES0000002', 'TOCC-DEMO-201', 'TOCC-DEMO-LAB-01', 'tocc.instructor');
        patchSession('TOCC Demo Session - Leadership Briefing Live', 'SES0000003', 'TOCC-DEMO-301', 'TOCC-DEMO-AUD-01', 'tocc.instructor');
        patchSession('TOCC Demo Session - Completed Cohort', 'SES0000004', 'TOCC-DEMO-101', 'TOCC-DEMO-AUD-01', 'tocc.instructor');

        migrateLegacyReferenceFields('x_783010_tocc_a1_room_reservation', [
            { legacy: 'course', target: 'tocc_course' },
            { legacy: 'room', target: 'tocc_room' },
            { legacy: 'instructor', target: 'tocc_instructor' }
        ]);
        migrateLegacyReferenceFields('x_783010_tocc_a1_training_session', [
            { legacy: 'course', target: 'tocc_course' },
            { legacy: 'instructor', target: 'tocc_instructor' },
            { legacy: 'reservation', target: 'tocc_reservation' }
        ]);
        migrateLegacyReferenceFields('x_783010_tocc_a1_student_enrollment', [
            { legacy: 'student', target: 'tocc_student' },
            { legacy: 'training_session', target: 'tocc_training_session' }
        ]);
        hideLegacyOperationalFields();

        forceUiActionButtons('approve_reservation', 'primary', 'primary');
        forceUiActionButtons('reject_reservation', 'destructive', 'destructive');
    }
})();`,
    },
})
