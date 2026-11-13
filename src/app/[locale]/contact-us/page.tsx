import { FC } from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import Headers from '@/lib/headers';
import { headingMapper } from '@/utils/mappers/seo/heading.mapper';
import { generateSiteName } from '@/utils/metaTitle';
import { generateIndexMetaTag } from '@/utils/seo';
import { seoApi } from '@/services/server/seo';

import ContactUsView from './_components/ContactUsView';

export async function generateMetadata({
    searchParams,
}: PageProps<'/[locale]/contact-us'>): Promise<Metadata> {
    const t = await getTranslations();
    const domainInfo = await Headers.getDomainInfo();
    const brandName = generateSiteName(t, domainInfo);
    const seoMetadata = await seoApi.getSeoMetadata({
        params: { type: 'contact-us' },
    });

    return {
        ...seoMetadata,
        title: seoMetadata?.seo_item.metatitle || t('meta_title_contact_us', { brandName }),
        ...generateIndexMetaTag(await searchParams),
    };
}

const ContactUsPage: FC = async () => {
    const seoData = await seoApi.getSeoMetadata({ params: { type: 'contact-us' } });
    const heading = seoData ? headingMapper(seoData) : null;
    return <ContactUsView h1={heading?.h1 || null} />;
};

export default ContactUsPage;
