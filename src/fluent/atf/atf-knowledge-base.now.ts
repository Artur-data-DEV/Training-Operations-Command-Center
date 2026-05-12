import { Test } from '@servicenow/sdk/core'

// ---------------------------------------------------------------------------
// GROUP: KnowledgeBaseBootstrapService
// TEST-031
// ---------------------------------------------------------------------------

Test(
    {
        $id: Now.ID['x_783010_tocc_a1_atf_kb_bootstrap_idempotent'],
        name: '[TOCC][KB] bootstrap is successful and idempotent',
        description: 'KnowledgeBaseBootstrapService creates required KB artifacts and does not create duplicates on re-run.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['x_783010_tocc_a1_atf_kb_bootstrap_idempotent_script'],
            script: `
                var svc = new x_783010_tocc_a1.KnowledgeBaseBootstrapService();

                var first = svc.bootstrap();
                gs.assertTrue(first.success === true, 'First bootstrap call failed: ' + JSON.stringify(first));
                gs.assertTrue(first.knowledge_base && first.knowledge_base.sys_id, 'Knowledge base sys_id must be present.');
                gs.assertTrue(first.categories.total === 10, 'Expected 10 categories in bootstrap plan.');
                gs.assertTrue(first.articles.total === 13, 'Expected 13 articles in bootstrap plan.');

                var second = svc.bootstrap();
                gs.assertTrue(second.success === true, 'Second bootstrap call failed: ' + JSON.stringify(second));
                gs.assertTrue(second.categories.created === 0, 'Second run should not create additional categories.');
                gs.assertTrue(second.articles.created === 0, 'Second run should not create additional articles.');
            `,
        })
    }
)
