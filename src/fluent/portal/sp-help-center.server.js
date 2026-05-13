(function() {
    data.kbUrl = '?id=kb_home';
    data.vaUrl = '/$sn-va-web-client-app.do';
    data.supportPage = '?id=tocc_help';
    data.supportEmail = 'training-ops@company.com';
    data.supportCatalogUrl = data.supportPage;

    try {
        // Single source of truth for Help Center links/escalation.
        var svc = new x_783010_tocc_a1.PortalApiService();
        var payload = JSON.parse(svc.getHelpCenterContext() || '{}');
        if (payload.success) {
            data.kbUrl = payload.kb_url || data.kbUrl;
            data.vaUrl = payload.va_url || data.vaUrl;
            data.supportPage = payload.support_page || data.supportPage;
            data.supportEmail = payload.backoffice_email || data.supportEmail;
            data.supportCatalogUrl = payload.support_catalog_url || data.supportPage;
        }
    } catch (error) {
        gs.warn('[TOCC][SP][HelpCenter] fallback defaults due to context read error: ' + error.message);
    }
})();
