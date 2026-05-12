# Knowledge Base Bootstrap Runbook

## Objective

Provision and keep synchronized the TOCC knowledge base baseline via code:

- Knowledge base: `Training Operations Knowledge Base`
- Category tree (10 nodes)
- Article catalog `KB001` to `KB013`
- Portal property `x_783010_tocc_a1.portal.kb_url`

## Prerequisites

1. Latest package deployed from this repository.
2. User running script has rights on Knowledge tables (`admin` is sufficient).
3. Run script in application scope `x_783010_tocc_a1`.

## Execute Bootstrap

Navigate to **System Definition -> Scripts - Background** and run:

```javascript
var result = new x_783010_tocc_a1.KnowledgeBaseBootstrapService().bootstrap();
gs.info('[TOCC][KB] ' + JSON.stringify(result));
```

## Expected Result

`result.success` must be `true` and:

- `result.knowledge_base.sys_id` is populated
- `result.categories.total` equals `10`
- `result.articles.total` equals `13`

On first run, `created` counters should be non-zero.
On subsequent runs, `created` counters should remain `0` (idempotent behavior).

## Validation Checklist

- [ ] `kb_knowledge_base` contains `Training Operations Knowledge Base`
- [ ] `kb_category` hierarchy matches `KNOWLEDGE_BASE_PLAN.md`
- [ ] `kb_knowledge` includes 13 articles with titles prefixed `KB001` to `KB013`
- [ ] `sys_properties` value for `x_783010_tocc_a1.portal.kb_url` points to `?id=kb_home&kb_knowledge_base=<sys_id>`
- [ ] Help Center page opens the TOCC KB correctly
