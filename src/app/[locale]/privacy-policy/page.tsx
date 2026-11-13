import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import Headers from '@/lib/headers';
import { getMdx } from '@/utils/getMdx';
import { generateSiteName } from '@/utils/metaTitle';
import { generateIndexMetaTag } from '@/utils/seo';
import { seoApi } from '@/services/server/seo';

import SideNavNavigation from '@/components/legal/SideNavNavigation';
import MainContainer from '@/components/MainContainer';
import PageHeader from '@/components/PageHeader';

import PrivacyContent from './_components/PrivacyContent';

interface PrivacyMetadata {
    title: string;
    subtitle: string;
    eyebrow: string;
    updated: string;
    navigation: string;
    mobileNavigation: string;
}

export async function generateMetadata({
    searchParams,
}: PageProps<'/[locale]/privacy-policy'>): Promise<Metadata> {
    const t = await getTranslations();
    const domainInfo = await Headers.getDomainInfo();
    const brandName = generateSiteName(t, domainInfo);
    const seoMetadata = await seoApi.getSeoMetadata({
        params: { type: 'privacy-policy' },
    });

    return {
        ...seoMetadata,
        title: seoMetadata?.seo_item.metatitle || t('meta_title_privacy_policy', { brandName }),
        ...generateIndexMetaTag(await searchParams),
    };
}

export default async function PrivacyPolicyPage({ params }: PageProps<'/[locale]/privacy-policy'>) {
    const { locale } = await params;
    const { Content, metadata } = await getMdx<PrivacyMetadata>(locale, 'privacy');

    return (
        <>
            <PageHeader
                title={metadata.title}
                subtitle={metadata.subtitle}
                eyebrow={metadata.eyebrow}
                meta={metadata.updated}
            />
            <main className="min-h-screen bg-[#f3f5f9]">
                <MainContainer className="py-6 md:py-9 lg:py-9">
                    <div className="grid grid-cols-1 items-start lg:grid-cols-[320px_minmax(0,100%)] lg:gap-x-13.5">
                        <SideNavNavigation
                            navigationLabel={metadata.navigation}
                            mobileLabel={metadata.mobileNavigation}
                        />
                        <PrivacyContent Content={Content} />
                    </div>
                </MainContainer>
            </main>
        </>
    );
}
