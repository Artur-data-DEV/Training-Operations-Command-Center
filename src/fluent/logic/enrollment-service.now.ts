import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['x_783010_tocc_a1_script_include_enrollment_service'],
    name: 'EnrollmentService',
    apiName: 'x_783010_tocc_a1.EnrollmentService',
    accessibleFrom: 'package_private',
    clientCallable: false,
    protectionPolicy: 'read',
    script: `var EnrollmentService = Class.create();
EnrollmentService.prototype = {
    initialize: function() {
        this.enrollmentTable = 'x_783010_tocc_a1_student_enrollment';
        this.sessionTable = 'x_783010_tocc_a1_training_session';
        this.config = new TrainingConfigService();
    },

    validateBeforeSave: function(current, previous) {
        var sessionId = current.getValue('training_session');
        var studentId = current.getValue('student');
        var status = current.getValue('status') || 'pending';
        var operation = current.operation() + '';
        var previousStatus = previous ? previous.getValue('status') : '';

        if (!sessionId || !studentId) {
            return 'Student and Training Session are required.';
        }

        if (this._hasDuplicate(sessionId, studentId, current.getUniqueValue())) {
            return 'Student is already enrolled in this training session.';
        }

        var session = this._loadSession(sessionId);
        if (!session) {
            return 'Training Session not found.';
        }

        if (operation == 'update' && status == 'cancelled') {
            if (previousStatus == 'cancelled') {
                return '';
            }

            return this._validateLateCancellation(session);
        }

        if (operation == 'update' && status == 'rejected') {
            return '';
        }

        if (status == 'waitlisted') {
            return '';
        }

        var sessionStatus = session.getValue('status');
        if (sessionStatus == 'cancelled' || sessionStatus == 'completed' || sessionStatus == 'in_progress') {
            return 'Enrollment is not allowed for the current training session status.';
        }

        var seatInfo = this._getSeatInfo(sessionId, current.getUniqueValue(), status);
        if (seatInfo.remainingSeats > 0) {
            if (status == 'pending' && this.config.getEnrollmentApprovalMode() == 'direct') {
                current.setValue('status', 'approved');
            }
            return '';
        }

        var waitlistMode = this.config.getWaitlistMode();
        if (waitlistMode == 'waitlist') {
            current.setValue('status', 'waitlisted');
            return '';
        }

        return 'Training session is full.';
    },

    syncSessionAfterEnrollmentChange: function(sessionId) {
        if (!sessionId) {
            return;
        }

        var session = this._loadSession(sessionId);
        if (!session) {
            return;
        }

        var totalSeats = parseInt(session.getValue('total_seats'), 10) || 0;
        var approvedCount = this._getApprovedCount(sessionId);
        var availableSeats = totalSeats - approvedCount;

        if (availableSeats < 0) {
            availableSeats = 0;
        }

        var currentStatus = session.getValue('status');
        if (availableSeats > 0 && currentStatus != 'cancelled' && currentStatus != 'completed' && currentStatus != 'in_progress') {
            var promoted = this._promoteWaitlistedEnrollments(sessionId, availableSeats);
            if (promoted > 0) {
                approvedCount = approvedCount + promoted;
                availableSeats = totalSeats - approvedCount;
                if (availableSeats < 0) {
                    availableSeats = 0;
                }
            }
        }

        session.setValue('available_seats', availableSeats);

        if (currentStatus != 'cancelled' && currentStatus != 'completed' && currentStatus != 'in_progress') {
            if (availableSeats <= 0) {
                session.setValue('status', 'full');
            } else {
                session.setValue('status', 'open');
            }
        }

        session.setWorkflow(false);
        session.update();
    },

    _getSeatInfo: function(sessionId, currentEnrollmentId, currentStatus) {
        var totalSeats = 0;
        var approvedCount = this._getApprovedCount(sessionId, currentEnrollmentId, currentStatus);
        var session = this._loadSession(sessionId);

        if (session) {
            totalSeats = parseInt(session.getValue('total_seats'), 10) || 0;
        }

        return {
            totalSeats: totalSeats,
            approvedCount: approvedCount,
            remainingSeats: totalSeats - approvedCount
        };
    },

    _hasDuplicate: function(sessionId, studentId, currentEnrollmentId) {
        var duplicate = new GlideRecord(this.enrollmentTable);
        duplicate.addQuery('training_session', sessionId);
        duplicate.addQuery('student', studentId);
        duplicate.addQuery('sys_id', '!=', currentEnrollmentId);
        duplicate.query();
        return duplicate.next();
    },

    _loadSession: function(sessionId) {
        var session = new GlideRecord(this.sessionTable);
        if (!session.get(sessionId)) {
            return null;
        }
        return session;
    },

    _getApprovedCount: function(sessionId, currentEnrollmentId, currentStatus) {
        var count = 0;
        var agg = new GlideAggregate(this.enrollmentTable);
        agg.addQuery('training_session', sessionId);
        agg.addQuery('status', 'approved');

        if (currentEnrollmentId) {
            agg.addQuery('sys_id', '!=', currentEnrollmentId);
        }

        agg.addAggregate('COUNT');
        agg.query();
        if (agg.next()) {
            count = parseInt(agg.getAggregate('COUNT'), 10) || 0;
        }

        if (currentStatus == 'approved') {
            count = count + 1;
        }

        return count;
    },

    _promoteWaitlistedEnrollments: function(sessionId, maxPromotions) {
        if (!sessionId || maxPromotions <= 0) {
            return 0;
        }

        var promoted = 0;
        var waitlisted = new GlideRecord(this.enrollmentTable);
        waitlisted.addQuery('training_session', sessionId);
        waitlisted.addQuery('status', 'waitlisted');
        waitlisted.orderBy('sys_created_on');
        waitlisted.query();

        while (waitlisted.next() && promoted < maxPromotions) {
            waitlisted.setValue('status', 'approved');
            waitlisted.setValue('work_notes', 'Promoted from waitlist after seat became available.');
            waitlisted.setWorkflow(false);
            waitlisted.update();
            promoted = promoted + 1;
        }

        return promoted;
    },

    _validateLateCancellation: function(session) {
        var lateCancellationHours = this.config.getLateCancellationWindowHours();
        if (lateCancellationHours <= 0) {
            return '';
        }

        var sessionStart = session.getValue('start_datetime');
        if (!sessionStart) {
            return '';
        }

        var now = new GlideDateTime();
        var cancellationCutoff = new GlideDateTime(sessionStart);
        cancellationCutoff.addSeconds(-1 * lateCancellationHours * 3600);

        if (now.compareTo(cancellationCutoff) >= 0 && !this._isPrivilegedCancellationUser()) {
            return 'Cancellation is not allowed within ' + lateCancellationHours + ' hours of the session start.';
        }

        return '';
    },

    _isPrivilegedCancellationUser: function() {
        return gs.hasRole('x_783010_tocc_a1.backoffice') || gs.hasRole('x_783010_tocc_a1.admin');
    },

    type: 'EnrollmentService'
};`,
})
