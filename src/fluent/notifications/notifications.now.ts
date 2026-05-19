import { EmailNotification } from '@servicenow/sdk/core'

const text = (lines: any) => lines.join('\n')

EmailNotification({
    $id: Now.ID['x_783010_tocc_a1_notif_reservation_submitted'],
    name: '[TOCC] Reservation Submitted',
    active: true,
    table: 'x_783010_tocc_a1_room_reservation',
    triggerConditions: {
        generationType: 'event',
        eventName: 'x_783010_tocc_a1.reservation.submitted',
        itemTable: 'x_783010_tocc_a1_room_reservation',
    },
    recipientDetails: {
        recipientFields: ['tocc_instructor'],
    },
    emailContent: {
        contentType: 'text/plain',
        subject: 'Room Reservation ${number} submitted for approval',
        messageText: text([
            'Hi ${tocc_instructor.first_name},',
            '',
            'Your room reservation request ${number} has been submitted and is pending approval.',
            '',
            'Course:     ${tocc_course}',
            'Room:       ${tocc_room}',
            'Start:      ${start_datetime}',
            'End:        ${end_datetime}',
            'Attendees:  ${expected_participants}',
            '',
            'You will be notified once the reservation is approved or rejected.',
            '',
            'Training Operations',
        ]),
    },
})

EmailNotification({
    $id: Now.ID['x_783010_tocc_a1_notif_reservation_approved'],
    name: '[TOCC] Reservation Approved',
    active: true,
    table: 'x_783010_tocc_a1_room_reservation',
    triggerConditions: {
        generationType: 'event',
        eventName: 'x_783010_tocc_a1.reservation.approved',
        itemTable: 'x_783010_tocc_a1_room_reservation',
    },
    recipientDetails: {
        recipientFields: ['tocc_instructor'],
    },
    emailContent: {
        contentType: 'text/plain',
        subject: 'Room Reservation ${number} approved',
        messageText: text([
            'Hi ${tocc_instructor.first_name},',
            '',
            'Your room reservation ${number} has been approved and the training session is now open for enrollment.',
            '',
            'Course:     ${tocc_course}',
            'Room:       ${tocc_room}',
            'Start:      ${start_datetime}',
            'End:        ${end_datetime}',
            '',
            'Students can now enroll through the Service Portal.',
            '',
            'Training Operations',
        ]),
    },
})

EmailNotification({
    $id: Now.ID['x_783010_tocc_a1_notif_reservation_rejected'],
    name: '[TOCC] Reservation Rejected',
    active: true,
    table: 'x_783010_tocc_a1_room_reservation',
    triggerConditions: {
        generationType: 'event',
        eventName: 'x_783010_tocc_a1.reservation.rejected',
        itemTable: 'x_783010_tocc_a1_room_reservation',
    },
    recipientDetails: {
        recipientFields: ['tocc_instructor'],
    },
    emailContent: {
        contentType: 'text/plain',
        subject: 'Room Reservation ${number} rejected',
        messageText: text([
            'Hi ${tocc_instructor.first_name},',
            '',
            'Your room reservation ${number} has been rejected.',
            '',
            'Course:     ${tocc_course}',
            'Room:       ${tocc_room}',
            'Start:      ${start_datetime}',
            '',
            'Please review the work notes on your reservation for details, and submit a new request if needed.',
            '',
            'Training Operations',
        ]),
    },
})

EmailNotification({
    $id: Now.ID['x_783010_tocc_a1_notif_enrollment_approved'],
    name: '[TOCC] Enrollment Approved',
    active: true,
    table: 'x_783010_tocc_a1_student_enrollment',
    triggerConditions: {
        generationType: 'event',
        eventName: 'x_783010_tocc_a1.enrollment.approved',
        itemTable: 'x_783010_tocc_a1_student_enrollment',
    },
    recipientDetails: {
        recipientFields: ['tocc_student.user'],
    },
    emailContent: {
        contentType: 'text/plain',
        subject: 'Your enrollment ${number} has been confirmed',
        messageText: text([
            'Hi ${tocc_student.user.first_name},',
            '',
            'Great news - your enrollment ${number} for the training session below has been confirmed.',
            '',
            'Session:  ${tocc_training_session}',
            'Start:    ${tocc_training_session.start_datetime}',
            'Room:     ${tocc_training_session.room}',
            '',
            'Please remember to confirm your attendance before the confirmation deadline.',
            '',
            'Training Operations',
        ]),
    },
})

EmailNotification({
    $id: Now.ID['x_783010_tocc_a1_notif_enrollment_rejected'],
    name: '[TOCC] Enrollment Rejected',
    active: true,
    table: 'x_783010_tocc_a1_student_enrollment',
    triggerConditions: {
        generationType: 'event',
        eventName: 'x_783010_tocc_a1.enrollment.rejected',
        itemTable: 'x_783010_tocc_a1_student_enrollment',
    },
    recipientDetails: {
        recipientFields: ['tocc_student.user'],
    },
    emailContent: {
        contentType: 'text/plain',
        subject: 'Your enrollment ${number} was not approved',
        messageText: text([
            'Hi ${tocc_student.user.first_name},',
            '',
            'Unfortunately your enrollment request ${number} for the session below was not approved.',
            '',
            'Session:  ${tocc_training_session}',
            'Start:    ${tocc_training_session.start_datetime}',
            '',
            'Check the work notes on your enrollment for details, or contact the training team for support.',
            '',
            'Training Operations',
        ]),
    },
})

EmailNotification({
    $id: Now.ID['x_783010_tocc_a1_notif_enrollment_waitlisted'],
    name: '[TOCC] Enrollment Waitlisted',
    active: true,
    table: 'x_783010_tocc_a1_student_enrollment',
    triggerConditions: {
        generationType: 'event',
        eventName: 'x_783010_tocc_a1.enrollment.waitlisted',
        itemTable: 'x_783010_tocc_a1_student_enrollment',
    },
    recipientDetails: {
        recipientFields: ['tocc_student.user'],
    },
    emailContent: {
        contentType: 'text/plain',
        subject: 'You are on the waitlist for ${tocc_training_session}',
        messageText: text([
            'Hi ${tocc_student.user.first_name},',
            '',
            'The session you requested is currently full. You have been added to the waitlist.',
            '',
            'Session:  ${tocc_training_session}',
            'Start:    ${tocc_training_session.start_datetime}',
            '',
            'You will be automatically notified and your spot confirmed if a seat becomes available.',
            '',
            'Training Operations',
        ]),
    },
})

EmailNotification({
    $id: Now.ID['x_783010_tocc_a1_notif_enrollment_waitlist_promoted'],
    name: '[TOCC] Waitlist Promotion',
    active: true,
    table: 'x_783010_tocc_a1_student_enrollment',
    triggerConditions: {
        generationType: 'event',
        eventName: 'x_783010_tocc_a1.enrollment.waitlist_promoted',
        itemTable: 'x_783010_tocc_a1_student_enrollment',
    },
    recipientDetails: {
        recipientFields: ['tocc_student.user'],
    },
    emailContent: {
        contentType: 'text/plain',
        subject: 'A seat is now available - your enrollment ${number} is confirmed',
        messageText: text([
            'Hi ${tocc_student.user.first_name},',
            '',
            'A seat has opened up and your enrollment ${number} has been promoted from the waitlist to confirmed.',
            '',
            'Session:  ${tocc_training_session}',
            'Start:    ${tocc_training_session.start_datetime}',
            'Room:     ${tocc_training_session.room}',
            '',
            'Please confirm your attendance before the deadline.',
            '',
            'Training Operations',
        ]),
    },
})

EmailNotification({
    $id: Now.ID['x_783010_tocc_a1_notif_enrollment_cancelled'],
    name: '[TOCC] Enrollment Cancelled',
    active: true,
    table: 'x_783010_tocc_a1_student_enrollment',
    triggerConditions: {
        generationType: 'event',
        eventName: 'x_783010_tocc_a1.enrollment.cancelled',
        itemTable: 'x_783010_tocc_a1_student_enrollment',
    },
    recipientDetails: {
        recipientFields: ['tocc_student.user'],
    },
    emailContent: {
        contentType: 'text/plain',
        subject: 'Your enrollment ${number} has been cancelled',
        messageText: text([
            'Hi ${tocc_student.user.first_name},',
            '',
            'Your enrollment ${number} for the session below has been cancelled.',
            '',
            'Session:  ${tocc_training_session}',
            'Start:    ${tocc_training_session.start_datetime}',
            '',
            'If you believe this was an error, please contact the training team.',
            '',
            'Training Operations',
        ]),
    },
})

EmailNotification({
    $id: Now.ID['x_783010_tocc_a1_notif_session_reminder'],
    name: '[TOCC] Session Reminder',
    active: true,
    table: 'x_783010_tocc_a1_student_enrollment',
    triggerConditions: {
        generationType: 'event',
        eventName: 'x_783010_tocc_a1.session.reminder',
        itemTable: 'x_783010_tocc_a1_student_enrollment',
    },
    recipientDetails: {
        recipientFields: ['tocc_student.user'],
    },
    emailContent: {
        contentType: 'text/plain',
        subject: 'Reminder: ${tocc_training_session} is coming up soon',
        messageText: text([
            'Hi ${tocc_student.user.first_name},',
            '',
            'This is a reminder that the training session below is coming up soon.',
            '',
            'Session:  ${tocc_training_session}',
            'Start:    ${tocc_training_session.start_datetime}',
            'Room:     ${tocc_training_session.room}',
            'Location: ${tocc_training_session.room.location}',
            '',
            'Make sure you have confirmed your attendance if required.',
            '',
            'Training Operations',
        ]),
    },
})

EmailNotification({
    $id: Now.ID['x_783010_tocc_a1_notif_session_confirmation_request'],
    name: '[TOCC] Attendance Confirmation Request',
    active: true,
    table: 'x_783010_tocc_a1_student_enrollment',
    triggerConditions: {
        generationType: 'event',
        eventName: 'x_783010_tocc_a1.session.confirmation_request',
        itemTable: 'x_783010_tocc_a1_student_enrollment',
    },
    recipientDetails: {
        recipientFields: ['tocc_student.user'],
    },
    emailContent: {
        contentType: 'text/plain',
        subject: 'Action required: confirm your attendance for ${tocc_training_session}',
        messageText: text([
            'Hi ${tocc_student.user.first_name},',
            '',
            'Please confirm your attendance for the training session below before the deadline. Unconfirmed seats will be released automatically.',
            '',
            'Session:  ${tocc_training_session}',
            'Start:    ${tocc_training_session.start_datetime}',
            'Deadline: ${tocc_training_session.confirmation_deadline}',
            '',
            'To confirm, visit the Service Portal and open your enrollment ${number}.',
            '',
            'Training Operations',
        ]),
    },
})

EmailNotification({
    $id: Now.ID['x_783010_tocc_a1_notif_session_cancelled'],
    name: '[TOCC] Session Cancelled',
    active: true,
    table: 'x_783010_tocc_a1_student_enrollment',
    triggerConditions: {
        generationType: 'event',
        eventName: 'x_783010_tocc_a1.session.cancelled',
        itemTable: 'x_783010_tocc_a1_student_enrollment',
    },
    recipientDetails: {
        recipientFields: ['tocc_student.user'],
    },
    emailContent: {
        contentType: 'text/plain',
        subject: 'Training session ${tocc_training_session} has been cancelled',
        messageText: text([
            'Hi ${tocc_student.user.first_name},',
            '',
            'We regret to inform you that the training session below has been cancelled.',
            '',
            'Session:  ${tocc_training_session}',
            'Start:    ${tocc_training_session.start_datetime}',
            '',
            'Your enrollment ${number} has been automatically cancelled. Please contact the training team if you need to reschedule.',
            '',
            'Training Operations',
        ]),
    },
})

EmailNotification({
    $id: Now.ID['x_783010_tocc_a1_notif_session_feedback_request'],
    name: '[TOCC] Feedback Request',
    active: true,
    table: 'x_783010_tocc_a1_student_enrollment',
    triggerConditions: {
        generationType: 'event',
        eventName: 'x_783010_tocc_a1.session.feedback_request',
        itemTable: 'x_783010_tocc_a1_student_enrollment',
    },
    recipientDetails: {
        recipientFields: ['tocc_student.user'],
    },
    emailContent: {
        contentType: 'text/plain',
        subject: 'How was your training? Share your feedback for ${tocc_training_session}',
        messageText: text([
            'Hi ${tocc_student.user.first_name},',
            '',
            'Thank you for attending the training session below. We would love to hear your feedback.',
            '',
            'Session:  ${tocc_training_session}',
            'Date:     ${tocc_training_session.start_datetime}',
            '',
            'To submit your feedback, visit the Service Portal and open your enrollment ${number}.',
            '',
            'Your input helps us improve. It takes less than 2 minutes.',
            '',
            'Training Operations',
        ]),
    },
})
