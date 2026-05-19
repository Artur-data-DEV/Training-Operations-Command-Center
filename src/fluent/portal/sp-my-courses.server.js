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

    var isPrivileged = gs.hasRole('admin') ||
        gs.hasRole('x_783010_tocc_a1.admin') ||
        gs.hasRole('x_783010_tocc_a1.backoffice') ||
        gs.hasRole('x_783010_tocc_a1.manager');

    data.links = {
        home: pageLink('tocc_home'),
        create_course: resolveProducerLink('Create Course', pageLink('tocc_home'), '?id=tocc_my_courses'),
    };
    data.courses = [];
    data.summary = {
        total: 0,
        active: 0,
        draft: 0,
        inactive: 0,
    };

    var gr = new GlideRecordSecure('x_783010_tocc_a1_course');
    if (!isPrivileged) {
        gr.addQuery('tocc_owner', gs.getUserID());
    }
    gr.orderBy('course_name');
    gr.setLimit(100);
    gr.query();

    while (gr.next()) {
        var status = String(gr.getValue('status') || '');
        data.summary.total++;
        if (data.summary.hasOwnProperty(status)) {
            data.summary[status]++;
        }

        data.courses.push({
            sys_id: gr.getUniqueValue(),
            course_id: gr.getValue('course_id'),
            course_name: gr.getDisplayValue('course_name'),
            description: gr.getValue('description'),
            duration_hours: gr.getValue('duration_hours'),
            delivery_category: gr.getValue('delivery_category'),
            delivery_category_display: gr.getDisplayValue('delivery_category'),
            owner: gr.getValue('tocc_owner'),
            owner_name: gr.getDisplayValue('tocc_owner'),
            status: status,
            status_display: gr.getDisplayValue('status'),
            record_url: '?id=form&table=x_783010_tocc_a1_course&sys_id=' + gr.getUniqueValue(),
        });
    }
})();
