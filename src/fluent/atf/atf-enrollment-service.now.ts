import { Test } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// GROUP: EnrollmentService
// TEST-013 to TEST-020
// ---------------------------------------------------------------------------

// Shared helper: creates a room + course + session ready for enrollment tests.
// Returns { roomId, courseId, sessionId, instructorUserId }
// We can't share variables across Test() calls directly, so each test that
// needs pre-existing data creates its own isolated fixtures.

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_enroll_duplicate_blocked'],
        name: '[TOCC][ENROLL] Duplicate enrollment is blocked',
        description: 'A student cannot enroll twice in the same training session.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_enroll_dup_fixtures'],
            script: `
                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('room_name', 'ATF-Room-DUP');
                room.setValue('room_code', 'ATF-ROOM-' + gs.generateGUID().substring(0, 8));
                room.setValue('capacity', 20);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'active');
                var roomId = room.insert();

                var course = new GlideRecord('x_783010_tocc_a1_course');
                course.initialize();
                course.setValue('course_name', 'ATF Course DUP');
                course.setValue('course_id', 'ATF-COURSE-' + gs.generateGUID().substring(0, 8));
                course.setValue('description', 'ATF fixture course for duplicate enrollment');
                course.setValue('duration_hours', 8);
                course.setValue('delivery_category', 'in_person');
                course.setValue('status', 'active');
                var courseId = course.insert();

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.initialize();
                session.setValue('title', 'ATF Session DUP');
                session.setValue('tocc_course', courseId);
                session.setValue('room', roomId);
                session.setValue('tocc_instructor', gs.getUserID());
                session.setValue('start_datetime', '2036-01-10 09:00:00');
                session.setValue('end_datetime', '2036-01-10 11:00:00');
                session.setValue('total_seats', 10);
                session.setValue('available_seats', 10);
                session.setValue('status', 'open');
                session.setValue('active', true);
                var sessionId = session.insert();

                var student = new GlideRecord('x_783010_tocc_a1_student');
                student.initialize();
                student.setValue('user', gs.getUserID());
                student.setValue('active', true);
                var studentId = student.insert();

                gs.info('ATF_FIXTURES:' + JSON.stringify({ roomId: roomId, courseId: courseId, sessionId: sessionId, studentId: studentId }));
            `,
        })

        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_enroll_dup_test'],
            script: `
                // Find the session and student created above
                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.addQuery('title', 'ATF Session DUP');
                session.setLimit(1);
                session.query();
                if (!session.next()) { gs.assertTrue(false, 'ATF session not found'); }

                var student = new GlideRecord('x_783010_tocc_a1_student');
                student.addQuery('user', gs.getUserID());
                student.setLimit(1);
                student.query();
                if (!student.next()) { gs.assertTrue(false, 'ATF student not found'); }

                var svc = new x_783010_tocc_a1.EnrollmentService();

                function enrollViaInsert(studentId, sessionId) {
                    if (!studentId || !sessionId) {
                        return { success: false, message: 'Student and Training Session are required.' };
                    }

                    var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                    enrollment.initialize();
                    enrollment.setValue('tocc_student', studentId);
                    enrollment.setValue('tocc_training_session', sessionId);
                    enrollment.setValue('status', 'pending');

                    var enrollmentId = enrollment.insert();
                    if (!enrollmentId) {
                        var insertMessage = '';
                        try {
                            insertMessage = enrollment.getLastErrorMessage() || '';
                        } catch (e) {
                            insertMessage = '';
                        }
                        return {
                            success: false,
                            message: insertMessage || 'Enrollment could not be created.',
                        };
                    }

                    var status = 'pending';
                    if (enrollment.get(enrollmentId)) {
                        status = enrollment.getValue('status') || 'pending';
                    }

                    return {
                        success: true,
                        enrollmentId: enrollmentId,
                        status: status,
                    };
                }

                // First enrollment â€” should succeed
                var result1 = enrollViaInsert(student.getUniqueValue(), session.getUniqueValue());
                gs.assertTrue(result1.success === true, 'First enrollment should succeed. Got: ' + JSON.stringify(result1));

                // Second enrollment â€” must be blocked as duplicate
                var result2 = enrollViaInsert(student.getUniqueValue(), session.getUniqueValue());
                gs.assertTrue(result2.success === false, 'Duplicate enrollment should be blocked. Got: ' + JSON.stringify(result2));
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_enroll_cancelled_session_blocked'],
        name: '[TOCC][ENROLL] Enrollment in cancelled session is blocked',
        description: 'Students cannot enroll in cancelled or inactive sessions.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_enroll_cancelled_script'],
            script: `
                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('room_name', 'ATF-Room-CANCEL');
                room.setValue('room_code', 'ATF-ROOM-' + gs.generateGUID().substring(0, 8));
                room.setValue('capacity', 20);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'active');
                var roomId = room.insert();

                var course = new GlideRecord('x_783010_tocc_a1_course');
                course.initialize();
                course.setValue('course_name', 'ATF Course CANCELLED');
                course.setValue('course_id', 'ATF-COURSE-' + gs.generateGUID().substring(0, 8));
                course.setValue('description', 'ATF fixture course for cancelled session enrollment');
                course.setValue('duration_hours', 8);
                course.setValue('delivery_category', 'in_person');
                course.setValue('status', 'active');
                var courseId = course.insert();

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.initialize();
                session.setValue('title', 'ATF Session CANCELLED');
                session.setValue('tocc_course', courseId);
                session.setValue('room', roomId);
                session.setValue('tocc_instructor', gs.getUserID());
                session.setValue('start_datetime', '2036-02-01 09:00:00');
                session.setValue('end_datetime', '2036-02-01 11:00:00');
                session.setValue('total_seats', 10);
                session.setValue('available_seats', 10);
                session.setValue('status', 'cancelled');
                session.setValue('active', true);
                var sessionId = session.insert();

                var student = new GlideRecord('x_783010_tocc_a1_student');
                student.addQuery('user', gs.getUserID());
                student.setLimit(1);
                student.query();
                if (!student.next()) {
                    student.initialize();
                    student.setValue('user', gs.getUserID());
                    student.setValue('active', true);
                    student.insert();
                    student.query();
                    student.next();
                }

                var svc = new x_783010_tocc_a1.EnrollmentService();

                function enrollViaInsert(studentId, sessionId) {
                    if (!studentId || !sessionId) {
                        return { success: false, message: 'Student and Training Session are required.' };
                    }

                    var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                    enrollment.initialize();
                    enrollment.setValue('tocc_student', studentId);
                    enrollment.setValue('tocc_training_session', sessionId);
                    enrollment.setValue('status', 'pending');

                    var enrollmentId = enrollment.insert();
                    if (!enrollmentId) {
                        var insertMessage = '';
                        try {
                            insertMessage = enrollment.getLastErrorMessage() || '';
                        } catch (e) {
                            insertMessage = '';
                        }
                        return {
                            success: false,
                            message: insertMessage || 'Enrollment could not be created.',
                        };
                    }

                    var status = 'pending';
                    if (enrollment.get(enrollmentId)) {
                        status = enrollment.getValue('status') || 'pending';
                    }

                    return {
                        success: true,
                        enrollmentId: enrollmentId,
                        status: status,
                    };
                }
                var result = enrollViaInsert(student.getUniqueValue(), sessionId);
                gs.assertTrue(result.success === false, 'Enroll in cancelled session should fail. Got: ' + JSON.stringify(result));
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_enroll_full_goes_to_waitlist'],
        name: '[TOCC][ENROLL] Full session enrollment creates waitlist record (mode: waitlist)',
        description: 'When a session is full and mode=waitlist, student gets waitlist status.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_enroll_waitlist_script'],
            script: `
                // Ensure waitlist_mode = waitlist
                var cfg = new GlideRecord('x_783010_tocc_a1_training_config');
                cfg.addQuery('name', 'waitlist_mode');
                cfg.setLimit(1);
                cfg.query();
                if (cfg.next()) {
                    cfg.setValue('value', 'waitlist');
                    cfg.update();
                }

                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('room_name', 'ATF-Room-WL');
                room.setValue('room_code', 'ATF-ROOM-' + gs.generateGUID().substring(0, 8));
                room.setValue('capacity', 1);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'active');
                var roomId = room.insert();

                var course = new GlideRecord('x_783010_tocc_a1_course');
                course.initialize();
                course.setValue('course_name', 'ATF Course WL');
                course.setValue('course_id', 'ATF-COURSE-' + gs.generateGUID().substring(0, 8));
                course.setValue('description', 'ATF fixture course for waitlist scenario');
                course.setValue('duration_hours', 8);
                course.setValue('delivery_category', 'in_person');
                course.setValue('status', 'active');
                var courseId = course.insert();

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.initialize();
                session.setValue('title', 'ATF Session FULL-WL');
                session.setValue('tocc_course', courseId);
                session.setValue('room', roomId);
                session.setValue('tocc_instructor', gs.getUserID());
                session.setValue('start_datetime', '2036-03-01 09:00:00');
                session.setValue('end_datetime', '2036-03-01 11:00:00');
                session.setValue('total_seats', 1);
                session.setValue('available_seats', 0);
                session.setValue('status', 'full');
                session.setValue('active', true);
                var sessionId = session.insert();

                // Create two different students
                var userA = new GlideRecord('sys_user');
                userA.initialize();
                userA.setValue('user_name', 'atf_user_' + gs.generateGUID().substring(0, 8));
                userA.setValue('first_name', 'ATF');
                userA.setValue('last_name', 'WL-A');
                var userAId = userA.insert();

                var studentA = new GlideRecord('x_783010_tocc_a1_student');
                studentA.initialize();
                studentA.setValue('user', userAId);
                studentA.setValue('active', true);
                var studentAId = studentA.insert();

                var svc = new x_783010_tocc_a1.EnrollmentService();

                function enrollViaInsert(studentId, sessionId) {
                    if (!studentId || !sessionId) {
                        return { success: false, message: 'Student and Training Session are required.' };
                    }

                    var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                    enrollment.initialize();
                    enrollment.setValue('tocc_student', studentId);
                    enrollment.setValue('tocc_training_session', sessionId);
                    enrollment.setValue('status', 'pending');

                    var enrollmentId = enrollment.insert();
                    if (!enrollmentId) {
                        var insertMessage = '';
                        try {
                            insertMessage = enrollment.getLastErrorMessage() || '';
                        } catch (e) {
                            insertMessage = '';
                        }
                        return {
                            success: false,
                            message: insertMessage || 'Enrollment could not be created.',
                        };
                    }

                    var status = 'pending';
                    if (enrollment.get(enrollmentId)) {
                        status = enrollment.getValue('status') || 'pending';
                    }

                    return {
                        success: true,
                        enrollmentId: enrollmentId,
                        status: status,
                    };
                }
                var result = enrollViaInsert(studentAId, sessionId);

                gs.assertTrue(result.success === true, 'Waitlist enrollment should succeed. Got: ' + JSON.stringify(result));
                gs.assertTrue(result.status === 'waitlisted', 'Status should be waitlisted. Got: ' + result.status);
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_enroll_full_blocked_mode_block'],
        name: '[TOCC][ENROLL] Full session enrollment blocked (mode: block)',
        description: 'When mode=block and session is full, enrollment must be rejected entirely.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_enroll_block_mode_script'],
            script: `
                // Temporarily set waitlist_mode = block
                var cfg = new GlideRecord('x_783010_tocc_a1_training_config');
                cfg.addQuery('name', 'waitlist_mode');
                cfg.setLimit(1);
                cfg.query();
                if (cfg.next()) {
                    cfg.setValue('value', 'block');
                    cfg.update();
                }

                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('room_name', 'ATF-Room-BLK');
                room.setValue('room_code', 'ATF-ROOM-' + gs.generateGUID().substring(0, 8));
                room.setValue('capacity', 1);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'active');
                var roomId = room.insert();

                var course = new GlideRecord('x_783010_tocc_a1_course');
                course.initialize();
                course.setValue('course_name', 'ATF Course BLK');
                course.setValue('course_id', 'ATF-COURSE-' + gs.generateGUID().substring(0, 8));
                course.setValue('description', 'ATF fixture course for block mode scenario');
                course.setValue('duration_hours', 8);
                course.setValue('delivery_category', 'in_person');
                course.setValue('status', 'active');
                var courseId = course.insert();

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.initialize();
                session.setValue('title', 'ATF Session FULL-BLK');
                session.setValue('tocc_course', courseId);
                session.setValue('room', roomId);
                session.setValue('tocc_instructor', gs.getUserID());
                session.setValue('start_datetime', '2036-04-01 09:00:00');
                session.setValue('end_datetime', '2036-04-01 11:00:00');
                session.setValue('total_seats', 1);
                session.setValue('available_seats', 0);
                session.setValue('status', 'full');
                session.setValue('active', true);
                var sessionId = session.insert();

                var userB = new GlideRecord('sys_user');
                userB.initialize();
                userB.setValue('user_name', 'atf_user_' + gs.generateGUID().substring(0, 8));
                userB.setValue('first_name', 'ATF');
                userB.setValue('last_name', 'BLK-B');
                var userBId = userB.insert();

                var studentB = new GlideRecord('x_783010_tocc_a1_student');
                studentB.initialize();
                studentB.setValue('user', userBId);
                studentB.setValue('active', true);
                var studentBId = studentB.insert();

                var svc = new x_783010_tocc_a1.EnrollmentService();

                function enrollViaInsert(studentId, sessionId) {
                    if (!studentId || !sessionId) {
                        return { success: false, message: 'Student and Training Session are required.' };
                    }

                    var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                    enrollment.initialize();
                    enrollment.setValue('tocc_student', studentId);
                    enrollment.setValue('tocc_training_session', sessionId);
                    enrollment.setValue('status', 'pending');

                    var enrollmentId = enrollment.insert();
                    if (!enrollmentId) {
                        var insertMessage = '';
                        try {
                            insertMessage = enrollment.getLastErrorMessage() || '';
                        } catch (e) {
                            insertMessage = '';
                        }
                        return {
                            success: false,
                            message: insertMessage || 'Enrollment could not be created.',
                        };
                    }

                    var status = 'pending';
                    if (enrollment.get(enrollmentId)) {
                        status = enrollment.getValue('status') || 'pending';
                    }

                    return {
                        success: true,
                        enrollmentId: enrollmentId,
                        status: status,
                    };
                }
                var result = enrollViaInsert(studentBId, sessionId);
                gs.assertTrue(result.success === false, 'Block mode should reject full session enrollment. Got: ' + JSON.stringify(result));

                // Restore waitlist_mode
                var restore = new GlideRecord('x_783010_tocc_a1_training_config');
                restore.addQuery('name', 'waitlist_mode');
                restore.setLimit(1);
                restore.query();
                if (restore.next()) { restore.setValue('value', 'waitlist'); restore.update(); }
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_enroll_approval_decrements_seats'],
        name: '[TOCC][ENROLL] Approved enrollment decrements available_seats',
        description: 'When an enrollment is approved, available_seats must decrease by 1.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_enroll_seats_decrement_script'],
            script: `
                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('room_name', 'ATF-Room-SEATS');
                room.setValue('room_code', 'ATF-ROOM-' + gs.generateGUID().substring(0, 8));
                room.setValue('capacity', 10);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'active');
                var roomId = room.insert();

                var course = new GlideRecord('x_783010_tocc_a1_course');
                course.initialize();
                course.setValue('course_name', 'ATF Course SEATS');
                course.setValue('course_id', 'ATF-COURSE-' + gs.generateGUID().substring(0, 8));
                course.setValue('description', 'ATF fixture course for seat decrement scenario');
                course.setValue('duration_hours', 8);
                course.setValue('delivery_category', 'in_person');
                course.setValue('status', 'active');
                var courseId = course.insert();

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.initialize();
                session.setValue('title', 'ATF Session SEATS');
                session.setValue('tocc_course', courseId);
                session.setValue('room', roomId);
                session.setValue('tocc_instructor', gs.getUserID());
                session.setValue('start_datetime', '2036-05-01 09:00:00');
                session.setValue('end_datetime', '2036-05-01 11:00:00');
                session.setValue('total_seats', 10);
                session.setValue('available_seats', 10);
                session.setValue('status', 'open');
                session.setValue('active', true);
                var sessionId = session.insert();

                var userC = new GlideRecord('sys_user');
                userC.initialize();
                userC.setValue('user_name', 'atf_user_' + gs.generateGUID().substring(0, 8));
                userC.setValue('first_name', 'ATF'); userC.setValue('last_name', 'SEATS-C');
                var userCId = userC.insert();

                var studentC = new GlideRecord('x_783010_tocc_a1_student');
                studentC.initialize();
                studentC.setValue('user', userCId);
                studentC.setValue('active', true);
                var studentCId = studentC.insert();

                // Enroll (direct mode) â†’ auto-approved â†’ seats should drop
                var svc = new x_783010_tocc_a1.EnrollmentService();

                function enrollViaInsert(studentId, sessionId) {
                    if (!studentId || !sessionId) {
                        return { success: false, message: 'Student and Training Session are required.' };
                    }

                    var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                    enrollment.initialize();
                    enrollment.setValue('tocc_student', studentId);
                    enrollment.setValue('tocc_training_session', sessionId);
                    enrollment.setValue('status', 'pending');

                    var enrollmentId = enrollment.insert();
                    if (!enrollmentId) {
                        var insertMessage = '';
                        try {
                            insertMessage = enrollment.getLastErrorMessage() || '';
                        } catch (e) {
                            insertMessage = '';
                        }
                        return {
                            success: false,
                            message: insertMessage || 'Enrollment could not be created.',
                        };
                    }

                    var status = 'pending';
                    if (enrollment.get(enrollmentId)) {
                        status = enrollment.getValue('status') || 'pending';
                    }

                    return {
                        success: true,
                        enrollmentId: enrollmentId,
                        status: status,
                    };
                }
                var enResult = enrollViaInsert(studentCId, sessionId);
                gs.assertTrue(enResult.success === true, 'Enrollment failed: ' + JSON.stringify(enResult));

                // Approve if pending
                if (enResult.status === 'pending') {
                    svc.approve(enResult.enrollmentId);
                }

                var sess = new GlideRecord('x_783010_tocc_a1_training_session');
                sess.get(sessionId);
                var seats = parseInt(sess.getValue('available_seats'), 10);
                gs.assertTrue(seats === 9, 'Expected 9 available seats after 1 enrollment, got: ' + seats);
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_enroll_cancel_increments_seats'],
        name: '[TOCC][ENROLL] Cancelled enrollment increments available_seats',
        description: 'Cancelling an approved enrollment must free the seat.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_enroll_cancel_seats_script'],
            script: `
                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('room_name', 'ATF-Room-FREE');
                room.setValue('room_code', 'ATF-ROOM-' + gs.generateGUID().substring(0, 8));
                room.setValue('capacity', 5);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'active');
                var roomId = room.insert();

                var course = new GlideRecord('x_783010_tocc_a1_course');
                course.initialize();
                course.setValue('course_name', 'ATF Course FREE');
                course.setValue('course_id', 'ATF-COURSE-' + gs.generateGUID().substring(0, 8));
                course.setValue('description', 'ATF fixture course for seat release scenario');
                course.setValue('duration_hours', 8);
                course.setValue('delivery_category', 'in_person');
                course.setValue('status', 'active');
                var courseId = course.insert();

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.initialize();
                session.setValue('title', 'ATF Session FREE');
                session.setValue('tocc_course', courseId);
                session.setValue('room', roomId);
                session.setValue('tocc_instructor', gs.getUserID());
                session.setValue('start_datetime', '2037-01-10 09:00:00');
                session.setValue('end_datetime', '2037-01-10 11:00:00');
                session.setValue('total_seats', 5);
                session.setValue('available_seats', 5);
                session.setValue('status', 'open');
                session.setValue('active', true);
                var sessionId = session.insert();

                var userD = new GlideRecord('sys_user');
                userD.initialize();
                userD.setValue('user_name', 'atf_user_' + gs.generateGUID().substring(0, 8));
                userD.setValue('first_name', 'ATF'); userD.setValue('last_name', 'FREE-D');
                var userDId = userD.insert();

                var studentD = new GlideRecord('x_783010_tocc_a1_student');
                studentD.initialize();
                studentD.setValue('user', userDId);
                studentD.setValue('active', true);
                var studentDId = studentD.insert();

                var svc = new x_783010_tocc_a1.EnrollmentService();

                function enrollViaInsert(studentId, sessionId) {
                    if (!studentId || !sessionId) {
                        return { success: false, message: 'Student and Training Session are required.' };
                    }

                    var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                    enrollment.initialize();
                    enrollment.setValue('tocc_student', studentId);
                    enrollment.setValue('tocc_training_session', sessionId);
                    enrollment.setValue('status', 'pending');

                    var enrollmentId = enrollment.insert();
                    if (!enrollmentId) {
                        var insertMessage = '';
                        try {
                            insertMessage = enrollment.getLastErrorMessage() || '';
                        } catch (e) {
                            insertMessage = '';
                        }
                        return {
                            success: false,
                            message: insertMessage || 'Enrollment could not be created.',
                        };
                    }

                    var status = 'pending';
                    if (enrollment.get(enrollmentId)) {
                        status = enrollment.getValue('status') || 'pending';
                    }

                    return {
                        success: true,
                        enrollmentId: enrollmentId,
                        status: status,
                    };
                }
                var enResult = enrollViaInsert(studentDId, sessionId);
                if (enResult.status === 'pending') { svc.approve(enResult.enrollmentId); }

                // Confirm seats dropped
                var sess = new GlideRecord('x_783010_tocc_a1_training_session');
                sess.get(sessionId);
                gs.assertTrue(parseInt(sess.getValue('available_seats'), 10) === 4, 'Seat not decremented before cancel');

                // Now cancel
                svc.cancel(enResult.enrollmentId, 'ATF cancellation test', true);

                sess = new GlideRecord('x_783010_tocc_a1_training_session');
                sess.get(sessionId);
                gs.assertTrue(parseInt(sess.getValue('available_seats'), 10) === 5, 'Expected seat freed after cancel. Got: ' + sess.getValue('available_seats'));
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_enroll_waitlist_promotion'],
        name: '[TOCC][ENROLL] Waitlist promotion fires on seat release',
        description: 'When an approved seat is freed, the next waitlisted student is promoted.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_enroll_promotion_script'],
            script: `
                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('room_name', 'ATF-Room-PROMO');
                room.setValue('room_code', 'ATF-ROOM-' + gs.generateGUID().substring(0, 8));
                room.setValue('capacity', 1);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'active');
                var roomId = room.insert();

                var course = new GlideRecord('x_783010_tocc_a1_course');
                course.initialize();
                course.setValue('course_name', 'ATF Course PROMO');
                course.setValue('course_id', 'ATF-COURSE-' + gs.generateGUID().substring(0, 8));
                course.setValue('description', 'ATF fixture course for waitlist promotion');
                course.setValue('duration_hours', 8);
                course.setValue('delivery_category', 'in_person');
                course.setValue('status', 'active');
                var courseId = course.insert();

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.initialize();
                session.setValue('title', 'ATF Session PROMO');
                session.setValue('tocc_course', courseId);
                session.setValue('room', roomId);
                session.setValue('tocc_instructor', gs.getUserID());
                session.setValue('start_datetime', '2037-02-01 09:00:00');
                session.setValue('end_datetime', '2037-02-01 11:00:00');
                session.setValue('total_seats', 1);
                session.setValue('available_seats', 1);
                session.setValue('status', 'open');
                session.setValue('active', true);
                var sessionId = session.insert();

                // Student E â€” will take the seat
                var userE = new GlideRecord('sys_user');
                userE.initialize(); userE.setValue('user_name', 'atf_user_' + gs.generateGUID().substring(0, 8)); userE.setValue('first_name', 'ATF'); userE.setValue('last_name', 'E');
                var userEId = userE.insert();
                var studentE = new GlideRecord('x_783010_tocc_a1_student');
                studentE.initialize(); studentE.setValue('user', userEId); studentE.setValue('active', true);
                var studentEId = studentE.insert();

                // Student F â€” will be waitlisted
                var userF = new GlideRecord('sys_user');
                userF.initialize(); userF.setValue('user_name', 'atf_user_' + gs.generateGUID().substring(0, 8)); userF.setValue('first_name', 'ATF'); userF.setValue('last_name', 'F');
                var userFId = userF.insert();
                var studentF = new GlideRecord('x_783010_tocc_a1_student');
                studentF.initialize(); studentF.setValue('user', userFId); studentF.setValue('active', true);
                var studentFId = studentF.insert();

                var svc = new x_783010_tocc_a1.EnrollmentService();

                function enrollViaInsert(studentId, sessionId) {
                    if (!studentId || !sessionId) {
                        return { success: false, message: 'Student and Training Session are required.' };
                    }

                    var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                    enrollment.initialize();
                    enrollment.setValue('tocc_student', studentId);
                    enrollment.setValue('tocc_training_session', sessionId);
                    enrollment.setValue('status', 'pending');

                    var enrollmentId = enrollment.insert();
                    if (!enrollmentId) {
                        var insertMessage = '';
                        try {
                            insertMessage = enrollment.getLastErrorMessage() || '';
                        } catch (e) {
                            insertMessage = '';
                        }
                        return {
                            success: false,
                            message: insertMessage || 'Enrollment could not be created.',
                        };
                    }

                    var status = 'pending';
                    if (enrollment.get(enrollmentId)) {
                        status = enrollment.getValue('status') || 'pending';
                    }

                    return {
                        success: true,
                        enrollmentId: enrollmentId,
                        status: status,
                    };
                }

                // E enrolls and gets the seat
                var resE = enrollViaInsert(studentEId, sessionId);
                if (resE.status === 'pending') { svc.approve(resE.enrollmentId); }
                gs.assertTrue(resE.success === true, 'Student E enrollment failed');

                // F enrolls and is waitlisted
                var resF = enrollViaInsert(studentFId, sessionId);
                gs.assertTrue(resF.status === 'waitlisted', 'Student F should be waitlisted. Got: ' + resF.status);

                // E cancels â€” F should be promoted
                svc.cancel(resE.enrollmentId, 'ATF promotion test', true);

                var enrollF = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                enrollF.get(resF.enrollmentId);
                gs.assertTrue(
                    enrollF.getValue('status') === 'approved',
                    'Student F should be promoted to approved after E cancels. Got: ' + enrollF.getValue('status')
                );
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_enroll_late_cancel_blocked'],
        name: '[TOCC][ENROLL] Late cancellation blocked within window',
        description: 'Student cannot cancel within the configured late-cancel window.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_enroll_late_cancel_script'],
            script: `
                var room = new GlideRecord('x_783010_tocc_a1_room');
                room.initialize();
                room.setValue('room_name', 'ATF-Room-LATE');
                room.setValue('room_code', 'ATF-ROOM-' + gs.generateGUID().substring(0, 8));
                room.setValue('capacity', 10);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'active');
                var roomId = room.insert();

                var course = new GlideRecord('x_783010_tocc_a1_course');
                course.initialize();
                course.setValue('course_name', 'ATF Course LATE');
                course.setValue('course_id', 'ATF-COURSE-' + gs.generateGUID().substring(0, 8));
                course.setValue('description', 'ATF fixture course for late cancellation');
                course.setValue('duration_hours', 8);
                course.setValue('delivery_category', 'in_person');
                course.setValue('status', 'active');
                var courseId = course.insert();

                // Session starting in 1 hour â€” well within the 4h late-cancel window
                var start = new GlideDateTime();
                start.addSeconds(3600);
                var end = new GlideDateTime(start.getValue());
                end.addSeconds(3600);

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.initialize();
                session.setValue('title', 'ATF Session LATE');
                session.setValue('tocc_course', courseId);
                session.setValue('room', roomId);
                session.setValue('tocc_instructor', gs.getUserID());
                session.setValue('start_datetime', start.getValue());
                session.setValue('end_datetime', end.getValue());
                session.setValue('total_seats', 10);
                session.setValue('available_seats', 10);
                session.setValue('status', 'open');
                session.setValue('active', true);
                var sessionId = session.insert();

                var userG = new GlideRecord('sys_user');
                userG.initialize(); userG.setValue('user_name', 'atf_user_' + gs.generateGUID().substring(0, 8)); userG.setValue('first_name', 'ATF'); userG.setValue('last_name', 'G');
                var userGId = userG.insert();
                var studentG = new GlideRecord('x_783010_tocc_a1_student');
                studentG.initialize(); studentG.setValue('user', userGId); studentG.setValue('active', true);
                var studentGId = studentG.insert();

                var svc = new x_783010_tocc_a1.EnrollmentService();

                function enrollViaInsert(studentId, sessionId) {
                    if (!studentId || !sessionId) {
                        return { success: false, message: 'Student and Training Session are required.' };
                    }

                    var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                    enrollment.initialize();
                    enrollment.setValue('tocc_student', studentId);
                    enrollment.setValue('tocc_training_session', sessionId);
                    enrollment.setValue('status', 'pending');

                    var enrollmentId = enrollment.insert();
                    if (!enrollmentId) {
                        var insertMessage = '';
                        try {
                            insertMessage = enrollment.getLastErrorMessage() || '';
                        } catch (e) {
                            insertMessage = '';
                        }
                        return {
                            success: false,
                            message: insertMessage || 'Enrollment could not be created.',
                        };
                    }

                    var status = 'pending';
                    if (enrollment.get(enrollmentId)) {
                        status = enrollment.getValue('status') || 'pending';
                    }

                    return {
                        success: true,
                        enrollmentId: enrollmentId,
                        status: status,
                    };
                }
                var enResult = enrollViaInsert(studentGId, sessionId);
                if (enResult.status === 'pending') { svc.approve(enResult.enrollmentId); }

                // isBackoffice = false â†’ should be blocked
                var cancelResult = svc.cancel(enResult.enrollmentId, 'ATF late cancel test', false);
                gs.assertTrue(
                    cancelResult.success === false,
                    'Late cancellation should be blocked for non-backoffice. Got: ' + JSON.stringify(cancelResult)
                );
            `,
        })
    }
)

