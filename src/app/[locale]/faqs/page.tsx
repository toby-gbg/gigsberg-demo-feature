import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import Headers from '@/lib/headers';
import { generateSiteName } from '@/utils/metaTitle';
import { generateIndexMetaTag } from '@/utils/seo';
import { seoApi } from '@/services/server/seo';

import FaqFootnote from './_components/FaqFootnote';
import FaqHeader from './_components/FaqHeader/FaqHeader';
import FaqJsonLD from './_components/FAQJsonLD';
import FaqView from './_components/FaqView/FaqView';
import { FaqProvider } from './_providers/FaqContext';

export async function generateMetadata({
    searchParams,
}: PageProps<'/[locale]/faqs'>): Promise<Metadata> {
    const [t, seoMetadata, domainInfo, params] = await Promise.all([
        getTranslations(),
        seoApi.getSeoMetadata({
            params: { type: 'faqs' },
        }),
        Headers.getDomainInfo(),
        searchParams,
    ]);
    const brandName = generateSiteName(t, domainInfo);

    return {
        ...seoMetadata,
        title: seoMetadata?.seo_item.metatitle || t('meta_title_faqs', { brandName }),
        ...generateIndexMetaTag(params),
    };
}

export default async function Page() {
    return (
        <FaqProvider>
            <FaqJsonLD />
            <FaqHeader />
            <div className="mt-4">
                <FaqView />
            </div>
            <FaqFootnote />
        </FaqProvider>
    );
}
