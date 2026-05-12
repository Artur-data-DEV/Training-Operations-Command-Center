import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['x_783010_tocc_a1_script_include_knowledge_base_bootstrap_service'],
    name: 'KnowledgeBaseBootstrapService',
    apiName: 'x_783010_tocc_a1.KnowledgeBaseBootstrapService',
    accessibleFrom: 'package_private',
    clientCallable: false,
    protectionPolicy: 'read',
    script: `var KnowledgeBaseBootstrapService = Class.create();
KnowledgeBaseBootstrapService.prototype = {
    initialize: function() {
        this.scope = 'x_783010_tocc_a1';
        this.kbName = 'Training Operations Knowledge Base';
        this.kbDescription = 'Operational knowledge for students, instructors, and backoffice users.';
        this.kbUrlProperty = 'x_783010_tocc_a1.portal.kb_url';
    },

    bootstrap: function() {
        var started = new GlideDateTime();
        var summary = {
            success: true,
            message: '',
            started_at: started.getValue(),
            finished_at: '',
            knowledge_base: {
                sys_id: '',
                title: this.kbName,
                action: '',
            },
            categories: {
                total: 0,
                created: 0,
                updated: 0,
                existing: 0,
            },
            articles: {
                total: 0,
                created: 0,
                updated: 0,
                existing: 0,
            },
            properties: {
                total: 1,
                created: 0,
                updated: 0,
                existing: 0,
            },
            details: {
                categories: {},
                articles: {},
            },
        };

        try {
            var kbInfo = this._ensureKnowledgeBase();
            summary.knowledge_base.sys_id = kbInfo.sys_id;
            summary.knowledge_base.action = kbInfo.action;

            var categoryMap = this._ensureCategories(kbInfo.sys_id, summary);
            this._ensureArticles(kbInfo.sys_id, categoryMap, summary);
            this._ensurePortalKbProperty(kbInfo.sys_id, summary);

            summary.message = 'Knowledge base bootstrap completed successfully.';
        } catch (ex) {
            summary.success = false;
            summary.message = 'Knowledge base bootstrap failed: ' + this._toErrorMessage(ex);
            gs.error('[TOCC][KnowledgeBaseBootstrapService] ' + summary.message);
        }

        summary.finished_at = new GlideDateTime().getValue();
        return summary;
    },

    bootstrapAsJson: function() {
        return JSON.stringify(this.bootstrap());
    },

    _ensureKnowledgeBase: function() {
        var kb = new GlideRecord('kb_knowledge_base');
        kb.addQuery('title', this.kbName);
        kb.setLimit(1);
        kb.query();

        if (kb.next()) {
            var changedExisting = false;
            changedExisting = this._setIfChanged(kb, 'description', this.kbDescription) || changedExisting;
            changedExisting = this._setIfChanged(kb, 'active', true) || changedExisting;

            if (changedExisting) {
                kb.update();
                return { sys_id: kb.getUniqueValue(), action: 'updated' };
            }

            return { sys_id: kb.getUniqueValue(), action: 'existing' };
        }

        kb.initialize();
        this._setIfPresent(kb, 'title', this.kbName);
        this._setIfPresent(kb, 'description', this.kbDescription);
        this._setIfPresent(kb, 'active', true);

        var kbId = kb.insert();
        if (!kbId) {
            throw new Error('Unable to create knowledge base record.');
        }

        return { sys_id: kbId, action: 'created' };
    },

    _ensureCategories: function(kbSysId, summary) {
        var definitions = this._getCategoryDefinitions();
        summary.categories.total = definitions.length;

        var categoryMap = {};
        for (var i = 0; i < definitions.length; i++) {
            var def = definitions[i];
            var parentId = def.parentKey ? categoryMap[def.parentKey] : '';
            var categoryInfo = this._ensureCategory(kbSysId, def, parentId);

            categoryMap[def.key] = categoryInfo.sys_id;
            summary.details.categories[def.key] = {
                sys_id: categoryInfo.sys_id,
                label: def.label,
                action: categoryInfo.action,
            };

            this._bump(summary.categories, categoryInfo.action);
        }

        return categoryMap;
    },

    _ensureCategory: function(kbSysId, definition, parentSysId) {
        var existing = new GlideRecord('kb_category');
        existing.addQuery('label', definition.label);
        if (existing.isValidField('kb_knowledge_base')) {
            existing.addQuery('kb_knowledge_base', kbSysId);
        }
        if (parentSysId) {
            if (existing.isValidField('parent')) {
                existing.addQuery('parent', parentSysId);
            } else if (existing.isValidField('parent_id')) {
                existing.addQuery('parent_id', parentSysId);
            }
        }
        existing.setLimit(1);
        existing.query();

        if (existing.next()) {
            var changedExisting = false;
            changedExisting = this._setIfChanged(existing, 'label', definition.label) || changedExisting;
            changedExisting = this._setIfChanged(existing, 'active', true) || changedExisting;
            changedExisting = this._setIfChanged(existing, 'kb_knowledge_base', kbSysId) || changedExisting;

            if (parentSysId) {
                changedExisting = this._setIfChanged(existing, 'parent', parentSysId) || changedExisting;
                changedExisting = this._setIfChanged(existing, 'parent_id', parentSysId) || changedExisting;
                changedExisting = this._setIfChanged(existing, 'parent_table', 'kb_category') || changedExisting;
            } else {
                changedExisting = this._setIfChanged(existing, 'parent_table', 'kb_knowledge_base') || changedExisting;
                changedExisting = this._setIfChanged(existing, 'parent_id', kbSysId) || changedExisting;
            }

            if (changedExisting) {
                existing.update();
                return { sys_id: existing.getUniqueValue(), action: 'updated' };
            }

            return { sys_id: existing.getUniqueValue(), action: 'existing' };
        }

        var category = new GlideRecord('kb_category');
        category.initialize();
        this._setIfPresent(category, 'label', definition.label);
        this._setIfPresent(category, 'active', true);
        this._setIfPresent(category, 'kb_knowledge_base', kbSysId);

        if (parentSysId) {
            this._setIfPresent(category, 'parent', parentSysId);
            this._setIfPresent(category, 'parent_id', parentSysId);
            this._setIfPresent(category, 'parent_table', 'kb_category');
        } else {
            this._setIfPresent(category, 'parent_table', 'kb_knowledge_base');
            this._setIfPresent(category, 'parent_id', kbSysId);
        }

        var categoryId = category.insert();
        if (!categoryId) {
            throw new Error('Unable to create category: ' + definition.label);
        }

        return { sys_id: categoryId, action: 'created' };
    },

    _ensureArticles: function(kbSysId, categoryMap, summary) {
        var articles = this._getArticleDefinitions();
        summary.articles.total = articles.length;

        for (var i = 0; i < articles.length; i++) {
            var article = articles[i];
            var categoryId = categoryMap[article.categoryKey] || '';
            var articleInfo = this._ensureArticle(kbSysId, categoryId, article);

            summary.details.articles[article.code] = {
                sys_id: articleInfo.sys_id,
                short_description: articleInfo.short_description,
                action: articleInfo.action,
            };

            this._bump(summary.articles, articleInfo.action);
        }
    },

    _ensureArticle: function(kbSysId, categoryId, article) {
        var title = article.code + ' - ' + article.title;
        var body = this._buildArticleBody(article);

        var existing = new GlideRecord('kb_knowledge');
        existing.addQuery('short_description', title);
        if (existing.isValidField('kb_knowledge_base')) {
            existing.addQuery('kb_knowledge_base', kbSysId);
        }
        existing.setLimit(1);
        existing.query();

        if (existing.next()) {
            var changedExisting = false;
            changedExisting = this._setIfChanged(existing, 'short_description', title) || changedExisting;
            changedExisting = this._setIfChanged(existing, 'text', body) || changedExisting;
            changedExisting = this._setIfChanged(existing, 'kb_knowledge_base', kbSysId) || changedExisting;
            changedExisting = this._setIfChanged(existing, 'kb_category', categoryId) || changedExisting;
            changedExisting = this._setIfChanged(existing, 'workflow_state', 'published') || changedExisting;
            changedExisting = this._setIfChanged(existing, 'article_type', 'text') || changedExisting;
            changedExisting = this._setIfChanged(existing, 'active', true) || changedExisting;

            if (changedExisting) {
                existing.update();
                return {
                    sys_id: existing.getUniqueValue(),
                    short_description: title,
                    action: 'updated',
                };
            }

            return {
                sys_id: existing.getUniqueValue(),
                short_description: title,
                action: 'existing',
            };
        }

        var knowledge = new GlideRecord('kb_knowledge');
        knowledge.initialize();
        this._setIfPresent(knowledge, 'short_description', title);
        this._setIfPresent(knowledge, 'text', body);
        this._setIfPresent(knowledge, 'kb_knowledge_base', kbSysId);
        this._setIfPresent(knowledge, 'kb_category', categoryId);
        this._setIfPresent(knowledge, 'workflow_state', 'published');
        this._setIfPresent(knowledge, 'article_type', 'text');
        this._setIfPresent(knowledge, 'active', true);

        var knowledgeId = knowledge.insert();
        if (!knowledgeId) {
            throw new Error('Unable to create article: ' + title);
        }

        return {
            sys_id: knowledgeId,
            short_description: title,
            action: 'created',
        };
    },

    _ensurePortalKbProperty: function(kbSysId, summary) {
        var targetValue = '?id=kb_home&kb_knowledge_base=' + kbSysId;

        var prop = new GlideRecord('sys_properties');
        prop.addQuery('name', this.kbUrlProperty);
        prop.setLimit(1);
        prop.query();

        if (prop.next()) {
            var changed = false;
            changed = this._setIfChanged(prop, 'value', targetValue) || changed;
            changed = this._setIfChanged(prop, 'type', 'string') || changed;
            changed = this._setIfChanged(prop, 'description', 'TOCC Service Portal Knowledge Base entry URL.') || changed;

            if (changed) {
                prop.update();
                this._bump(summary.properties, 'updated');
            } else {
                this._bump(summary.properties, 'existing');
            }
            return;
        }

        prop.initialize();
        this._setIfPresent(prop, 'name', this.kbUrlProperty);
        this._setIfPresent(prop, 'type', 'string');
        this._setIfPresent(prop, 'value', targetValue);
        this._setIfPresent(prop, 'description', 'TOCC Service Portal Knowledge Base entry URL.');
        this._setIfPresent(prop, 'is_private', false);
        prop.insert();
        this._bump(summary.properties, 'created');
    },

    _buildArticleBody: function(article) {
        var html = [];
        html.push('<h1>' + this._escapeHtml(article.code + ' - ' + article.title) + '</h1>');
        html.push('<p><strong>Audience:</strong> ' + this._escapeHtml(article.audience) + '</p>');
        html.push('<p>' + this._escapeHtml(article.summary) + '</p>');
        html.push('<h2>Steps and Guidance</h2>');
        html.push('<ul>');
        for (var i = 0; i < article.outline.length; i++) {
            html.push('<li>' + this._escapeHtml(article.outline[i]) + '</li>');
        }
        html.push('</ul>');

        if (article.vaTopic) {
            html.push('<p><strong>Virtual Agent topic:</strong> ' + this._escapeHtml(article.vaTopic) + '</p>');
        }

        if (article.note) {
            html.push('<p><em>Note:</em> ' + this._escapeHtml(article.note) + '</p>');
        }

        return html.join('');
    },

    _bump: function(bucket, action) {
        if (action === 'created') {
            bucket.created = bucket.created + 1;
            return;
        }
        if (action === 'updated') {
            bucket.updated = bucket.updated + 1;
            return;
        }
        bucket.existing = bucket.existing + 1;
    },

    _setIfPresent: function(record, fieldName, value) {
        if (!record.isValidField(fieldName)) {
            return false;
        }
        if (value === undefined || value === null) {
            return false;
        }
        record.setValue(fieldName, value);
        return true;
    },

    _setIfChanged: function(record, fieldName, value) {
        if (!record.isValidField(fieldName)) {
            return false;
        }
        var previous = this._safe(record.getValue(fieldName));
        var next = this._safe(value);
        if (previous === next) {
            return false;
        }
        record.setValue(fieldName, value);
        return true;
    },

    _safe: function(value) {
        if (value === null || value === undefined) {
            return '';
        }
        return String(value);
    },

    _escapeHtml: function(value) {
        return this._safe(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    _toErrorMessage: function(error) {
        if (!error) {
            return 'Unknown error';
        }
        if (error.message) {
            return String(error.message);
        }
        return String(error);
    },

    _getCategoryDefinitions: function() {
        return [
            { key: 'students', label: 'For Students' },
            { key: 'students_getting_started', label: 'Getting Started', parentKey: 'students' },
            { key: 'students_enrollments_waitlist', label: 'Enrollments and Waitlist', parentKey: 'students' },
            { key: 'students_attendance_cancellation', label: 'Attendance and Cancellation', parentKey: 'students' },
            { key: 'instructors', label: 'For Instructors' },
            { key: 'instructors_room_reservations', label: 'Room Reservations', parentKey: 'instructors' },
            { key: 'instructors_session_management', label: 'Session Management', parentKey: 'instructors' },
            { key: 'backoffice', label: 'For Backoffice' },
            { key: 'backoffice_operations_approvals', label: 'Operations and Approvals', parentKey: 'backoffice' },
            { key: 'policies_reference', label: 'Policies and Reference' },
        ];
    },

    _getArticleDefinitions: function() {
        return [
            {
                code: 'KB001',
                title: 'Welcome to the Training Portal',
                categoryKey: 'students_getting_started',
                audience: 'Student',
                summary: 'Overview of the training portal and key self-service actions.',
                outline: [
                    'What the Training Operations portal is used for.',
                    'How to access your role-aware pages.',
                    'Quick links to browse sessions, enrollments, and help center.',
                    'How to contact backoffice for access issues.'
                ],
                vaTopic: 'Find available training sessions'
            },
            {
                code: 'KB002',
                title: 'How to Browse and Search Training Sessions',
                categoryKey: 'students_getting_started',
                audience: 'Student',
                summary: 'How to find sessions by course, date, and location.',
                outline: [
                    'Open the Available Sessions page in the TOCC portal.',
                    'Apply course, location, and date filters to narrow results.',
                    'Read session details: seats, status, instructor, and dates.',
                    'Understand the difference between Open and Full statuses.'
                ],
                vaTopic: 'Find available training sessions'
            },
            {
                code: 'KB003',
                title: 'How to Enroll in a Training Session',
                categoryKey: 'students_enrollments_waitlist',
                audience: 'Student',
                summary: 'Step-by-step enrollment workflow for students.',
                outline: [
                    'Open session details and select Enroll.',
                    'Understand direct approval versus instructor approval mode.',
                    'Review enrollment confirmation messaging.',
                    'Check enrollment deadlines before requesting.'
                ],
                vaTopic: 'View my enrollments'
            },
            {
                code: 'KB004',
                title: 'How the Waitlist Works',
                categoryKey: 'students_enrollments_waitlist',
                audience: 'Student',
                summary: 'Explains promotion behavior when sessions are full.',
                outline: [
                    'When a student is placed on a waitlist.',
                    'How waitlist position is assigned.',
                    'How automatic promotion works when seats are released.',
                    'What notifications are sent during promotion events.'
                ],
                vaTopic: 'View my enrollments'
            },
            {
                code: 'KB005',
                title: 'How to Cancel Your Enrollment',
                categoryKey: 'students_enrollments_waitlist',
                audience: 'Student',
                summary: 'Enrollment cancellation policy and operational effects.',
                outline: [
                    'Where to cancel from My Enrollments.',
                    'Late cancellation window and restrictions.',
                    'How seat release affects waitlisted students.',
                    'When to escalate to backoffice for exceptions.'
                ],
                vaTopic: 'Cancel my enrollment'
            },
            {
                code: 'KB006',
                title: 'How to Confirm Your Attendance',
                categoryKey: 'students_attendance_cancellation',
                audience: 'Student',
                summary: 'Attendance confirmation deadlines and expected actions.',
                outline: [
                    'Why confirmation is required before the session.',
                    'How confirmation deadline is calculated.',
                    'How to confirm attendance from My Enrollments.',
                    'What happens to unconfirmed seats.'
                ],
                vaTopic: 'Confirm attendance'
            },
            {
                code: 'KB007',
                title: 'What Happens If I Do Not Show Up',
                categoryKey: 'students_attendance_cancellation',
                audience: 'Student',
                summary: 'No-show policy and attendance tracking behavior.',
                outline: [
                    'How instructors mark present, absent, or no-show.',
                    'Operational impact of repeated no-shows.',
                    'How to escalate last-minute attendance issues.'
                ],
            },
            {
                code: 'KB008',
                title: 'How to Request a Room Reservation',
                categoryKey: 'instructors_room_reservations',
                audience: 'Instructor',
                summary: 'End-to-end room reservation request flow.',
                outline: [
                    'Navigate to Service Catalog and open Create Room Reservation.',
                    'Provide required fields: course, room, dates, and participants.',
                    'Respect minimum advance notice and room capacity rules.',
                    'Understand review and approval flow after submission.'
                ],
                vaTopic: 'Request room reservation help'
            },
            {
                code: 'KB009',
                title: 'How to Request Extra Room Resources',
                categoryKey: 'instructors_room_reservations',
                audience: 'Instructor',
                summary: 'How to request projectors, AV equipment, and related resources.',
                outline: [
                    'Add resource needs during reservation or as follow-up.',
                    'Select resource types such as projector, AV, and microphone.',
                    'Track resource confirmation from backoffice operations.'
                ],
            },
            {
                code: 'KB010',
                title: 'How to Manage Your Training Session',
                categoryKey: 'instructors_session_management',
                audience: 'Instructor',
                summary: 'Session execution workflow for instructors.',
                outline: [
                    'Start the session with the Start Session action.',
                    'Capture attendance per student.',
                    'Close sessions when complete and trigger feedback flow.'
                ],
            },
            {
                code: 'KB011',
                title: 'How to Approve or Reject a Room Reservation',
                categoryKey: 'backoffice_operations_approvals',
                audience: 'Backoffice',
                summary: 'Operational guide for reservation approvals.',
                outline: [
                    'Find submitted reservations and review constraints.',
                    'Approve to auto-create training sessions.',
                    'Reject with clear work notes and student communication.',
                    'Monitor stale approvals for operational hygiene.'
                ],
            },
            {
                code: 'KB012',
                title: 'How to Handle Operational Exceptions',
                categoryKey: 'backoffice_operations_approvals',
                audience: 'Backoffice',
                summary: 'Handling late cancellations, seat adjustments, and escalations.',
                outline: [
                    'Override late cancellation when exception policy allows.',
                    'Manually adjust seat availability in controlled scenarios.',
                    'Reopen sessions when approved by operations governance.',
                    'Escalate configuration-level issues to application admins.'
                ],
            },
            {
                code: 'KB013',
                title: 'Training Operations Policies Summary',
                categoryKey: 'policies_reference',
                audience: 'All Roles',
                summary: 'Reference summary for all configurable policy thresholds.',
                outline: [
                    'Minimum advance notice for room reservations.',
                    'Late cancellation window.',
                    'Attendance confirmation lead time.',
                    'Waitlist mode behavior.',
                    'Feedback submission window.',
                    'Stale approval threshold.'
                ],
                note: 'Policy values are maintained by admins in the Training Configuration table.'
            }
        ];
    },

    type: 'KnowledgeBaseBootstrapService'
};`,
})
