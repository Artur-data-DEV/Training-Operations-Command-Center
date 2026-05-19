import { Test } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// GROUP: TrainingSessionService
// TEST-021 to TEST-023
// ---------------------------------------------------------------------------

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_session_created_on_approval'],
        name: '[TOCC][SESSION] Session created when reservation is approved',
        description: 'Approving a room reservation must trigger automatic Training Session creation.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_session_approval_script'],
            script: `
                function assertTrue(condition, message) {
                    if (!condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }
                function assertFalse(condition, message) {
                    if (condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('room_name', 'ATF-Room-SESS');
                room.setValue('room_code', 'ATF-ROOM-' + gs.generateGUID().substring(0, 8));
                room.setValue('capacity', 15);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'active');
                var roomId = room.insert();

                var course = new GlideRecord('x_783010_tocc_a1_course');
                course.initialize();
                course.setValue('course_name', 'ATF Course SESS');
                course.setValue('course_id', 'ATF-COURSE-' + gs.generateGUID().substring(0, 8));
                course.setValue('description', 'ATF fixture course for session creation');
                course.setValue('duration_hours', 8);
                course.setValue('delivery_category', 'in_person');
                course.setValue('status', 'active');
                var courseId = course.insert();

                // Create reservation in approved status â€” BR should fire and create session
                var reservation = new GlideRecord('x_783010_tocc_a1_room_reservation');
                reservation.initialize();
                reservation.setValue('tocc_course', courseId);
                reservation.setValue('tocc_room', roomId);
                reservation.setValue('tocc_instructor', gs.getUserID());
                reservation.setValue('start_datetime', '2037-03-01 09:00:00');
                reservation.setValue('end_datetime', '2037-03-01 11:00:00');
                reservation.setValue('expected_participants', 12);
                reservation.setValue('status', 'approved');
                reservation.setValue('short_description', 'ATF reservation SESS');
                var reservationId = reservation.insert();

                // BR_SyncTrainingSession should have created a session
                // Allow a short delay for workflow to complete if async â€” but BRs are sync.
                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.addQuery('tocc_reservation', reservationId);
                session.setLimit(1);
                session.query();

                assertTrue(session.next(), 'Training session should have been created on reservation approval.');
                assertTrue(session.getValue('room') === roomId, 'Session room should match reservation room.');
                assertTrue(
                    parseInt(session.getValue('total_seats'), 10) === 12,
                    'Session total_seats should match expected_participants. Got: ' + session.getValue('total_seats')
                );
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_session_cancelled_on_reservation_cancel'],
        name: '[TOCC][SESSION] Session cancelled when reservation is cancelled',
        description: 'Cancelling a reservation must cascade and cancel the linked training session.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_session_cancel_script'],
            script: `
                function assertTrue(condition, message) {
                    if (!condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }
                function assertFalse(condition, message) {
                    if (condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('room_name', 'ATF-Room-CXL2');
                room.setValue('room_code', 'ATF-ROOM-' + gs.generateGUID().substring(0, 8));
                room.setValue('capacity', 15);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'active');
                var roomId = room.insert();

                var course = new GlideRecord('x_783010_tocc_a1_course');
                course.initialize();
                course.setValue('course_name', 'ATF Course CXL2');
                course.setValue('course_id', 'ATF-COURSE-' + gs.generateGUID().substring(0, 8));
                course.setValue('description', 'ATF fixture course for cancellation cascade');
                course.setValue('duration_hours', 8);
                course.setValue('delivery_category', 'in_person');
                course.setValue('status', 'active');
                var courseId = course.insert();

                // Create approved reservation â†’ session auto-created
                var reservation = new GlideRecord('x_783010_tocc_a1_room_reservation');
                reservation.initialize();
                reservation.setValue('tocc_course', courseId);
                reservation.setValue('tocc_room', roomId);
                reservation.setValue('tocc_instructor', gs.getUserID());
                reservation.setValue('start_datetime', '2037-04-01 09:00:00');
                reservation.setValue('end_datetime', '2037-04-01 11:00:00');
                reservation.setValue('expected_participants', 10);
                reservation.setValue('status', 'approved');
                reservation.setValue('short_description', 'ATF reservation CXL2');
                var reservationId = reservation.insert();

                // Confirm session was created
                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.addQuery('tocc_reservation', reservationId);
                session.setLimit(1);
                session.query();
                assertTrue(session.next(), 'Session not found after reservation approval.');
                var sessionId = session.getUniqueValue();

                // Now cancel the reservation
                var res = new GlideRecord('x_783010_tocc_a1_room_reservation');
                res.get(reservationId);
                res.setValue('status', 'cancelled');
                res.setValue('short_description', 'ATF cancel cascade test');
                res.setWorkflow(true);
                res.update();

                // Session should be cancelled
                var sess = new GlideRecord('x_783010_tocc_a1_training_session');
                sess.get(sessionId);
                assertTrue(
                    sess.getValue('status') === 'cancelled',
                    'Session should be cancelled after reservation cancellation. Got: ' + sess.getValue('status')
                );
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_session_status_full_when_no_seats'],
        name: '[TOCC][SESSION] Session status updates to Full when available_seats = 0',
        description: 'Session must automatically transition to Full status when all seats are taken.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_session_full_status_script'],
            script: `
                function assertTrue(condition, message) {
                    if (!condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }
                function assertFalse(condition, message) {
                    if (condition) {
                        throw new Error(message || 'Assertion failed');
                    }
                }                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('room_name', 'ATF-Room-FULL2');
                room.setValue('room_code', 'ATF-ROOM-' + gs.generateGUID().substring(0, 8));
                room.setValue('capacity', 1);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'active');
                var roomId = room.insert();

                var course = new GlideRecord('x_783010_tocc_a1_course');
                course.initialize();
                course.setValue('course_name', 'ATF Course FULL2');
                course.setValue('course_id', 'ATF-COURSE-' + gs.generateGUID().substring(0, 8));
                course.setValue('description', 'ATF fixture course for full-session status');
                course.setValue('duration_hours', 8);
                course.setValue('delivery_category', 'in_person');
                course.setValue('status', 'active');
                var courseId = course.insert();

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.initialize();
                session.setValue('title', 'ATF Session FULL2');
                session.setValue('tocc_course', courseId);
                session.setValue('room', roomId);
                session.setValue('tocc_instructor', gs.getUserID());
                session.setValue('start_datetime', '2037-05-01 09:00:00');
                session.setValue('end_datetime', '2037-05-01 11:00:00');
                session.setValue('total_seats', 1);
                session.setValue('available_seats', 1);
                session.setValue('status', 'open');
                session.setValue('active', true);
                var sessionId = session.insert();

                var userH = new GlideRecord('sys_user');
                userH.initialize(); userH.setValue('user_name', 'atf_user_' + gs.generateGUID().substring(0, 8)); userH.setValue('first_name', 'ATF'); userH.setValue('last_name', 'H');
                var userHId = userH.insert();
                var studentH = new GlideRecord('x_783010_tocc_a1_student');
                studentH.initialize(); studentH.setValue('user', userHId); studentH.setValue('active', true);
                var studentHId = studentH.insert();

                var svc = new x_783010_tocc_a1.EnrollmentService();
                var enResult = svc.enroll(studentHId, sessionId);
                if (enResult.status === 'pending') { svc.approve(enResult.enrollmentId); }

                // Session should now be Full
                var sess = new GlideRecord('x_783010_tocc_a1_training_session');
                sess.get(sessionId);
                assertTrue(
                    sess.getValue('status') === 'full',
                    'Session should be Full when available_seats = 0. Got: ' + sess.getValue('status')
                );
            `,
        })
    }
)
