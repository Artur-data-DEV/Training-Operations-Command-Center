import { Record } from '@servicenow/sdk/core'

export const toccServiceCatalog = Record({
    $id: Now.ID['x_783010_tocc_a1_catalog_self_service'],
    table: 'sc_catalog',
    data: {
        title: 'TOCC Self-Service Catalog',
        description: 'Catalog for Training Operations Command Center self-service actions.',
        active: true,
    },
})

export const toccServiceCategory = Record({
    $id: Now.ID['x_783010_tocc_a1_catalog_category_training_operations'],
    table: 'sc_category',
    data: {
        title: 'Training Operations',
        description: 'Reservation and enrollment requests for TOCC.',
        sc_catalog: toccServiceCatalog,
        active: true,
    },
})
