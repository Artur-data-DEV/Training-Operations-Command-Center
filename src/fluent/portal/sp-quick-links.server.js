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

    data.links = {
        sessions: pageLink('tocc_sessions'),
        enrollments: pageLink('tocc_my_enrollments'),
        reservations: pageLink('tocc_my_reservations'),
        create_reservation: createReservationLink,
        request_enrollment: requestEnrollmentLink,
        help: pageLink('tocc_help'),
        sow_home: '/now/sow/home',
        workspace_home: '/now/tocc-backoffice-ops/list/x_783010_tocc_a1_room_reservation',
    };

    data.actions = [];

    data.actions.push({
        title: 'Browse Sessions',
        desc: 'Encontre e inscreva-se em treinamentos disponiveis.',
        icon: 'fa-calendar-o',
        href: data.links.sessions,
        kind: 'primary'
    });

    data.actions.push({
        title: 'Schedule Room',
        desc: 'Reserve salas e laboratorios para novas turmas.',
        icon: 'fa-calendar-plus-o',
        href: data.links.create_reservation,
        kind: 'secondary'
    });

    data.actions.push({
        title: 'Manage Schedule',
        desc: 'Acompanhe o status de suas solicitacoes de reserva.',
        icon: 'fa-list-alt',
        href: data.links.reservations,
        kind: 'secondary'
    });

    data.actions.push({
        title: 'Support & Docs',
        desc: 'Acesse a base de conhecimento e guias operacionais.',
        icon: 'fa-question-circle',
        href: data.links.help,
        kind: 'secondary'
    });

    if (
        gs.hasRole('admin') ||
        gs.hasRole('x_783010_tocc_a1.admin') ||
        gs.hasRole('x_783010_tocc_a1.backoffice') ||
        gs.hasRole('x_783010_tocc_a1.manager')
    ) {
        data.actions.push({
            title: 'Backoffice Workspace',
            desc: 'Abra a experiencia operacional no UI Builder.',
            icon: 'fa-briefcase',
            href: data.links.workspace_home,
            kind: 'secondary'
        });
    }
})();
