import { ScriptInclude } from '@servicenow/sdk/core'

export const TOCCLoginRedirection = ScriptInclude({
    $id: Now.ID['x_783010_tocc_a1_script_include_login_redirection'],
    name: 'TOCCLoginRedirection',
    apiName: 'x_783010_tocc_a1.TOCCLoginRedirection',
    accessibleFrom: 'public',
    script: `var TOCCLoginRedirection = Class.create();
TOCCLoginRedirection.prototype = {
    initialize: function() {},

    /**
     * Entry point for login redirection.
     * Determines if the user should be sent to the TOCC portal or stay in the backend.
     */
    getEntryPage: function() {
        if (!gs.isLoggedIn()) {
            return null;
        }

        var hasPlatformAccess = gs.hasRole('admin') || 
                                gs.hasRole('x_783010_tocc_a1.admin') || 
                                gs.hasRole('x_783010_tocc_a1.backoffice') || 
                                gs.hasRole('x_783010_tocc_a1.manager');

        if (hasPlatformAccess) {
            return null;
        }

        var hasPortalAccess = gs.hasRole('x_783010_tocc_a1.instructor') || 
                              gs.hasRole('x_783010_tocc_a1.student');

        if (hasPortalAccess) {
            return '/tocc';
        }

        return '/tocc';
    },

    type: 'TOCCLoginRedirection'
};`,
})
