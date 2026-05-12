api.controller = function($scope, spUtil) {
    var c = this;
    c.submitting = {};

    c.isConfirmed = function(value) {
        return value === true || value === 'true' || value === 1 || value === '1';
    };

    c.loadEnrollments = function() {
        var ga = new GlideAjax('x_783010_tocc_a1.PortalApiService');
        ga.addParam('sysparm_name', 'getMyEnrollments');
        ga.getXMLAnswer(function(answer) {
            $scope.$apply(function() {
                try {
                    var parsed = JSON.parse(answer || '{}');
                    if (parsed.success) {
                        c.data.enrollments = parsed.enrollments || [];
                        c.data.count = c.data.enrollments.length;
                        c.data.error = '';
                    } else {
                        c.data.error = parsed.message || 'Unable to load your enrollments.';
                    }
                } catch (error) {
                    c.data.error = 'Unable to load your enrollments.';
                }
            });
        });
    };

    c.confirmAttendance = function(enrollmentId) {
        if (!enrollmentId || c.submitting[enrollmentId]) {
            return;
        }

        c.submitting[enrollmentId] = true;

        var ga = new GlideAjax('x_783010_tocc_a1.PortalApiService');
        ga.addParam('sysparm_name', 'confirmMyAttendance');
        ga.addParam('sysparm_enrollment_id', enrollmentId);
        ga.getXMLAnswer(function(answer) {
            $scope.$apply(function() {
                c.submitting[enrollmentId] = false;

                var parsed;
                try {
                    parsed = JSON.parse(answer || '{}');
                } catch (error) {
                    parsed = {
                        success: false,
                        message: 'Unable to confirm attendance. Try again in a few seconds.',
                    };
                }

                if (parsed.success) {
                    spUtil.addInfoMessage(parsed.message || 'Attendance confirmed successfully.');
                    c.loadEnrollments();
                } else {
                    spUtil.addErrorMessage(parsed.message || 'Unable to confirm attendance.');
                }
            });
        });
    };
};

