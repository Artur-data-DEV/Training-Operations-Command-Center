import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['x_783010_tocc_a1_script_include_notification_helper'],
    name: 'NotificationHelper',
    apiName: 'x_783010_tocc_a1.NotificationHelper',
    accessibleFrom: 'package_private',
    clientCallable: false,
    protectionPolicy: 'read',
    script: `var NotificationHelper = Class.create();
NotificationHelper.prototype = {
    initialize: function() {
        this.sessionTable    = 'x_783010_tocc_a1_training_session';
        this.enrollmentTable = 'x_783010_tocc_a1_student_enrollment';
        this.reservationTable = 'x_783010_tocc_a1_room_reservation';
    },

    // -------------------------------------------------------------------------
    // Reservation notifications
    // -------------------------------------------------------------------------

    // Notifies the instructor when a room reservation is approved or rejected.
    sendReservationDecision: function(reservationId) {
        var reservation = new GlideRecord(this.reservationTable);
        if (!reservation.get(reservationId)) {
            gs.warn('NotificationHelper.sendReservationDecision: reservation not found ' + reservationId);
            return;
        }

        var status = reservation.getValue('status');
        var eventName = (status === 'approved')
            ? 'x_783010_tocc_a1.reservation.approved'
            : 'x_783010_tocc_a1.reservation.rejected';

        gs.eventQueue(eventName, reservation, reservation.getDisplayValue('number'), gs.getUserID());
    },

    // Notifies the instructor confirming that their reservation request was received.
    sendReservationSubmitted: function(reservationId) {
        var reservation = new GlideRecord(this.reservationTable);
        if (!reservation.get(reservationId)) {
            return;
        }
        gs.eventQueue(
            'x_783010_tocc_a1.reservation.submitted',
            reservation,
            reservation.getDisplayValue('number'),
            gs.getUserID()
        );
    },

    // -------------------------------------------------------------------------
    // Enrollment notifications
    // -------------------------------------------------------------------------

    // Notifies the student when their enrollment status changes.
    sendEnrollmentDecision: function(enrollmentId) {
        var enrollment = new GlideRecord(this.enrollmentTable);
        if (!enrollment.get(enrollmentId)) {
            gs.warn('NotificationHelper.sendEnrollmentDecision: enrollment not found ' + enrollmentId);
            return;
        }

        var status = enrollment.getValue('status');
        var eventMap = {
            approved:   'x_783010_tocc_a1.enrollment.approved',
            rejected:   'x_783010_tocc_a1.enrollment.rejected',
            waitlisted: 'x_783010_tocc_a1.enrollment.waitlisted',
            cancelled:  'x_783010_tocc_a1.enrollment.cancelled',
        };

        var eventName = eventMap[status];
        if (!eventName) {
            return;
        }

        gs.eventQueue(eventName, enrollment, enrollment.getDisplayValue('number'), gs.getUserID());
    },

    // Notifies a waitlisted student that they have been promoted to approved.
    sendWaitlistPromotion: function(enrollmentId) {
        var enrollment = new GlideRecord(this.enrollmentTable);
        if (!enrollment.get(enrollmentId)) {
            return;
        }
        gs.eventQueue(
            'x_783010_tocc_a1.enrollment.waitlist_promoted',
            enrollment,
            enrollment.getDisplayValue('number'),
            gs.getUserID()
        );
    },

    // -------------------------------------------------------------------------
    // Session notifications
    // -------------------------------------------------------------------------

    // Sends a reminder to all approved enrolled students 24h (configurable) before the session.
    sendSessionReminders: function(sessionId) {
        var session = new GlideRecord(this.sessionTable);
        if (!session.get(sessionId)) {
            return;
        }

        var enrollment = new GlideRecord(this.enrollmentTable);
        enrollment.addQuery('tocc_training_session', sessionId);
        enrollment.addQuery('status', 'approved');
        enrollment.query();

        while (enrollment.next()) {
            gs.eventQueue(
                'x_783010_tocc_a1.session.reminder',
                enrollment,
                session.getDisplayValue('number'),
                gs.getUserID()
            );
        }
    },

    // Requests attendance confirmation from all approved enrolled students.
    sendConfirmationRequests: function(sessionId) {
        var session = new GlideRecord(this.sessionTable);
        if (!session.get(sessionId)) {
            return;
        }

        var enrollment = new GlideRecord(this.enrollmentTable);
        enrollment.addQuery('tocc_training_session', sessionId);
        enrollment.addQuery('status', 'approved');
        enrollment.addQuery('confirmed', false);
        enrollment.query();

        while (enrollment.next()) {
            gs.eventQueue(
                'x_783010_tocc_a1.session.confirmation_request',
                enrollment,
                session.getDisplayValue('number'),
                gs.getUserID()
            );
        }
    },

    // Notifies all approved enrolled students that the session was cancelled.
    sendSessionCancelled: function(sessionId) {
        var session = new GlideRecord(this.sessionTable);
        if (!session.get(sessionId)) {
            return;
        }

        var enrollment = new GlideRecord(this.enrollmentTable);
        enrollment.addQuery('tocc_training_session', sessionId);
        enrollment.addQuery('status', 'approved');
        enrollment.query();

        while (enrollment.next()) {
            gs.eventQueue(
                'x_783010_tocc_a1.session.cancelled',
                enrollment,
                session.getDisplayValue('number'),
                gs.getUserID()
            );
        }
    },

    // Sends feedback request to all attended students after session completion.
    sendFeedbackRequests: function(sessionId) {
        var session = new GlideRecord(this.sessionTable);
        if (!session.get(sessionId)) {
            return;
        }

        var enrollment = new GlideRecord(this.enrollmentTable);
        enrollment.addQuery('tocc_training_session', sessionId);
        enrollment.addQuery('status', 'approved');
        enrollment.query();

        while (enrollment.next()) {
            gs.eventQueue(
                'x_783010_tocc_a1.session.feedback_request',
                enrollment,
                session.getDisplayValue('number'),
                gs.getUserID()
            );
        }
    },

    type: 'NotificationHelper'
};`,
})
