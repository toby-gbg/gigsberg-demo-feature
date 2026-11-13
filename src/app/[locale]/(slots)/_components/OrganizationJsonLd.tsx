import Headers from '@/lib/headers';
import { JsonLdFactory } from '@/utils/mappers/jsonLd/jsonLd.mapper';

import JsonLdScript from '@/components/JsonLD/JsonLdScript';

export default async function OrganizationJsonLd() {
    const { config } = await Headers.getDomainInfo();
    const { social, jsonLd } = config?.seo || {};
    const strategy = jsonLd?.schemaStrategy;
    const isOrganizationActive = jsonLd?.activeSchemas?.includes('Organization');

    if (!isOrganizationActive || !strategy) return null;

    return (
        <JsonLdScript
            id={strategy.orgSchemaId}
            jsonLd={JsonLdFactory.buildOrganization(strategy, social)}
        />
    );
}
