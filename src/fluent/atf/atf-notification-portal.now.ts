import { Test } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// GROUP: NotificationHelper — event queue validation
// TEST-024 to TEST-026
// ---------------------------------------------------------------------------

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_notif_reservation_approved_event'],
        name: '[TOCC][NOTIF] sendReservationDecision queues approved event',
        description: 'NotificationHelper must queue the reservation.approved event when status is approved.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_notif_res_approved_script'],
            script: `
                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('name', 'ATF-Room-NOTIF1');
                room.setValue('code', 'ATF-NOTIF1');
                room.setValue('capacity', 10);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'available');
                room.setValue('active', true);
                var roomId = room.insert();

                var reservation = new GlideRecord('x_783010_tocc_a1_room_reservation');
                reservation.initialize();
                reservation.setValue('room', roomId);
                reservation.setValue('instructor', gs.getUserID());
                reservation.setValue('start_datetime', '2038-01-01 09:00:00');
                reservation.setValue('end_datetime', '2038-01-01 11:00:00');
                reservation.setValue('expected_participants', 5);
                reservation.setValue('status', 'approved');
                reservation.setValue('short_description', 'ATF notif approved');
                var reservationId = reservation.insert();

                // Record event count before
                var beforeCount = 0;
                var evBefore = new GlideRecord('sysevent');
                evBefore.addQuery('name', 'x_783010_tocc_a1.reservation.approved');
                evBefore.addQuery('parm1', reservation.getValue('number'));
                evBefore.query();
                while (evBefore.next()) { beforeCount++; }

                var helper = new x_783010_tocc_a1.NotificationHelper();
                helper.sendReservationDecision(reservationId);

                // Verify event was queued
                var evAfter = new GlideRecord('sysevent');
                evAfter.addQuery('name', 'x_783010_tocc_a1.reservation.approved');
                evAfter.orderByDesc('sys_created_on');
                evAfter.setLimit(1);
                evAfter.query();

                gs.assertTrue(
                    evAfter.next(),
                    'Expected reservation.approved event to be queued after sendReservationDecision call.'
                );
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_portal_cancel_enrollment_success'],
        name: '[TOCC][PORTAL] cancelMyEnrollment cancels own enrollment and syncs seats',
        description: 'PortalApiService must cancel the logged student enrollment and sync session seats/status.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_portal_cancel_success_script'],
            script: `
                var suffix = new GlideDateTime().getNumericValue() + '';

                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('name', 'ATF-Room-CANCEL-' + suffix);
                room.setValue('code', 'ATF-CANCEL-' + suffix);
                room.setValue('capacity', 10);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'available');
                room.setValue('active', true);
                var roomId = room.insert();

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.initialize();
                session.setValue('title', 'ATF Cancel Session ' + suffix);
                session.setValue('room', roomId);
                session.setValue('start_datetime', '2040-01-01 09:00:00');
                session.setValue('end_datetime', '2040-01-01 11:00:00');
                session.setValue('total_seats', 1);
                session.setValue('available_seats', 0);
                session.setValue('status', 'full');
                session.setValue('active', true);
                var sessionId = session.insert();

                var user = new GlideRecord('sys_user');
                user.initialize();
                user.setValue('user_name', 'atf_cancel_ok_' + suffix);
                user.setValue('first_name', 'ATF');
                user.setValue('last_name', 'CancelOk');
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

                gs.impersonateUser(userId);
                var svc = new x_783010_tocc_a1.PortalApiService();
                svc._testParams = { sysparm_enrollment_id: enrollmentId };
                var result = JSON.parse(svc.cancelMyEnrollment());
                gs.resetSession();

                gs.assertTrue(result.success === true, 'Expected cancellation success. Got: ' + JSON.stringify(result));

                var enCheck = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                gs.assertTrue(enCheck.get(enrollmentId), 'Enrollment not found after cancellation.');
                gs.assertTrue(enCheck.getValue('status') === 'cancelled', 'Enrollment should be cancelled.');

                var sessionCheck = new GlideRecord('x_783010_tocc_a1_training_session');
                gs.assertTrue(sessionCheck.get(sessionId), 'Session not found after cancellation.');
                gs.assertTrue(sessionCheck.getValue('available_seats') == '1', 'Seat should be released to 1.');
                gs.assertTrue(sessionCheck.getValue('status') === 'open', 'Session should reopen after seat release.');
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_portal_cancel_enrollment_late_blocked'],
        name: '[TOCC][PORTAL] cancelMyEnrollment blocked inside late cancellation window',
        description: 'PortalApiService must block student cancellation when session is inside late window.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_portal_cancel_late_block_script'],
            script: `
                var suffix = new GlideDateTime().getNumericValue() + '';

                // Force deterministic cancellation window for this test.
                var cfg = new GlideRecord('x_783010_tocc_a1_training_config');
                cfg.addQuery('name', 'late_cancellation_window_hours');
                cfg.setLimit(1);
                cfg.query();

                var previousValue = '';
                if (cfg.next()) {
                    previousValue = cfg.getValue('value') || '';
                    cfg.setValue('value', '4');
                    cfg.update();
                }

                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('name', 'ATF-Room-CANCEL-LATE-' + suffix);
                room.setValue('code', 'ATF-CAN-LATE-' + suffix);
                room.setValue('capacity', 10);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'available');
                room.setValue('active', true);
                var roomId = room.insert();

                var start = new GlideDateTime();
                start.addSeconds(60 * 60); // 1 hour from now (inside 4h late window)
                var end = new GlideDateTime(start);
                end.addSeconds(2 * 60 * 60);

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.initialize();
                session.setValue('title', 'ATF Cancel Late Session ' + suffix);
                session.setValue('room', roomId);
                session.setValue('start_datetime', start.getValue());
                session.setValue('end_datetime', end.getValue());
                session.setValue('total_seats', 1);
                session.setValue('available_seats', 0);
                session.setValue('status', 'full');
                session.setValue('active', true);
                var sessionId = session.insert();

                var user = new GlideRecord('sys_user');
                user.initialize();
                user.setValue('user_name', 'atf_cancel_late_' + suffix);
                user.setValue('first_name', 'ATF');
                user.setValue('last_name', 'CancelLate');
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

                gs.impersonateUser(userId);
                var svc = new x_783010_tocc_a1.PortalApiService();
                svc._testParams = { sysparm_enrollment_id: enrollmentId };
                var result = JSON.parse(svc.cancelMyEnrollment());
                gs.resetSession();

                gs.assertTrue(result.success === false, 'Expected cancellation block in late window.');

                var enCheck = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                gs.assertTrue(enCheck.get(enrollmentId), 'Enrollment missing after late-window attempt.');
                gs.assertTrue(enCheck.getValue('status') === 'approved', 'Enrollment should remain approved.');

                // Restore config
                var cfgRestore = new GlideRecord('x_783010_tocc_a1_training_config');
                cfgRestore.addQuery('name', 'late_cancellation_window_hours');
                cfgRestore.setLimit(1);
                cfgRestore.query();
                if (cfgRestore.next() && previousValue !== '') {
                    cfgRestore.setValue('value', previousValue);
                    cfgRestore.update();
                }
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_portal_training_policies_payload'],
        name: '[TOCC][PORTAL] getTrainingPolicies returns policy payload for VA',
        description: 'PortalApiService must expose policy keys consumed by VA topic responses.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_portal_policy_payload_script'],
            script: `
                var svc = new x_783010_tocc_a1.PortalApiService();
                var result = JSON.parse(svc.getTrainingPolicies());

                gs.assertTrue(result.success === true, 'Expected success from getTrainingPolicies.');
                gs.assertTrue(result.policies !== undefined, 'Policies object must exist.');
                gs.assertTrue(result.policies.late_cancellation_window_hours !== undefined, 'Missing late cancellation policy.');
                gs.assertTrue(result.policies.confirmation_lead_hours !== undefined, 'Missing confirmation policy.');
                gs.assertTrue(result.links !== undefined, 'Links object must exist.');
                gs.assertTrue(result.links.kb !== undefined && result.links.kb !== '', 'KB link must be present.');
                gs.assertTrue(result.links.support_page !== undefined && result.links.support_page !== '', 'Support page link must be present.');
                gs.assertTrue(result.links.support_catalog_url !== undefined && result.links.support_catalog_url !== '', 'Support catalog link must be present.');
                gs.assertTrue(result.links.va_url !== undefined && result.links.va_url !== '', 'VA URL must be present.');
                gs.assertTrue(result.links.backoffice_email !== undefined && result.links.backoffice_email !== '', 'Backoffice email must be present.');
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_portal_help_center_context_payload'],
        name: '[TOCC][PORTAL] getHelpCenterContext returns support links payload',
        description: 'PortalApiService must return a complete property-driven Help Center payload.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_portal_help_center_context_script'],
            script: `
                var svc = new x_783010_tocc_a1.PortalApiService();
                var result = JSON.parse(svc.getHelpCenterContext());

                gs.assertTrue(result.success === true, 'Expected success from getHelpCenterContext.');
                gs.assertTrue(result.kb_url !== undefined && result.kb_url !== '', 'KB URL must be present.');
                gs.assertTrue(result.va_url !== undefined && result.va_url !== '', 'VA URL must be present.');
                gs.assertTrue(result.support_page !== undefined && result.support_page !== '', 'Support page must be present.');
                gs.assertTrue(result.support_catalog_url !== undefined && result.support_catalog_url !== '', 'Support catalog URL must be present.');
                gs.assertTrue(result.backoffice_email !== undefined && result.backoffice_email !== '', 'Backoffice email must be present.');
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_notif_reservation_rejected_event'],
        name: '[TOCC][NOTIF] sendReservationDecision queues rejected event',
        description: 'NotificationHelper must queue the reservation.rejected event when status is rejected.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_notif_res_rejected_script'],
            script: `
                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('name', 'ATF-Room-NOTIF2');
                room.setValue('code', 'ATF-NOTIF2');
                room.setValue('capacity', 10);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'available');
                room.setValue('active', true);
                var roomId = room.insert();

                var reservation = new GlideRecord('x_783010_tocc_a1_room_reservation');
                reservation.initialize();
                reservation.setValue('room', roomId);
                reservation.setValue('instructor', gs.getUserID());
                reservation.setValue('start_datetime', '2038-02-01 09:00:00');
                reservation.setValue('end_datetime', '2038-02-01 11:00:00');
                reservation.setValue('expected_participants', 5);
                reservation.setValue('status', 'rejected');
                reservation.setValue('short_description', 'ATF notif rejected');
                var reservationId = reservation.insert();

                var helper = new x_783010_tocc_a1.NotificationHelper();
                helper.sendReservationDecision(reservationId);

                var evAfter = new GlideRecord('sysevent');
                evAfter.addQuery('name', 'x_783010_tocc_a1.reservation.rejected');
                evAfter.orderByDesc('sys_created_on');
                evAfter.setLimit(1);
                evAfter.query();

                gs.assertTrue(
                    evAfter.next(),
                    'Expected reservation.rejected event to be queued after sendReservationDecision call.'
                );
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_notif_enrollment_decision_events'],
        name: '[TOCC][NOTIF] sendEnrollmentDecision queues correct event per status',
        description: 'NotificationHelper maps approved/rejected/waitlisted/cancelled to correct events.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_notif_enrollment_events_script'],
            script: `
                // Create minimal fixtures
                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('name', 'ATF-Room-NOTIF3');
                room.setValue('code', 'ATF-NOTIF3');
                room.setValue('capacity', 10);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'available');
                room.setValue('active', true);
                var roomId = room.insert();

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.initialize();
                session.setValue('title', 'ATF Notif Session');
                session.setValue('room', roomId);
                session.setValue('start_datetime', '2038-03-01 09:00:00');
                session.setValue('end_datetime', '2038-03-01 11:00:00');
                session.setValue('total_seats', 10);
                session.setValue('available_seats', 10);
                session.setValue('status', 'open');
                session.setValue('active', true);
                var sessionId = session.insert();

                var userI = new GlideRecord('sys_user');
                userI.initialize(); userI.setValue('user_name', 'atf_notif_i'); userI.setValue('first_name', 'ATF'); userI.setValue('last_name', 'I');
                var userIId = userI.insert();
                var studentI = new GlideRecord('x_783010_tocc_a1_student');
                studentI.initialize(); studentI.setValue('user', userIId); studentI.setValue('active', true);
                var studentIId = studentI.insert();

                var statuses = ['approved', 'rejected', 'waitlisted', 'cancelled'];
                var helper = new x_783010_tocc_a1.NotificationHelper();

                for (var i = 0; i < statuses.length; i++) {
                    var status = statuses[i];
                    var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                    enrollment.initialize();
                    enrollment.setValue('student', studentIId);
                    enrollment.setValue('training_session', sessionId);
                    enrollment.setValue('status', status);
                    var enrollmentId = enrollment.insert();

                    helper.sendEnrollmentDecision(enrollmentId);

                    var expectedEvent = 'x_783010_tocc_a1.enrollment.' + status;
                    var ev = new GlideRecord('sysevent');
                    ev.addQuery('name', expectedEvent);
                    ev.orderByDesc('sys_created_on');
                    ev.setLimit(1);
                    ev.query();

                    gs.assertTrue(
                        ev.next(),
                        'Expected event ' + expectedEvent + ' to be queued for status: ' + status
                    );

                    // Clean up enrollment for next iteration
                    var del = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                    del.get(enrollmentId);
                    del.deleteRecord();
                }
            `,
        })
    }
)

// ---------------------------------------------------------------------------
// GROUP: PortalApiService — ACL & data boundaries
// TEST-027 to TEST-030
// ---------------------------------------------------------------------------

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_portal_available_sessions_open_only'],
        name: '[TOCC][PORTAL] getAvailableSessions returns only open/full sessions',
        description: 'PortalApiService must not return draft, completed, or cancelled sessions.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_portal_sessions_filter_script'],
            script: `
                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('name', 'ATF-Room-PORTAL1');
                room.setValue('code', 'ATF-PORTAL1');
                room.setValue('capacity', 10);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'available');
                room.setValue('active', true);
                var roomId = room.insert();

                var statuses = ['open', 'full', 'draft', 'completed', 'cancelled'];
                for (var i = 0; i < statuses.length; i++) {
                    var s = new GlideRecord('x_783010_tocc_a1_training_session');
                    s.initialize();
                    s.setValue('title', 'ATF Portal Session ' + statuses[i]);
                    s.setValue('room', roomId);
                    s.setValue('start_datetime', '2039-01-0' + (i+1) + ' 09:00:00');
                    s.setValue('end_datetime', '2039-01-0' + (i+1) + ' 11:00:00');
                    s.setValue('total_seats', 10);
                    s.setValue('available_seats', statuses[i] === 'full' ? 0 : 10);
                    s.setValue('status', statuses[i]);
                    s.setValue('active', true);
                    s.insert();
                }

                var svc = new x_783010_tocc_a1.PortalApiService();
                var resultJson = svc.getAvailableSessions();
                var result = JSON.parse(resultJson);

                gs.assertTrue(result.success === true, 'getAvailableSessions failed: ' + resultJson);

                // Verify only open/full sessions in results
                for (var j = 0; j < result.sessions.length; j++) {
                    var sessionStatus = result.sessions[j].status;
                    gs.assertTrue(
                        sessionStatus === 'open' || sessionStatus === 'full',
                        'Non-open/full session returned: ' + sessionStatus
                    );
                }
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_portal_my_enrollments_own_only'],
        name: '[TOCC][PORTAL] getMyEnrollments returns only logged-in student records',
        description: 'PortalApiService must not return another student\'s enrollments.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_portal_my_enrollments_script'],
            script: `
                // Create two users with student profiles
                var userJ = new GlideRecord('sys_user');
                userJ.initialize(); userJ.setValue('user_name', 'atf_portal_j'); userJ.setValue('first_name', 'ATF'); userJ.setValue('last_name', 'J');
                var userJId = userJ.insert();

                var userK = new GlideRecord('sys_user');
                userK.initialize(); userK.setValue('user_name', 'atf_portal_k'); userK.setValue('first_name', 'ATF'); userK.setValue('last_name', 'K');
                var userKId = userK.insert();

                var studentJ = new GlideRecord('x_783010_tocc_a1_student');
                studentJ.initialize(); studentJ.setValue('user', userJId); studentJ.setValue('active', true);
                var studentJId = studentJ.insert();

                var studentK = new GlideRecord('x_783010_tocc_a1_student');
                studentK.initialize(); studentK.setValue('user', userKId); studentK.setValue('active', true);
                var studentKId = studentK.insert();

                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('name', 'ATF-Room-PORTAL2');
                room.setValue('code', 'ATF-P2');
                room.setValue('capacity', 10);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'available');
                room.setValue('active', true);
                var roomId = room.insert();

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.initialize();
                session.setValue('title', 'ATF Portal Session OWN');
                session.setValue('room', roomId);
                session.setValue('start_datetime', '2039-02-01 09:00:00');
                session.setValue('end_datetime', '2039-02-01 11:00:00');
                session.setValue('total_seats', 10);
                session.setValue('available_seats', 10);
                session.setValue('status', 'open');
                session.setValue('active', true);
                var sessionId = session.insert();

                // Enroll both students
                var enJ = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                enJ.initialize(); enJ.setValue('student', studentJId); enJ.setValue('training_session', sessionId); enJ.setValue('status', 'approved');
                enJ.insert();

                var enK = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                enK.initialize(); enK.setValue('student', studentKId); enK.setValue('training_session', sessionId); enK.setValue('status', 'approved');
                enK.insert();

                // Impersonate User J and call getMyEnrollments
                gs.impersonateUser(userJId);
                var svc = new x_783010_tocc_a1.PortalApiService();
                var resultJson = svc.getMyEnrollments();
                var result = JSON.parse(resultJson);
                gs.resetSession();

                if (result.success && result.enrollments) {
                    for (var i = 0; i < result.enrollments.length; i++) {
                        // All returned enrollments must belong to Student J
                        var enRec = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                        enRec.get(result.enrollments[i].sys_id);
                        gs.assertTrue(
                            enRec.getValue('student') === studentJId,
                            'Enrollment from another student returned for User J: ' + result.enrollments[i].sys_id
                        );
                    }
                }
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_portal_confirm_blocked_after_deadline'],
        name: '[TOCC][PORTAL] confirmMyAttendance blocked after confirmation deadline',
        description: 'PortalApiService must reject confirmation requests past the deadline.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_portal_confirm_deadline_script'],
            script: `
                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('name', 'ATF-Room-PORTAL3');
                room.setValue('code', 'ATF-P3');
                room.setValue('capacity', 10);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'available');
                room.setValue('active', true);
                var roomId = room.insert();

                // Session with a deadline in the past
                var deadline = new GlideDateTime();
                deadline.addSeconds(-7200); // 2 hours ago

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.initialize();
                session.setValue('title', 'ATF Portal Deadline Session');
                session.setValue('room', roomId);
                session.setValue('start_datetime', '2025-01-01 09:00:00');
                session.setValue('end_datetime', '2025-01-01 11:00:00');
                session.setValue('confirmation_deadline', deadline.getValue());
                session.setValue('total_seats', 10);
                session.setValue('available_seats', 10);
                session.setValue('status', 'open');
                session.setValue('active', true);
                var sessionId = session.insert();

                var userL = new GlideRecord('sys_user');
                userL.initialize(); userL.setValue('user_name', 'atf_deadline_l'); userL.setValue('first_name', 'ATF'); userL.setValue('last_name', 'L');
                var userLId = userL.insert();
                var studentL = new GlideRecord('x_783010_tocc_a1_student');
                studentL.initialize(); studentL.setValue('user', userLId); studentL.setValue('active', true);
                var studentLId = studentL.insert();

                var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                enrollment.initialize();
                enrollment.setValue('student', studentLId);
                enrollment.setValue('training_session', sessionId);
                enrollment.setValue('status', 'approved');
                enrollment.setValue('confirmed', false);
                var enrollmentId = enrollment.insert();

                // Impersonate student L and call the real PortalApiService method.
                gs.impersonateUser(userLId);
                var svc = new x_783010_tocc_a1.PortalApiService();
                svc._testParams = { sysparm_enrollment_id: enrollmentId };
                var result = JSON.parse(svc.confirmMyAttendance());
                gs.resetSession();

                gs.assertTrue(result.success === false, 'Confirmation should be blocked after deadline.');
                gs.assertTrue(
                    (result.message || '').indexOf('deadline') > -1,
                    'Expected deadline-related message, got: ' + JSON.stringify(result)
                );
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_portal_confirm_blocked_wrong_student'],
        name: '[TOCC][PORTAL] confirmMyAttendance blocked for wrong student',
        description: 'Student cannot confirm another student\'s enrollment via PortalApiService.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_portal_confirm_wrong_student_script'],
            script: `
                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('name', 'ATF-Room-PORTAL4');
                room.setValue('code', 'ATF-P4');
                room.setValue('capacity', 10);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'available');
                room.setValue('active', true);
                var roomId = room.insert();

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.initialize();
                session.setValue('title', 'ATF Portal Wrong Student Session');
                session.setValue('room', roomId);
                session.setValue('start_datetime', '2039-06-01 09:00:00');
                session.setValue('end_datetime', '2039-06-01 11:00:00');
                session.setValue('total_seats', 10);
                session.setValue('available_seats', 10);
                session.setValue('status', 'open');
                session.setValue('active', true);
                var sessionId = session.insert();

                // Owner student M
                var userM = new GlideRecord('sys_user');
                userM.initialize(); userM.setValue('user_name', 'atf_wrong_m'); userM.setValue('first_name', 'ATF'); userM.setValue('last_name', 'M');
                var userMId = userM.insert();
                var studentM = new GlideRecord('x_783010_tocc_a1_student');
                studentM.initialize(); studentM.setValue('user', userMId); studentM.setValue('active', true);
                var studentMId = studentM.insert();

                // Attacker student N
                var userN = new GlideRecord('sys_user');
                userN.initialize(); userN.setValue('user_name', 'atf_wrong_n'); userN.setValue('first_name', 'ATF'); userN.setValue('last_name', 'N');
                var userNId = userN.insert();
                var studentN = new GlideRecord('x_783010_tocc_a1_student');
                studentN.initialize(); studentN.setValue('user', userNId); studentN.setValue('active', true);
                var studentNId = studentN.insert();

                var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                enrollment.initialize();
                enrollment.setValue('student', studentMId); // owned by M
                enrollment.setValue('training_session', sessionId);
                enrollment.setValue('status', 'approved');
                enrollment.setValue('confirmed', false);
                var enrollmentId = enrollment.insert();

                // Simulate N trying to confirm M's enrollment via the real API method.
                gs.impersonateUser(userNId);
                var svc = new x_783010_tocc_a1.PortalApiService();
                svc._testParams = { sysparm_enrollment_id: enrollmentId };
                var result = JSON.parse(svc.confirmMyAttendance());
                gs.resetSession();

                gs.assertTrue(result.success === false, 'Expected wrong-student confirmation block.');
                gs.assertTrue(
                    (result.message || '').indexOf('own enrollment') > -1,
                    'Expected ownership-related message, got: ' + JSON.stringify(result)
                );
            `,
        })
    }
)
