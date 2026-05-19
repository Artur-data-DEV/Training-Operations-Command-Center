import { Test } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// GROUP: Operational closure regression coverage
// These tests protect the original end-to-end idea:
// Student browses a publishable session, backoffice approves clean reservations,
// and operational records use the runtime-valid TOCC fields.
// ---------------------------------------------------------------------------

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_operational_fields_valid'],
        name: '[TOCC][CLOSURE] Runtime operational fields are valid',
        description: 'The fields used by portal, backoffice, and services must be valid at GlideRecord runtime.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_operational_fields_valid_script'],
            script: `
                var reservation = new GlideRecord('x_783010_tocc_a1_room_reservation');
                gs.assertTrue(reservation.isValidField('tocc_course'), 'Reservation must expose tocc_course.');
                gs.assertTrue(reservation.isValidField('tocc_room'), 'Reservation must expose tocc_room.');
                gs.assertTrue(reservation.isValidField('tocc_instructor'), 'Reservation must expose tocc_instructor.');
                gs.assertTrue(reservation.isValidField('training_session'), 'Reservation must expose training_session link.');

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                gs.assertTrue(session.isValidField('tocc_course'), 'Session must expose tocc_course.');
                gs.assertTrue(session.isValidField('room'), 'Session must expose room.');
                gs.assertTrue(session.isValidField('tocc_instructor'), 'Session must expose tocc_instructor.');
                gs.assertTrue(session.isValidField('tocc_reservation'), 'Session must expose tocc_reservation.');

                var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                gs.assertTrue(enrollment.isValidField('tocc_student'), 'Enrollment must expose tocc_student.');
                gs.assertTrue(enrollment.isValidField('tocc_training_session'), 'Enrollment must expose tocc_training_session.');
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_approve_reservation_idempotent'],
        name: '[TOCC][CLOSURE] Reservation approval creates one linked session',
        description: 'Approving a clean reservation must create exactly one publishable Training Session and stay idempotent.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_approve_reservation_idempotent_script'],
            script: `
                var suffix = gs.generateGUID().substring(0, 8);

                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('room_name', 'ATF Closure Room ' + suffix);
                room.setValue('room_code', 'ATF-CLOSURE-' + suffix);
                room.setValue('capacity', 20);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'active');
                var roomId = room.insert();
                gs.assertTrue(!!roomId, 'Room fixture must be created.');

                var course = new GlideRecord('x_783010_tocc_a1_course');
                course.initialize();
                course.setValue('course_name', 'ATF Closure Course ' + suffix);
                course.setValue('course_id', 'ATF-CLOSURE-' + suffix);
                course.setValue('description', 'ATF fixture for operational closure approval.');
                course.setValue('duration_hours', 2);
                course.setValue('delivery_category', 'in_person');
                course.setValue('status', 'active');
                var courseId = course.insert();
                gs.assertTrue(!!courseId, 'Course fixture must be created.');

                var reservation = new GlideRecord('x_783010_tocc_a1_room_reservation');
                reservation.initialize();
                reservation.setValue('tocc_course', courseId);
                reservation.setValue('tocc_room', roomId);
                reservation.setValue('tocc_instructor', gs.getUserID());
                reservation.setValue('start_datetime', '2045-02-01 09:00:00');
                reservation.setValue('end_datetime', '2045-02-01 11:00:00');
                reservation.setValue('expected_participants', 11);
                reservation.setValue('status', 'submitted');
                reservation.setValue('short_description', 'ATF closure reservation approval');
                var reservationId = reservation.insert();
                gs.assertTrue(!!reservationId, 'Reservation fixture must be created.');

                reservation.get(reservationId);
                reservation.setValue('status', 'approved');
                reservation.setWorkflow(true);
                reservation.update();

                var sync = new TrainingSessionService();
                sync.syncFromReservation(reservation);
                sync.syncFromReservation(reservation);

                reservation.get(reservationId);
                var linkedSession = reservation.getValue('training_session');
                gs.assertTrue(!!linkedSession, 'Approved reservation must be linked to a session.');

                var count = 0;
                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.addQuery('tocc_reservation', reservationId);
                session.query();
                var sessionId = '';
                while (session.next()) {
                    count++;
                    sessionId = session.getUniqueValue();
                    gs.assertTrue(session.getValue('tocc_course') === courseId, 'Session course must match reservation course.');
                    gs.assertTrue(session.getValue('room') === roomId, 'Session room must match reservation room.');
                    gs.assertTrue(session.getValue('tocc_instructor') === gs.getUserID(), 'Session instructor must match reservation instructor.');
                    gs.assertTrue(parseInt(session.getValue('total_seats'), 10) === 11, 'Session seats must match expected participants.');
                    gs.assertTrue(session.getValue('status') === 'open', 'Approved reservation should create an open session.');
                }

                gs.assertTrue(count === 1, 'Approval sync must create exactly one session. Got: ' + count);
                gs.assertTrue(linkedSession === sessionId, 'Reservation training_session must point to the created session.');
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_student_enrollment_flow'],
        name: '[TOCC][CLOSURE] Student enrollment reserves a seat and blocks duplicate',
        description: 'Student enrollment must use runtime-valid fields, approve in direct mode, decrement seats, and block duplicates.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_student_enrollment_flow_script'],
            script: `
                var suffix = gs.generateGUID().substring(0, 8);

                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('room_name', 'ATF Enrollment Room ' + suffix);
                room.setValue('room_code', 'ATF-ENROLL-' + suffix);
                room.setValue('capacity', 10);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'active');
                var roomId = room.insert();

                var course = new GlideRecord('x_783010_tocc_a1_course');
                course.initialize();
                course.setValue('course_name', 'ATF Enrollment Course ' + suffix);
                course.setValue('course_id', 'ATF-ENROLL-' + suffix);
                course.setValue('description', 'ATF fixture for student enrollment.');
                course.setValue('duration_hours', 2);
                course.setValue('delivery_category', 'in_person');
                course.setValue('status', 'active');
                var courseId = course.insert();

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.initialize();
                session.setValue('title', 'ATF Enrollment Session ' + suffix);
                session.setValue('tocc_course', courseId);
                session.setValue('room', roomId);
                session.setValue('tocc_instructor', gs.getUserID());
                session.setValue('start_datetime', '2045-03-01 09:00:00');
                session.setValue('end_datetime', '2045-03-01 11:00:00');
                session.setValue('total_seats', 2);
                session.setValue('available_seats', 2);
                session.setValue('status', 'open');
                session.setValue('active', true);
                var sessionId = session.insert();
                gs.assertTrue(!!sessionId, 'Session fixture must be created.');

                var student = new GlideRecord('x_783010_tocc_a1_student');
                student.initialize();
                student.setValue('user', gs.getUserID());
                student.setValue('active', true);
                var studentId = student.insert();
                gs.assertTrue(!!studentId, 'Student fixture must be created.');

                var svc = new EnrollmentService();
                var first = svc.enroll(studentId, sessionId);
                gs.assertTrue(first && first.success === true, 'First enrollment must succeed: ' + JSON.stringify(first));
                gs.assertTrue(first.status === 'approved', 'Direct enrollment should be approved. Got: ' + first.status);

                session.get(sessionId);
                gs.assertTrue(parseInt(session.getValue('available_seats'), 10) === 1, 'Available seats should decrement to 1.');

                var second = svc.enroll(studentId, sessionId);
                gs.assertTrue(second && second.success === false, 'Duplicate enrollment must be blocked.');
                gs.assertTrue(String(second.message || '').indexOf('already enrolled') > -1, 'Duplicate message should explain existing enrollment.');
            `,
        })
    }
)

