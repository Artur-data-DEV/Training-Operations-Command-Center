import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['x_783010_tocc_a1_script_include_virtual_agent_topic_service'],
    name: 'VirtualAgentTopicService',
    apiName: 'x_783010_tocc_a1.VirtualAgentTopicService',
    accessibleFrom: 'package_private',
    clientCallable: false,
    protectionPolicy: 'read',
    script: `var VirtualAgentTopicService = Class.create();
VirtualAgentTopicService.prototype = {
    initialize: function() {},

    getMainMenu: function() {
        return {
            success: true,
            menu: [
                { key: 'find_sessions', label: 'Find training sessions' },
                { key: 'my_enrollments', label: 'View my enrollments' },
                { key: 'confirm_attendance', label: 'Confirm my attendance' },
                { key: 'cancel_enrollment', label: 'Cancel an enrollment' },
                { key: 'training_policies', label: 'Training policies' },
                { key: 'escalate_backoffice', label: 'Talk to Backoffice' },
            ],
        };
    },

    getMainMenuAsJson: function() {
        return JSON.stringify(this.getMainMenu());
    },

    findAvailableSessions: function(courseId, locationId, fromDate, limit) {
        var payload = this._callPortal('getAvailableSessions', {
            sysparm_course: courseId || '',
            sysparm_location: locationId || '',
            sysparm_from_date: fromDate || '',
        });

        if (!payload.success) {
            return payload;
        }

        var max = parseInt(limit, 10) || 5;
        if (max < 1) {
            max = 1;
        }

        var sessions = payload.sessions || [];
        var trimmed = [];
        for (var i = 0; i < sessions.length && i < max; i++) {
            var s = sessions[i];
            trimmed.push({
                sys_id: s.sys_id,
                title: s.title,
                start_display: s.start_display,
                room_name: s.room_name,
                available_seats: s.available_seats,
                status: s.status,
            });
        }

        return {
            success: true,
            count: trimmed.length,
            sessions: trimmed,
            message: trimmed.length > 0
                ? 'Found ' + trimmed.length + ' matching session(s).'
                : 'No sessions found for the provided criteria.',
        };
    },

    findAvailableSessionsAsJson: function(courseId, locationId, fromDate, limit) {
        return JSON.stringify(this.findAvailableSessions(courseId, locationId, fromDate, limit));
    },

    getMyEnrollments: function(status) {
        var payload = this._callPortal('getMyEnrollments', {
            sysparm_status: status || '',
        });

        if (!payload.success) {
            return payload;
        }

        var enrollments = payload.enrollments || [];
        var formatted = [];
        for (var i = 0; i < enrollments.length; i++) {
            var e = enrollments[i];
            formatted.push({
                sys_id: e.sys_id,
                number: e.number,
                session_title: e.session_title,
                start_display: e.start_display,
                room_name: e.room_name,
                status: e.status,
                status_display: e.status_display,
                confirmed: String(e.confirmed) === 'true',
            });
        }

        return {
            success: true,
            count: formatted.length,
            enrollments: formatted,
        };
    },

    getMyEnrollmentsAsJson: function(status) {
        return JSON.stringify(this.getMyEnrollments(status));
    },

    confirmAttendance: function(enrollmentReference) {
        var resolved = this._resolveMyEnrollmentReference(
            enrollmentReference,
            ['approved'],
            'confirm attendance'
        );
        if (!resolved.success) {
            return resolved;
        }

        return this._callPortal('confirmMyAttendance', {
            sysparm_enrollment_id: resolved.enrollment.sys_id,
        });
    },

    confirmAttendanceAsJson: function(enrollmentReference) {
        return JSON.stringify(this.confirmAttendance(enrollmentReference));
    },

    cancelEnrollment: function(enrollmentReference) {
        var resolved = this._resolveMyEnrollmentReference(
            enrollmentReference,
            ['pending', 'approved', 'waitlisted'],
            'cancel enrollment'
        );
        if (!resolved.success) {
            return resolved;
        }

        return this._callPortal('cancelMyEnrollment', {
            sysparm_enrollment_id: resolved.enrollment.sys_id,
        });
    },

    cancelEnrollmentAsJson: function(enrollmentReference) {
        return JSON.stringify(this.cancelEnrollment(enrollmentReference));
    },

    getActionableEnrollments: function(action, limit) {
        var actionKey = this._normalizeToken(action);
        var max = parseInt(limit, 10) || 5;
        if (max < 1) {
            max = 1;
        }

        var payload = this._callPortal('getMyEnrollments', {
            sysparm_status: '',
        });
        if (!payload.success) {
            return payload;
        }

        var enrollments = payload.enrollments || [];
        var filtered = [];
        for (var i = 0; i < enrollments.length; i++) {
            var e = enrollments[i];
            if (this._isEnrollmentActionableForAction(e, actionKey)) {
                filtered.push({
                    sys_id: e.sys_id,
                    number: e.number,
                    session_title: e.session_title,
                    start_display: e.start_display,
                    room_name: e.room_name,
                    status: e.status,
                    status_display: e.status_display,
                    confirmed: String(e.confirmed) === 'true',
                });
            }
            if (filtered.length >= max) {
                break;
            }
        }

        return {
            success: true,
            action: actionKey || 'general',
            count: filtered.length,
            enrollments: filtered,
        };
    },

    getActionableEnrollmentsAsJson: function(action, limit) {
        return JSON.stringify(this.getActionableEnrollments(action, limit));
    },

    getTrainingPolicies: function() {
        var payload = this._callPortal('getTrainingPolicies', {});
        if (!payload.success) {
            return payload;
        }

        return {
            success: true,
            policies: payload.policies || {},
            links: payload.links || {},
            escalation: this.getBackofficeEscalation(),
        };
    },

    getTrainingPoliciesAsJson: function() {
        return JSON.stringify(this.getTrainingPolicies());
    },

    getBackofficeEscalation: function() {
        var help = this._getHelpCenterContext();
        return {
            success: true,
            channel: 'email',
            email: help.backoffice_email,
            portal_support_page: help.support_page,
            support_catalog_url: help.support_catalog_url,
            va_url: help.va_url,
        };
    },

    getBackofficeEscalationAsJson: function() {
        return JSON.stringify(this.getBackofficeEscalation());
    },

    _callPortal: function(methodName, params) {
        try {
            var svc = new PortalApiService();
            svc._testParams = params || {};

            if (!svc[methodName] || typeof svc[methodName] !== 'function') {
                return {
                    success: false,
                    message: 'Portal method not found: ' + methodName,
                };
            }

            var raw = svc[methodName]();
            return this._parseJsonSafe(raw);
        } catch (ex) {
            return {
                success: false,
                message: 'Virtual Agent backend call failed: ' + this._toErrorMessage(ex),
            };
        }
    },

    _parseJsonSafe: function(raw) {
        try {
            if (!raw) {
                return { success: false, message: 'Empty response from backend service.' };
            }
            if (typeof raw === 'object') {
                return raw;
            }
            return JSON.parse(String(raw));
        } catch (ex) {
            return {
                success: false,
                message: 'Failed to parse backend response: ' + this._toErrorMessage(ex),
            };
        }
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

    _getHelpCenterContext: function() {
        try {
            var svc = new PortalApiService();
            var raw = svc.getHelpCenterContext();
            var parsed = this._parseJsonSafe(raw);
            if (parsed && parsed.success) {
                return parsed;
            }
        } catch (ignore) {
            // Fallback to direct properties below.
        }

        var supportPage = gs.getProperty('x_783010_tocc_a1.portal.support_page', '?id=tocc_help');
        return {
            success: true,
            kb_url: gs.getProperty('x_783010_tocc_a1.portal.kb_url', '?id=kb_home'),
            va_url: gs.getProperty('x_783010_tocc_a1.portal.va_url', '/$sn-va-web-client-app.do'),
            support_page: supportPage,
            support_catalog_url: gs.getProperty('x_783010_tocc_a1.portal.support_catalog_url', supportPage),
            backoffice_email: gs.getProperty(
                'x_783010_tocc_a1.backoffice.email',
                gs.getProperty('x_783010_tocc_a1.portal.support_email', 'training-backoffice@example.com')
            ),
        };
    },

    _resolveMyEnrollmentReference: function(reference, allowedStatuses, actionLabel) {
        var normalized = this._normalizeToken(reference);
        if (!normalized) {
            return {
                success: false,
                message: 'Enrollment reference is required to ' + actionLabel + '.',
            };
        }

        var payload = this._callPortal('getMyEnrollments', {
            sysparm_status: '',
        });
        if (!payload.success) {
            return payload;
        }

        var enrollments = payload.enrollments || [];
        var matched = null;
        for (var i = 0; i < enrollments.length; i++) {
            var enrollment = enrollments[i];
            if (
                this._normalizeToken(enrollment.sys_id) === normalized ||
                this._normalizeToken(enrollment.number) === normalized
            ) {
                matched = enrollment;
                break;
            }
        }

        if (!matched) {
            return {
                success: false,
                message: 'Enrollment not found for current user: ' + String(reference),
            };
        }

        if (allowedStatuses && allowedStatuses.length > 0) {
            var status = this._normalizeToken(matched.status);
            var allowed = false;
            for (var j = 0; j < allowedStatuses.length; j++) {
                if (status === this._normalizeToken(allowedStatuses[j])) {
                    allowed = true;
                    break;
                }
            }

            if (!allowed) {
                return {
                    success: false,
                    message: 'Enrollment ' + (matched.number || matched.sys_id) + ' is not eligible to ' + actionLabel + '.',
                };
            }
        }

        return {
            success: true,
            enrollment: matched,
        };
    },

    _isEnrollmentActionableForAction: function(enrollment, actionKey) {
        var status = this._normalizeToken(enrollment.status);
        var confirmed = String(enrollment.confirmed) === 'true';

        if (actionKey === 'confirm_attendance') {
            return status === 'approved' && !confirmed;
        }
        if (actionKey === 'cancel_enrollment') {
            return status === 'pending' || status === 'approved' || status === 'waitlisted';
        }

        return true;
    },

    _normalizeToken: function(value) {
        if (value === null || value === undefined) {
            return '';
        }
        return String(value).replace(/^\\s+|\\s+$/g, '').toLowerCase();
    },

    type: 'VirtualAgentTopicService'
};`,
})
