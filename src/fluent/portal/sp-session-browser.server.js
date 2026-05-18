(function() {
    function getOrCreateStudentId() {
        var student = new GlideRecord('x_783010_tocc_a1_student');
        student.addQuery('user', gs.getUserID());
        student.addQuery('active', true);
        student.setLimit(1);
        student.query();
        if (student.next()) {
            return student.getUniqueValue();
        }

        if (!(gs.hasRole('x_783010_tocc_a1.student') || gs.hasRole('x_783010_tocc_a1.admin') || gs.hasRole('admin'))) {
            return '';
        }

        var created = new GlideRecord('x_783010_tocc_a1_student');
        created.initialize();
        created.setValue('user', gs.getUserID());
        created.setValue('active', true);
        return created.insert() || '';
    }

    if (input && input.action === 'enroll') {
        var sessionId = String(input.session_id || '').trim();
        if (!sessionId) {
            data.success = false;
            data.message = 'Training session is required.';
            return;
        }

        var studentId = getOrCreateStudentId();
        if (!studentId) {
            data.success = false;
            data.message = 'Student profile not found for the logged-in user.';
            return;
        }

        var enrollmentService = new x_783010_tocc_a1.EnrollmentService();
        var result = enrollmentService.enroll(studentId, sessionId);
        data.success = !!(result && result.success);
        data.message = (result && result.message) || (data.success ? 'Enrollment submitted successfully.' : 'Unable to submit enrollment.');
        data.enrollment_id = (result && result.enrollmentId) || '';
        return;
    }

    data.sessions = [];
    data.count = 0;
    data.error = '';
    data.links = {
        home: '?id=tocc_home',
        my_enrollments: '?id=tocc_my_enrollments',
        my_reservations: '?id=tocc_my_reservations',
    };

    try {
        var service = new x_783010_tocc_a1.PortalApiService();
        var response = JSON.parse(service.getAvailableSessions() || '{}');

        if (!response.success) {
            data.error = response.message || 'Unable to load available sessions.';
            return;
        }

        var sessions = response.sessions || [];
        var maxItems = parseInt(options.max_items, 10);

        if (!isNaN(maxItems) && maxItems > 0 && sessions.length > maxItems) {
            sessions = sessions.slice(0, maxItems);
        }

        data.sessions = sessions;
        data.count = sessions.length;

        data.persona = {
            is_student:
                gs.hasRole('x_783010_tocc_a1.student') ||
                gs.hasRole('x_783010_tocc_a1.admin') ||
                gs.hasRole('admin'),
            is_instructor:
                gs.hasRole('x_783010_tocc_a1.instructor') ||
                gs.hasRole('x_783010_tocc_a1.admin') ||
                gs.hasRole('admin'),
        };
    } catch (error) {
        data.error = 'Unable to load available sessions.';
        gs.warn('[TOCC][SP][SessionBrowser] ' + error.message);
    }
})();
