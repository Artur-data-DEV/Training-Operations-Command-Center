import { Test } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// GROUP: VirtualAgentTopicService
// TEST-041 to TEST-043
// ---------------------------------------------------------------------------

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_va_topic_menu_contract'],
        name: '[TOCC][VA] topic service exposes 6-item main menu contract',
        description: 'Validates VirtualAgentTopicService main menu payload required by VA greeting flow.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_va_topic_menu_contract_script'],
            script: `
                var svc = new x_783010_tocc_a1.VirtualAgentTopicService();
                var payload = svc.getMainMenu();

                gs.assertTrue(payload && payload.success === true, 'Main menu should return success.');
                gs.assertTrue(payload.menu && payload.menu.length === 6, 'Expected 6 main menu options.');

                var keys = {};
                for (var i = 0; i < payload.menu.length; i++) {
                    var item = payload.menu[i];
                    gs.assertTrue(!gs.nil(item.key), 'Menu item key is mandatory.');
                    gs.assertTrue(!gs.nil(item.label), 'Menu item label is mandatory.');
                    keys[item.key] = true;
                }

                gs.assertTrue(keys.find_sessions === true, 'find_sessions option missing.');
                gs.assertTrue(keys.my_enrollments === true, 'my_enrollments option missing.');
                gs.assertTrue(keys.confirm_attendance === true, 'confirm_attendance option missing.');
                gs.assertTrue(keys.cancel_enrollment === true, 'cancel_enrollment option missing.');
                gs.assertTrue(keys.training_policies === true, 'training_policies option missing.');
                gs.assertTrue(keys.escalate_backoffice === true, 'escalate_backoffice option missing.');
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_va_topic_escalation_property_binding'],
        name: '[TOCC][VA] escalation payload honors help-center properties',
        description: 'Validates getBackofficeEscalation returns values sourced from configured properties.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_va_topic_escalation_property_binding_script'],
            script: `
                var suffix = new GlideDateTime().getNumericValue() + '';

                function upsertProperty(name, value) {
                    var gr = new GlideRecord('sys_properties');
                    gr.addQuery('name', name);
                    gr.setLimit(1);
                    gr.query();
                    if (gr.next()) {
                        var original = {
                            existed: true,
                            sys_id: gr.getUniqueValue(),
                            value: gr.getValue('value'),
                        };
                        gr.setValue('value', value);
                        gr.update();
                        return original;
                    }

                    gr.initialize();
                    gr.setValue('name', name);
                    gr.setValue('type', 'string');
                    gr.setValue('value', value);
                    gr.setValue('description', 'ATF temporary property override');
                    var sysId = gr.insert();
                    return { existed: false, sys_id: sysId, value: '' };
                }

                function restoreProperty(name, original) {
                    var gr = new GlideRecord('sys_properties');
                    if (original.existed) {
                        if (gr.get(original.sys_id)) {
                            gr.setValue('value', original.value);
                            gr.update();
                        }
                        return;
                    }

                    gr.addQuery('name', name);
                    gr.addQuery('sys_id', original.sys_id);
                    gr.deleteMultiple();
                }

                var propEmail = 'x_783010_tocc_a1.backoffice.email';
                var propSupportPage = 'x_783010_tocc_a1.portal.support_page';
                var propSupportCatalog = 'x_783010_tocc_a1.portal.support_catalog_url';
                var propVaUrl = 'x_783010_tocc_a1.portal.va_url';

                var expectedEmail = 'atf-va-' + suffix + '@example.com';
                var expectedSupportPage = '?id=tocc_help_atf_' + suffix;
                var expectedSupportCatalog = '?id=tocc_sessions_atf_' + suffix;
                var expectedVaUrl = '/$sn-va-web-client-app.do?atf=' + suffix;

                var originalEmail = upsertProperty(propEmail, expectedEmail);
                var originalSupportPage = upsertProperty(propSupportPage, expectedSupportPage);
                var originalSupportCatalog = upsertProperty(propSupportCatalog, expectedSupportCatalog);
                var originalVaUrl = upsertProperty(propVaUrl, expectedVaUrl);

                try {
                    var svc = new x_783010_tocc_a1.VirtualAgentTopicService();
                    var escalation = svc.getBackofficeEscalation();

                    gs.assertTrue(escalation.success === true, 'Escalation payload must return success.');
                    gs.assertTrue(escalation.email === expectedEmail, 'Escalation email should match property override.');
                    gs.assertTrue(escalation.portal_support_page === expectedSupportPage, 'Support page should match property override.');
                    gs.assertTrue(escalation.support_catalog_url === expectedSupportCatalog, 'Support catalog should match property override.');
                    gs.assertTrue(escalation.va_url === expectedVaUrl, 'VA URL should match property override.');
                } finally {
                    restoreProperty(propEmail, originalEmail);
                    restoreProperty(propSupportPage, originalSupportPage);
                    restoreProperty(propSupportCatalog, originalSupportCatalog);
                    restoreProperty(propVaUrl, originalVaUrl);
                }
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_va_topic_policies_and_escalation'],
        name: '[TOCC][VA] policies topic payload includes policy values and escalation',
        description: 'Validates policy topic contract for VA: policies, KB link, and escalation channel.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_va_topic_policies_and_escalation_script'],
            script: `
                var svc = new x_783010_tocc_a1.VirtualAgentTopicService();
                var payload = svc.getTrainingPolicies();

                gs.assertTrue(payload && payload.success === true, 'Policy payload should return success.');
                gs.assertTrue(payload.policies, 'Policy payload must include policies object.');
                gs.assertTrue(payload.links, 'Policy payload must include links object.');
                gs.assertTrue(payload.escalation, 'Policy payload must include escalation object.');

                gs.assertTrue(
                    payload.policies.minimum_advance_notice_hours !== undefined,
                    'minimum_advance_notice_hours is required.'
                );
                gs.assertTrue(
                    payload.policies.late_cancellation_window_hours !== undefined,
                    'late_cancellation_window_hours is required.'
                );
                gs.assertTrue(
                    payload.policies.waitlist_mode !== undefined,
                    'waitlist_mode is required.'
                );
                gs.assertTrue(
                    payload.links.kb !== undefined && payload.links.kb !== '',
                    'KB link should be present.'
                );
                gs.assertTrue(
                    payload.escalation.email !== undefined && payload.escalation.email !== '',
                    'Escalation email should be present.'
                );
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_va_topic_confirm_by_number'],
        name: '[TOCC][VA] confirmAttendance accepts enrollment number reference',
        description: 'VirtualAgentTopicService should resolve enrollment number to own enrollment and confirm attendance.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_va_topic_confirm_by_number_script'],
            script: `
                var suffix = new GlideDateTime().getNumericValue() + '';

                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('room_name', 'ATF-VA-Room-' + suffix);
                room.setValue('room_code', 'ATF-ROOM-' + gs.generateGUID().substring(0, 8));
                room.setValue('capacity', 12);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'active');
                var roomId = room.insert();

                var now = new GlideDateTime();
                var start = new GlideDateTime(now);
                start.addSeconds(48 * 3600);
                var end = new GlideDateTime(start);
                end.addSeconds(2 * 3600);
                var deadline = new GlideDateTime(start);
                deadline.addSeconds(-4 * 3600);

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.initialize();
                session.setValue('title', 'ATF VA Confirm ' + suffix);
                session.setValue('room', roomId);
                session.setValue('start_datetime', start.getValue());
                session.setValue('end_datetime', end.getValue());
                session.setValue('confirmation_deadline', deadline.getValue());
                session.setValue('total_seats', 10);
                session.setValue('available_seats', 9);
                session.setValue('status', 'open');
                session.setValue('active', true);
                var sessionId = session.insert();

                var user = new GlideRecord('sys_user');
                user.initialize();
                user.setValue('user_name', 'atf_va_confirm_' + suffix);
                user.setValue('first_name', 'ATF');
                user.setValue('last_name', 'VAConfirm');
                var userId = user.insert();

                var student = new GlideRecord('x_783010_tocc_a1_student');
                student.initialize();
                student.setValue('user', userId);
                student.setValue('active', true);
                var studentId = student.insert();

                var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                enrollment.initialize();
                enrollment.setValue('student', studentId);
                enrollment.setValue('training_session', sessionId);
                enrollment.setValue('status', 'approved');
                enrollment.setValue('confirmed', false);
                var enrollmentId = enrollment.insert();
                enrollment.get(enrollmentId);
                var enrollmentNumber = enrollment.getValue('number');

                gs.impersonateUser(userId);
                var svc = new x_783010_tocc_a1.VirtualAgentTopicService();
                var result = svc.confirmAttendance(enrollmentNumber);
                gs.resetSession();

                gs.assertTrue(result.success === true, 'Expected confirmAttendance success by enrollment number.');

                var check = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                gs.assertTrue(check.get(enrollmentId), 'Enrollment missing after confirmation.');
                gs.assertTrue(check.getValue('confirmed') == 'true', 'Enrollment should be confirmed.');
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_va_topic_actionable_enrollments'],
        name: '[TOCC][VA] getActionableEnrollments returns filtered records',
        description: 'VirtualAgentTopicService should filter actionable enrollments by requested action.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_va_topic_actionable_enrollments_script'],
            script: `
                var suffix = new GlideDateTime().getNumericValue() + '';

                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('room_name', 'ATF-VA-Act-Room-' + suffix);
                room.setValue('room_code', 'ATF-ROOM-' + gs.generateGUID().substring(0, 8));
                room.setValue('capacity', 15);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'active');
                var roomId = room.insert();

                var start = new GlideDateTime();
                start.addSeconds(72 * 3600);
                var end = new GlideDateTime(start);
                end.addSeconds(2 * 3600);

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.initialize();
                session.setValue('title', 'ATF VA Actionable ' + suffix);
                session.setValue('room', roomId);
                session.setValue('start_datetime', start.getValue());
                session.setValue('end_datetime', end.getValue());
                session.setValue('total_seats', 10);
                session.setValue('available_seats', 7);
                session.setValue('status', 'open');
                session.setValue('active', true);
                var sessionId = session.insert();

                var user = new GlideRecord('sys_user');
                user.initialize();
                user.setValue('user_name', 'atf_va_actionable_' + suffix);
                user.setValue('first_name', 'ATF');
                user.setValue('last_name', 'VAActionable');
                var userId = user.insert();

                var student = new GlideRecord('x_783010_tocc_a1_student');
                student.initialize();
                student.setValue('user', userId);
                student.setValue('active', true);
                var studentId = student.insert();

                var approvedNotConfirmed = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                approvedNotConfirmed.initialize();
                approvedNotConfirmed.setValue('student', studentId);
                approvedNotConfirmed.setValue('training_session', sessionId);
                approvedNotConfirmed.setValue('status', 'approved');
                approvedNotConfirmed.setValue('confirmed', false);
                approvedNotConfirmed.insert();

                var waitlisted = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                waitlisted.initialize();
                waitlisted.setValue('student', studentId);
                waitlisted.setValue('training_session', sessionId);
                waitlisted.setValue('status', 'waitlisted');
                waitlisted.setValue('confirmed', false);
                waitlisted.insert();

                gs.impersonateUser(userId);
                var svc = new x_783010_tocc_a1.VirtualAgentTopicService();
                var confirmCandidates = svc.getActionableEnrollments('confirm_attendance', 10);
                var cancelCandidates = svc.getActionableEnrollments('cancel_enrollment', 10);
                gs.resetSession();

                gs.assertTrue(confirmCandidates.success === true, 'Expected success for confirm_attendance candidates.');
                gs.assertTrue(confirmCandidates.count >= 1, 'Expected at least one confirm_attendance candidate.');
                gs.assertTrue(cancelCandidates.success === true, 'Expected success for cancel_enrollment candidates.');
                gs.assertTrue(cancelCandidates.count >= 2, 'Expected at least two cancel_enrollment candidates.');
            `,
        })
    }
)
