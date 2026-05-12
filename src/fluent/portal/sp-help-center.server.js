(function() {
    // Property-based settings avoid hard-coded URLs and make per-instance tuning easier.
    var supportPage = gs.getProperty('x_783010_tocc_a1.portal.support_page', '?id=tocc_help');

    data.kbUrl = gs.getProperty('x_783010_tocc_a1.portal.kb_url', '?id=kb_home');
    data.vaUrl = gs.getProperty('x_783010_tocc_a1.portal.va_url', '/$sn-va-web-client-app.do');
    data.supportPage = supportPage;
    data.supportEmail = gs.getProperty(
        'x_783010_tocc_a1.backoffice.email',
        gs.getProperty('x_783010_tocc_a1.portal.support_email', 'training-ops@company.com')
    );
    data.supportCatalogUrl = gs.getProperty(
        'x_783010_tocc_a1.portal.support_catalog_url',
        supportPage
    );
})();
