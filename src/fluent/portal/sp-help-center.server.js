(function() {
    // Property-based settings avoid hard-coded URLs and make per-instance tuning easier.
    data.kbUrl = gs.getProperty('x_783010_tocc_a1.portal.kb_url', '?id=kb_home');
    data.vaUrl = gs.getProperty('x_783010_tocc_a1.portal.va_url', '/$sn-va-web-client-app.do');
    data.supportEmail = gs.getProperty('x_783010_tocc_a1.portal.support_email', 'training-ops@company.com');
    data.supportCatalogUrl = gs.getProperty(
        'x_783010_tocc_a1.portal.support_catalog_url',
        '?id=tocc_sessions'
    );
})();
