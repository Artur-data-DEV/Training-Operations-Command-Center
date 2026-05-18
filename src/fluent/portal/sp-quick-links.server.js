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
        '?id=tocc_my_reservations'
    );
    var requestEnrollmentLink = resolveProducerLink(
        'Request Training Enrollment',
        '?id=tocc_sessions'
    );
    var createCourseLink = resolveProducerLink(
        'Create Course',
        '/x_783010_tocc_a1_course.do?sys_id=-1'
    );

    var isImpersonating = false;
    try {
        isImpersonating = !!(gs.getSession() && gs.getSession().isImpersonating && gs.getSession().isImpersonating());
    } catch (e) {
        isImpersonating = false;
    }

    // Prevent admin-role leakage while impersonating persona users in validation sessions.
    var isPlatformAdmin = gs.hasRole('admin') && !isImpersonating;
    var isAppAdmin = gs.hasRole('x_783010_tocc_a1.admin');
    var isBackoffice = gs.hasRole('x_783010_tocc_a1.backoffice');
    var isManager = gs.hasRole('x_783010_tocc_a1.manager');
    var isInstructor = gs.hasRole('x_783010_tocc_a1.instructor');
    var isStudent = gs.hasRole('x_783010_tocc_a1.student');
    var isOpsPersona = isPlatformAdmin || isAppAdmin || isBackoffice || isManager;
    var canManageInstruction = isInstructor || isBackoffice || isAppAdmin || isPlatformAdmin;

    data.links = {
        sessions: pageLink('tocc_sessions'),
        enrollments: pageLink('tocc_my_enrollments'),
        reservations: pageLink('tocc_my_reservations'),
        backoffice_queue: pageLink('tocc_backoffice_queue'),
        create_reservation: createReservationLink,
        request_enrollment: requestEnrollmentLink,
        create_course: createCourseLink,
        help: pageLink('tocc_help'),
        sow_home: '/now/sow/home',
    };

    function countRecords(table, encodedQuery) {
        var gr = new GlideRecordSecure(table);
        if (encodedQuery) {
            gr.addEncodedQuery(encodedQuery);
        }
        gr.query();
        return gr.getRowCount();
    }

    data.showOpsStats = isOpsPersona;
    data.desktopStats = [];
    if (data.showOpsStats) {
        data.desktopStats.push({
            label: 'Pending Reservations',
            value: countRecords('x_783010_tocc_a1_room_reservation', 'status=submitted')
        });
        data.desktopStats.push({
            label: 'Sessions Today',
            value: countRecords(
                'x_783010_tocc_a1_training_session',
                'start_datetimeONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()'
            )
        });
        data.desktopStats.push({
            label: 'Pending Enrollments',
            value: countRecords('x_783010_tocc_a1_student_enrollment', 'status=pending')
        });
    }

    data.actions = [];

    data.actions.push({
        title: 'Browse Sessions',
        desc: 'Encontre e inscreva-se em treinamentos disponiveis.',
        icon: 'fa-calendar-o',
        href: data.links.sessions,
        kind: 'primary'
    });

    if (canManageInstruction) {
        data.actions.push({
            title: 'Schedule Room',
            desc: 'Reserve salas e laboratorios para novas turmas.',
            icon: 'fa-calendar-plus-o',
            href: data.links.create_reservation,
            kind: 'secondary'
        });

        if (isInstructor || isAppAdmin || isPlatformAdmin) {
            data.actions.push({
                title: 'Manage Schedule',
                desc: 'Acompanhe o status de suas solicitacoes de reserva.',
                icon: 'fa-list-alt',
                href: data.links.reservations,
                kind: 'secondary'
            });
        }
    }

    if (isStudent) {
        data.actions.push({
            title: 'My Enrollments',
            desc: 'Acompanhe inscricoes, confirmacoes e cancelamentos.',
            icon: 'fa-check-square-o',
            href: data.links.enrollments,
            kind: 'secondary'
        });
    }

    if (canManageInstruction) {
        data.actions.push({
            title: 'Create Course',
            desc: 'Cadastre um novo curso para futuras sessoes.',
            icon: 'fa-book',
            href: data.links.create_course,
            kind: 'secondary'
        });
    }

    data.actions.push({
        title: 'Support & Docs',
        desc: 'Acesse a base de conhecimento e guias operacionais.',
        icon: 'fa-question-circle',
        href: data.links.help,
        kind: 'secondary'
    });

    if (isOpsPersona) {
        data.actions.push({
            title: 'Backoffice Queue',
            desc: 'Aprove ou rejeite reservas submetidas.',
            icon: 'fa-tasks',
            href: data.links.backoffice_queue,
            kind: 'secondary'
        });
    }
})();
