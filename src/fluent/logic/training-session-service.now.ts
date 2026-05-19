import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['x_783010_tocc_a1_script_include_training_session_service'],
    name: 'TrainingSessionService',
    apiName: 'x_783010_tocc_a1.TrainingSessionService',
    accessibleFrom: 'package_private',
    clientCallable: false,
    protectionPolicy: 'read',
    script: `var TrainingSessionService = Class.create();
TrainingSessionService.prototype = {
    initialize: function() {
        this.sessionTable = 'x_783010_tocc_a1_training_session';
        this.reservationTable = 'x_783010_tocc_a1_room_reservation';
        this.config = new TrainingConfigService();
    },

    syncFromReservation: function(current) {
        var reservationStatus = current.getValue('status');
        var sessionId = current.getValue('training_session');

        if (reservationStatus == 'cancelled' || reservationStatus == 'rejected') {
            if (sessionId) {
                this._cancelSession(sessionId, current.getValue('number'));
            }
            return;
        }

        if (reservationStatus != 'approved') {
            return;
        }

        if (!sessionId) {
            sessionId = this._findSessionForReservation(current.getUniqueValue());
            if (sessionId) {
                this._linkReservationToSession(current.getUniqueValue(), sessionId);
                this._updateSessionFromReservation(sessionId, current);
                return;
            }

            sessionId = this._createSession(current);
            if (!sessionId) {
                gs.error('Failed to create Training Session for reservation ' + current.getValue('number'));
                return;
            }

            this._linkReservationToSession(current.getUniqueValue(), sessionId);
            return;
        }

        this._updateSessionFromReservation(sessionId, current);
    },

    _findSessionForReservation: function(reservationId) {
        if (!reservationId) {
            return '';
        }

        var session = new GlideRecord(this.sessionTable);
        session.addQuery('tocc_reservation', reservationId);
        session.addQuery('status', '!=', 'cancelled');
        session.orderByDesc('sys_created_on');
        session.setLimit(1);
        session.query();
        if (!session.next()) {
            return '';
        }

        return session.getUniqueValue();
    },

    _createSession: function(reservation) {
        var session = new GlideRecord(this.sessionTable);
        session.initialize();
        this._mapReservationToSession(reservation, session);
        session.setValue('status', 'open');
        return session.insert();
    },

    _updateSessionFromReservation: function(sessionId, reservation) {
        var session = new GlideRecord(this.sessionTable);
        if (!session.get(sessionId)) {
            return;
        }

        this._mapReservationToSession(reservation, session);

        if (session.getValue('status') == 'draft') {
            session.setValue('status', 'open');
        }

        session.setWorkflow(false);
        session.update();
    },

    _mapReservationToSession: function(reservation, session) {
        var expectedParticipants = parseInt(reservation.getValue('expected_participants'), 10) || 0;
        var newAvailableSeats = expectedParticipants;

        if (!session.isNewRecord()) {
            var approvedEnrollments = this._getApprovedCountForSession(session.getUniqueValue());
            newAvailableSeats = expectedParticipants - approvedEnrollments;
            if (newAvailableSeats < 0) {
                newAvailableSeats = 0;
            }
        }

        session.setValue('tocc_reservation', reservation.getUniqueValue());
        session.setValue('tocc_course', reservation.getValue('tocc_course'));
        session.setValue('room', reservation.getValue('tocc_room'));
        session.setValue('title', this._buildSessionTitle(reservation));
        session.setValue('tocc_instructor', reservation.getValue('tocc_instructor'));
        session.setValue('start_datetime', reservation.getValue('start_datetime'));
        session.setValue('end_datetime', reservation.getValue('end_datetime'));
        session.setValue('total_seats', expectedParticipants);
        session.setValue('available_seats', newAvailableSeats);
        session.setValue('enrollment_deadline', this._calculateEnrollmentDeadline(reservation.getValue('start_datetime')));
        session.setValue('confirmation_deadline', this._calculateConfirmationDeadline(reservation.getValue('start_datetime')));
    },

    _getApprovedCountForSession: function(sessionId) {
        if (!sessionId) {
            return 0;
        }

        var agg = new GlideAggregate('x_783010_tocc_a1_student_enrollment');
        agg.addQuery('tocc_training_session', sessionId);
        agg.addQuery('status', 'approved');
        agg.addAggregate('COUNT');
        agg.query();

        if (!agg.next()) {
            return 0;
        }

        return parseInt(agg.getAggregate('COUNT'), 10) || 0;
    },

    _buildSessionTitle: function(reservation) {
        var courseName = reservation.getDisplayValue('tocc_course') || 'Training';
        return courseName + ' - ' + reservation.getDisplayValue('start_datetime');
    },

    _calculateEnrollmentDeadline: function(startDateTime) {
        if (!startDateTime) {
            return '';
        }

        var gdt = new GlideDateTime(startDateTime);
        var minAdvance = this.config.getMinimumAdvanceNoticeHours();
        gdt.addSeconds(-1 * minAdvance * 3600);
        return gdt.getValue();
    },

    _calculateConfirmationDeadline: function(startDateTime) {
        if (!startDateTime) {
            return '';
        }

        var gdt = new GlideDateTime(startDateTime);
        var confirmationLead = this.config.getConfirmationLeadHours();
        gdt.addSeconds(-1 * confirmationLead * 3600);
        return gdt.getValue();
    },

    _cancelSession: function(sessionId, reservationNumber) {
        var session = new GlideRecord(this.sessionTable);
        if (!session.get(sessionId)) {
            return;
        }

        if (session.getValue('status') == 'cancelled') {
            return;
        }

        session.setValue('status', 'cancelled');
        session.setValue('work_notes', 'Cancelled due to reservation cancellation: ' + reservationNumber);
        session.setWorkflow(false);
        session.update();
    },

    _linkReservationToSession: function(reservationId, sessionId) {
        var reservation = new GlideRecord(this.reservationTable);
        if (!reservation.get(reservationId)) {
            return;
        }

        if (reservation.getValue('training_session')) {
            return;
        }

        reservation.setValue('training_session', sessionId);
        reservation.setWorkflow(false);
        reservation.update();
    },

    ensureSessionRoom: function(current) {
        if (!gs.nil(current.getValue('room'))) {
            return '';
        }

        var reservationId = current.getValue('tocc_reservation');
        if (gs.nil(reservationId)) {
            return 'Training session requires a room.';
        }

        var reservation = new GlideRecord(this.reservationTable);
        if (!reservation.get(reservationId)) {
            return 'Linked reservation was not found for this training session.';
        }

        var reservationRoom = reservation.getValue('tocc_room');
        if (gs.nil(reservationRoom)) {
            return 'Linked reservation has no room defined.';
        }

        current.setValue('room', reservationRoom);

        if (gs.nil(current.getValue('tocc_course')) && !gs.nil(reservation.getValue('tocc_course'))) {
            current.setValue('tocc_course', reservation.getValue('tocc_course'));
        }

        if (gs.nil(current.getValue('tocc_instructor')) && !gs.nil(reservation.getValue('tocc_instructor'))) {
            current.setValue('tocc_instructor', reservation.getValue('tocc_instructor'));
        }

        if (gs.nil(current.getValue('start_datetime')) && !gs.nil(reservation.getValue('start_datetime'))) {
            current.setValue('start_datetime', reservation.getValue('start_datetime'));
        }

        if (gs.nil(current.getValue('end_datetime')) && !gs.nil(reservation.getValue('end_datetime'))) {
            current.setValue('end_datetime', reservation.getValue('end_datetime'));
        }

        return '';
    },

    repairMissingRooms: function(maxRecords) {
        var scanned = 0;
        var repaired = 0;
        var skippedNoReservation = 0;
        var skippedNoRoomInReservation = 0;

        var session = new GlideRecord(this.sessionTable);
        session.addNullQuery('room');
        session.orderByDesc('sys_updated_on');
        if (!gs.nil(maxRecords)) {
            var parsedLimit = parseInt(maxRecords, 10);
            if (!isNaN(parsedLimit) && parsedLimit > 0) {
                session.setLimit(parsedLimit);
            }
        }
        session.query();

        while (session.next()) {
            scanned++;

            var reservationId = session.getValue('tocc_reservation');
            if (gs.nil(reservationId)) {
                skippedNoReservation++;
                continue;
            }

            var reservation = new GlideRecord(this.reservationTable);
            if (!reservation.get(reservationId)) {
                skippedNoReservation++;
                continue;
            }

            var reservationRoom = reservation.getValue('tocc_room');
            if (gs.nil(reservationRoom)) {
                skippedNoRoomInReservation++;
                continue;
            }

            session.setValue('room', reservationRoom);

            if (gs.nil(session.getValue('tocc_course')) && !gs.nil(reservation.getValue('tocc_course'))) {
                session.setValue('tocc_course', reservation.getValue('tocc_course'));
            }
            if (gs.nil(session.getValue('tocc_instructor')) && !gs.nil(reservation.getValue('tocc_instructor'))) {
                session.setValue('tocc_instructor', reservation.getValue('tocc_instructor'));
            }
            if (gs.nil(session.getValue('start_datetime')) && !gs.nil(reservation.getValue('start_datetime'))) {
                session.setValue('start_datetime', reservation.getValue('start_datetime'));
            }
            if (gs.nil(session.getValue('end_datetime')) && !gs.nil(reservation.getValue('end_datetime'))) {
                session.setValue('end_datetime', reservation.getValue('end_datetime'));
            }

            session.setWorkflow(false);
            session.update();
            repaired++;
        }

        return {
            scanned: scanned,
            repaired: repaired,
            skipped_no_reservation: skippedNoReservation,
            skipped_no_room_in_reservation: skippedNoRoomInReservation
        };
    },

    type: 'TrainingSessionService'
};`,
})
