import { getTranslations } from 'next-intl/server';

import { fallbackTranslation } from '@/utils/common';
import { headingMapper } from '@/utils/mappers/seo/heading.mapper';
import { seoApi } from '@/services/server/seo';

import PageHeader from '@/components/PageHeader';

import SearchField from './SearchField';

export default async function FaqHeader() {
    const [seoData, t] = await Promise.all([
        seoApi.getSeoMetadata({ params: { type: 'faqs' } }),
        getTranslations(),
    ]);

    const headingData = seoData ? headingMapper(seoData) : null;
    const title =
        headingData?.h1 || fallbackTranslation(t('faq_title'), 'faq_title', 'How can we help?');
    const eyebrow = fallbackTranslation(t('help_center'), 'help_center', 'Help Center');
    const subtitle = t('faq_header_description');

    return (
        <PageHeader title={title} subtitle={subtitle} eyebrow={eyebrow} showSocialLinks={false}>
            <div className="mt-4">
                <SearchField />
            </div>
        </PageHeader>
    );
}
