
(function() {
    function pageLink(pageId) {
        return '?id=' + pageId;
    }

    function resolveProducerLink(name, fallback) {
        var item = new GlideRecordSecure('sc_cat_item_producer');
        item.addQuery('name', name);
        item.addQuery('active', true);
        item.orderByDesc('sys_updated_on');
        item.setLimit(1);
        item.query();

        if (item.next()) {
            return '?id=sc_cat_item&sys_id=' + item.getUniqueValue();
        }

        return fallback;
    }

    var createReservationLink = resolveProducerLink(
        'Create Room Reservation',
        '?id=tocc_home'
    );
    var requestEnrollmentLink = resolveProducerLink(
        'Request Training Enrollment',
        '?id=tocc_home'
    );

    data.links = {
        sessions: pageLink('tocc_sessions'),
        enrollments: pageLink('tocc_my_enrollments'),
        reservations: pageLink('tocc_my_reservations'),
        create_reservation: createReservationLink,
        request_enrollment: requestEnrollmentLink,
        help: pageLink('tocc_help'),
        sow_home: '/now/sow/home',
    };

    data.is_guest = gs.getUserID() == 'guest';

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
    data.persona.is_backoffice =
        gs.hasRole('x_783010_tocc_a1.backoffice') ||
        gs.hasRole('x_783010_tocc_a1.manager') ||
        gs.hasRole('x_783010_tocc_a1.admin') ||
        gs.hasRole('admin');

    var reservationGr = new GlideRecordSecure('x_783010_tocc_a1_room_reservation');
    reservationGr.initialize();
    var enrollmentGr = new GlideRecordSecure('x_783010_tocc_a1_student_enrollment');
    enrollmentGr.initialize();

    data.permissions = {
        can_create_reservation: reservationGr.canCreate(),
        can_create_enrollment: enrollmentGr.canCreate(),
    };

    data.actions = [];
    data.actions.push({ label: 'Browse Sessions', href: data.links.sessions, kind: 'primary' });

    if (data.persona.is_student || data.permissions.can_create_enrollment) {
        data.actions.push({ label: 'Request Enrollment', href: data.links.request_enrollment, kind: 'secondary' });
        data.actions.push({ label: 'My Enrollments', href: data.links.enrollments, kind: 'secondary' });
    }

    if (data.persona.is_instructor || data.permissions.can_create_reservation) {
        data.actions.push({ label: 'Create Reservation', href: data.links.create_reservation, kind: 'secondary' });
        data.actions.push({ label: 'My Reservations', href: data.links.reservations, kind: 'secondary' });
    }

    data.actions.push({ label: 'Help Center', href: data.links.help, kind: 'secondary' });

    if (data.persona.is_backoffice) {
        data.actions.push({ label: 'SOW Home', href: data.links.sow_home, kind: 'secondary' });
    }

    data.operations = null;
    data.kpi_highlights = null;
    data.operations_error = '';
    data.show_operations = false;

    var canViewOperations =
        gs.hasRole('admin') ||
        gs.hasRole('x_783010_tocc_a1.admin') ||
        gs.hasRole('x_783010_tocc_a1.backoffice') ||
        gs.hasRole('x_783010_tocc_a1.manager');

    if (!canViewOperations) {
        return;
    }

    data.show_operations = true;

    try {
        var svc = new x_783010_tocc_a1.PortalApiService();
        var result = JSON.parse(svc.getOperationsSnapshot());

        if (result.success && result.snapshot) {
            data.operations = result.snapshot;
            data.kpi_highlights = result.kpi_highlights || { snapshot_date: '', metrics: [] };
        } else {
            data.operations_error = result.message || 'Unable to load operational snapshot.';
        }
    } catch (ex) {
        data.operations_error = ex && ex.message ? ex.message : String(ex);
    }
})();
