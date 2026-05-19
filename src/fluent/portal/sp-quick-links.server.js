(function() {
    function pageLink(pageId) {
        return '?id=' + pageId;
    }

    function resolveProducerLink(name, fallback, preferredRedirect) {
        var item = new GlideRecordSecure('sc_cat_item_producer');
        item.addQuery('name', name);
        item.addQuery('active', true);
        if (preferredRedirect) {
            item.addQuery('redirect_url', preferredRedirect);
        }
        item.orderByDesc('sys_updated_on');
        item.setLimit(1);
        item.query();

        if (item.next()) {
            return '?id=sc_cat_item&sys_id=' + item.getUniqueValue();
        }

        if (preferredRedirect) {
            return resolveProducerLink(name, fallback, '');
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
        '/x_783010_tocc_a1_course.do?sys_id=-1',
        '?id=tocc_my_courses'
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

    function resolveDashboardLink() {
        var dashboard = new GlideRecordSecure('par_dashboard');
        dashboard.addQuery('name', 'Training Operations Performance Dashboard');
        dashboard.addQuery('active', true);
        dashboard.setLimit(1);
        dashboard.query();
        if (dashboard.next()) {
            return '/now/nav/ui/classic/params/target/par_dashboard.do?sys_id=' + dashboard.getUniqueValue();
        }
        return '/now/analytics-center/home';
    }

    data.links = {
        sessions: pageLink('tocc_sessions'),
        enrollments: pageLink('tocc_my_enrollments'),
        reservations: pageLink('tocc_my_reservations'),
        courses: pageLink('tocc_my_courses'),
        backoffice_queue: pageLink('tocc_backoffice_queue'),
        platform_dashboard: resolveDashboardLink(),
        create_reservation: createReservationLink,
        request_enrollment: requestEnrollmentLink,
        create_course: createCourseLink,
        help: pageLink('tocc_help'),
        sow_home: '/now/sow/home',
    };

    function formatKpiValue(metric) {
        if (!metric) {
            return '0';
        }

        var value = metric.value;
        if (value === undefined || value === null || value === '') {
            value = 0;
        }

        var numeric = parseFloat(value);
        if (isNaN(numeric)) {
            return String(value);
        }

        if (metric.unit === 'percent') {
            return numeric.toFixed(1).replace(/\.0$/, '') + '%';
        }
        if (metric.unit === 'hours') {
            return numeric.toFixed(1).replace(/\.0$/, '') + 'h';
        }
        if (metric.unit === 'rating') {
            return numeric.toFixed(1).replace(/\.0$/, '') + '/5';
        }

        return String(Math.round(numeric));
    }

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
    data.operations = {
        generated_on: '',
        dashboard_link: data.links.platform_dashboard,
        kpi_snapshot_date: '',
        kpis: [],
        queues: [],
        has_kpis: false,
    };

    if (data.showOpsStats) {
        var snapshotLoaded = false;
        try {
            var service = new x_783010_tocc_a1.PortalApiService();
            var rawSnapshot = service.getOperationsSnapshot();
            var operations = JSON.parse(rawSnapshot || '{}');

            if (operations.success && operations.snapshot) {
                snapshotLoaded = true;
                data.operations.generated_on = operations.generated_on || '';

                data.desktopStats = [
                    { label: 'Pending Reservations', value: operations.snapshot.pending_reservations || 0 },
                    { label: 'Sessions Today', value: operations.snapshot.todays_sessions || 0 },
                    { label: 'Pending Enrollments', value: operations.snapshot.pending_enrollments || 0 },
                ];

                data.operations.queues = [
                    {
                        label: 'Unconfirmed Approved Enrollments',
                        value: operations.snapshot.unconfirmed_approved_enrollments || 0,
                        tone: 'warning',
                    },
                    {
                        label: 'In-Progress Attendance Pending',
                        value: operations.snapshot.in_progress_attendance_pending || 0,
                        tone: 'primary',
                    },
                    {
                        label: 'Resources Missing CMDB CI',
                        value: operations.snapshot.resources_missing_ci || 0,
                        tone: (operations.snapshot.resources_missing_ci || 0) > 0 ? 'danger' : 'success',
                    },
                ];

                if (operations.kpi_highlights) {
                    data.operations.kpi_snapshot_date = operations.kpi_highlights.snapshot_date || '';
                    var metrics = operations.kpi_highlights.metrics || [];
                    for (var i = 0; i < metrics.length; i++) {
                        data.operations.kpis.push({
                            label: metrics[i].label,
                            value: formatKpiValue(metrics[i]),
                            unit: metrics[i].unit,
                        });
                    }
                    data.operations.has_kpis = data.operations.kpis.length > 0;
                }
            }
        } catch (opsEx) {
            snapshotLoaded = false;
        }

        if (!snapshotLoaded) {
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

        data.actions.push({
            title: 'My Courses',
            desc: 'Gerencie os cursos que voce pode usar em novas sessoes.',
            icon: 'fa-book',
            href: data.links.courses,
            kind: 'secondary'
        });
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
            desc: 'Cadastre um novo curso e volte para sua lista de cursos.',
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

        data.actions.push({
            title: 'Platform Analytics',
            desc: 'Abra o dashboard operacional com KPIs e tendencias.',
            icon: 'fa-bar-chart',
            href: data.links.platform_dashboard,
            kind: 'secondary'
        });
    }
})();
