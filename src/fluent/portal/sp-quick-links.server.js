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
        '?id=tocc_my_reservations' // Fallback directly to the list if producer fails
    );
    var requestEnrollmentLink = resolveProducerLink(
        'Request Training Enrollment',
        '?id=tocc_sessions' // Fallback to session list
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

    data.actions = [];
    
    // Always push the core 4 actions from the beautiful design
    data.actions.push({ 
        title: 'Browse Sessions', 
        desc: 'Encontre e inscreva-se em treinamentos disponíveis.',
        icon: 'fa-calendar-o',
        href: data.links.sessions, 
        kind: 'primary' 
    });

    data.actions.push({ 
        title: 'Schedule Room', 
        desc: 'Reserve salas e laboratórios para novas turmas.',
        icon: 'fa-calendar-plus-o',
        href: data.links.create_reservation, 
        kind: 'secondary' 
    });

    data.actions.push({ 
        title: 'Manage Schedule', 
        desc: 'Acompanhe o status de suas solicitações de reserva.',
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

})();
