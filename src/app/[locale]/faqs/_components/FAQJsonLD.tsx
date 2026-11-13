'use client';

import { JsonLdFactory } from '@/utils/mappers/jsonLd/jsonLd.mapper';

import { useSite } from '@/providers/SiteProvider';

import JsonLdScript from '@/components/JsonLD/JsonLdScript';

import useTranslationHelp from '../_hooks/useTranslationHelp';

export default function FaqJsonLD() {
    const domainInfo = useSite().domainInfo;
    const HELPS = useTranslationHelp();
    const faqSchema = JsonLdFactory.buildFaqPage(HELPS);
    const isActive = domainInfo?.config?.seo?.jsonLd?.activeSchemas?.includes('FAQ');

    return isActive ? <JsonLdScript id="faqs-jsonld" jsonLd={faqSchema} /> : null;
}
