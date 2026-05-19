import { Test } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// GROUP: Attendance workflow
// TEST-032 to TEST-034
// ---------------------------------------------------------------------------

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_attendance_present_stamps_metadata'],
        name: '[TOCC][ATTENDANCE] Mark present stamps check-in metadata',
        description:
            'When attendance status changes to present, checked_by, checked_in_datetime, recorded_by, and recorded_at must be populated.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_attendance_present_script'],
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
                room.setValue('room_name', 'ATF-Room-ATT-PRESENT');
                room.setValue('room_code', 'ATF-ATT-P1-' + gs.generateGUID().substring(0, 8));
                room.setValue('capacity', 10);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'active');
                var roomId = room.insert();

                var course = new GlideRecord('x_783010_tocc_a1_course');
                course.initialize();
                course.setValue('course_id', 'ATF-ATT-C1-' + gs.generateGUID().substring(0, 8));
                course.setValue('course_name', 'ATF Attendance Course 1');
                course.setValue('description', 'ATF attendance fixture course');
                course.setValue('duration_hours', 2);
                course.setValue('delivery_category', 'in_person');
                course.setValue('status', 'active');
                var courseId = course.insert();

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.initialize();
                session.setValue('title', 'ATF Attendance Present');
                session.setValue('room', roomId);
                session.setValue('tocc_course', courseId);
                session.setValue('tocc_instructor', gs.getUserID());
                session.setValue('start_datetime', '2040-01-10 09:00:00');
                session.setValue('end_datetime', '2040-01-10 11:00:00');
                session.setValue('total_seats', 10);
                session.setValue('available_seats', 10);
                session.setValue('status', 'in_progress');
                session.setValue('active', true);
                var sessionId = session.insert();

                var user = new GlideRecord('sys_user');
                user.initialize();
                user.setValue('user_name', 'atf_att_present_user_' + gs.generateGUID().substring(0, 8));
                user.setValue('first_name', 'ATF');
                user.setValue('last_name', 'ATT-P');
                var userId = user.insert();

                var student = new GlideRecord('x_783010_tocc_a1_student');
                student.initialize();
                student.setValue('user', userId);
                student.setValue('active', true);
                var studentId = student.insert();

                var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                enrollment.initialize();
                enrollment.setValue('tocc_student', studentId);
                enrollment.setValue('tocc_training_session', sessionId);
                enrollment.setValue('status', 'approved');
                var enrollmentId = enrollment.insert();

                var attendance = new GlideRecord('x_783010_tocc_a1_attendance');
                attendance.initialize();
                attendance.setValue('training_session', sessionId);
                attendance.setValue('enrollment', enrollmentId);
                attendance.setValue('attendance_status', 'pending');
                var attendanceId = attendance.insert();

                var mark = new GlideRecord('x_783010_tocc_a1_attendance');
                mark.get(attendanceId);
                mark.setValue('attendance_status', 'present');
                mark.update();

                var check = new GlideRecord('x_783010_tocc_a1_attendance');
                check.get(attendanceId);

                assertTrue(check.getValue('attendance_status') === 'present', 'Expected status present');
                assertTrue(!gs.nil(check.getValue('checked_by')), 'checked_by should be stamped');
                assertTrue(!gs.nil(check.getValue('checked_in_datetime')), 'checked_in_datetime should be stamped');
                assertTrue(!gs.nil(check.getValue('recorded_by')), 'recorded_by should be stamped');
                assertTrue(!gs.nil(check.getValue('recorded_at')), 'recorded_at should be stamped');
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_attendance_blocked_when_not_started'],
        name: '[TOCC][ATTENDANCE] Marking blocked before session starts',
        description: 'Attendance cannot be marked while the linked session is not In Progress or Completed.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_attendance_blocked_script'],
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
                room.setValue('room_name', 'ATF-Room-ATT-BLOCK');
                room.setValue('room_code', 'ATF-ATT-B1-' + gs.generateGUID().substring(0, 8));
                room.setValue('capacity', 10);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'active');
                var roomId = room.insert();

                var course = new GlideRecord('x_783010_tocc_a1_course');
                course.initialize();
                course.setValue('course_id', 'ATF-ATT-C2-' + gs.generateGUID().substring(0, 8));
                course.setValue('course_name', 'ATF Attendance Course 2');
                course.setValue('description', 'ATF attendance fixture course');
                course.setValue('duration_hours', 2);
                course.setValue('delivery_category', 'in_person');
                course.setValue('status', 'active');
                var courseId = course.insert();

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.initialize();
                session.setValue('title', 'ATF Attendance Block');
                session.setValue('room', roomId);
                session.setValue('tocc_course', courseId);
                session.setValue('tocc_instructor', gs.getUserID());
                session.setValue('start_datetime', '2040-02-10 09:00:00');
                session.setValue('end_datetime', '2040-02-10 11:00:00');
                session.setValue('total_seats', 10);
                session.setValue('available_seats', 10);
                session.setValue('status', 'open');
                session.setValue('active', true);
                var sessionId = session.insert();

                var user = new GlideRecord('sys_user');
                user.initialize();
                user.setValue('user_name', 'atf_att_block_user_' + gs.generateGUID().substring(0, 8));
                user.setValue('first_name', 'ATF');
                user.setValue('last_name', 'ATT-B');
                var userId = user.insert();

                var student = new GlideRecord('x_783010_tocc_a1_student');
                student.initialize();
                student.setValue('user', userId);
                student.setValue('active', true);
                var studentId = student.insert();

                var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                enrollment.initialize();
                enrollment.setValue('tocc_student', studentId);
                enrollment.setValue('tocc_training_session', sessionId);
                enrollment.setValue('status', 'approved');
                var enrollmentId = enrollment.insert();

                var attendance = new GlideRecord('x_783010_tocc_a1_attendance');
                attendance.initialize();
                attendance.setValue('training_session', sessionId);
                attendance.setValue('enrollment', enrollmentId);
                attendance.setValue('attendance_status', 'pending');
                var attendanceId = attendance.insert();

                var mark = new GlideRecord('x_783010_tocc_a1_attendance');
                mark.get(attendanceId);
                mark.setValue('attendance_status', 'present');
                mark.update();

                var check = new GlideRecord('x_783010_tocc_a1_attendance');
                check.get(attendanceId);
                assertTrue(
                    check.getValue('attendance_status') === 'pending',
                    'Attendance should remain pending when session status is open'
                );
            `,
        })
    }
)

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_attendance_absent_clears_checkin'],
        name: '[TOCC][ATTENDANCE] Mark absent clears check-in timestamp',
        description: 'Changing attendance from present to absent should clear checked_in_datetime.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_attendance_absent_script'],
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
                room.setValue('room_name', 'ATF-Room-ATT-ABS');
                room.setValue('room_code', 'ATF-ATT-A1-' + gs.generateGUID().substring(0, 8));
                room.setValue('capacity', 10);
                room.setValue('room_type', 'classroom');
                room.setValue('status', 'active');
                var roomId = room.insert();

                var course = new GlideRecord('x_783010_tocc_a1_course');
                course.initialize();
                course.setValue('course_id', 'ATF-ATT-C3-' + gs.generateGUID().substring(0, 8));
                course.setValue('course_name', 'ATF Attendance Course 3');
                course.setValue('description', 'ATF attendance fixture course');
                course.setValue('duration_hours', 2);
                course.setValue('delivery_category', 'in_person');
                course.setValue('status', 'active');
                var courseId = course.insert();

                var session = new GlideRecord('x_783010_tocc_a1_training_session');
                session.initialize();
                session.setValue('title', 'ATF Attendance Absent');
                session.setValue('room', roomId);
                session.setValue('tocc_course', courseId);
                session.setValue('tocc_instructor', gs.getUserID());
                session.setValue('start_datetime', '2040-03-10 09:00:00');
                session.setValue('end_datetime', '2040-03-10 11:00:00');
                session.setValue('total_seats', 10);
                session.setValue('available_seats', 10);
                session.setValue('status', 'completed');
                session.setValue('active', true);
                var sessionId = session.insert();

                var user = new GlideRecord('sys_user');
                user.initialize();
                user.setValue('user_name', 'atf_att_abs_user_' + gs.generateGUID().substring(0, 8));
                user.setValue('first_name', 'ATF');
                user.setValue('last_name', 'ATT-A');
                var userId = user.insert();

                var student = new GlideRecord('x_783010_tocc_a1_student');
                student.initialize();
                student.setValue('user', userId);
                student.setValue('active', true);
                var studentId = student.insert();

                var enrollment = new GlideRecord('x_783010_tocc_a1_student_enrollment');
                enrollment.initialize();
                enrollment.setValue('tocc_student', studentId);
                enrollment.setValue('tocc_training_session', sessionId);
                enrollment.setValue('status', 'approved');
                var enrollmentId = enrollment.insert();

                var attendance = new GlideRecord('x_783010_tocc_a1_attendance');
                attendance.initialize();
                attendance.setValue('training_session', sessionId);
                attendance.setValue('enrollment', enrollmentId);
                attendance.setValue('attendance_status', 'pending');
                var attendanceId = attendance.insert();

                var markPresent = new GlideRecord('x_783010_tocc_a1_attendance');
                markPresent.get(attendanceId);
                markPresent.setValue('attendance_status', 'present');
                markPresent.update();

                var markAbsent = new GlideRecord('x_783010_tocc_a1_attendance');
                markAbsent.get(attendanceId);
                markAbsent.setValue('attendance_status', 'absent');
                markAbsent.update();

                var check = new GlideRecord('x_783010_tocc_a1_attendance');
                check.get(attendanceId);
                assertTrue(check.getValue('attendance_status') === 'absent', 'Expected status absent');
                assertTrue(
                    gs.nil(check.getValue('checked_in_datetime')),
                    'checked_in_datetime should be cleared when status is absent'
                );
            `,
        })
    }
)
