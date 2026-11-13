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

import TermsContent from './_components/TermsContent';

interface TermsMetadata {
    title: string;
    subtitle: string;
    eyebrow: string;
    updated: string;
    navigation: string;
    mobileNavigation: string;
    sellerPolicies: string;
}

export async function generateMetadata({
    searchParams,
}: PageProps<'/[locale]/terms-and-conditions'>): Promise<Metadata> {
    const t = await getTranslations();
    const domainInfo = await Headers.getDomainInfo();
    const brandName = generateSiteName(t, domainInfo);
    const seoMetadata = await seoApi.getSeoMetadata({
        params: { type: 'terms-and-conditions' },
    });

    return {
        ...seoMetadata,
        title:
            seoMetadata?.seo_item.metatitle || t('meta_title_terms_and_condition', { brandName }),
        ...generateIndexMetaTag(await searchParams),
    };
}

export default async function TermsAndConditionsPage({
    params,
}: PageProps<'/[locale]/terms-and-conditions'>) {
    const { locale } = await params;
    const { Content, metadata } = await getMdx<TermsMetadata>(locale, 'terms');

    return (
        <>
            <PageHeader title={metadata.title} eyebrow={metadata.eyebrow} meta={metadata.updated} />
            <main className="min-h-screen bg-[#f3f5f9]">
                <MainContainer className="py-6 md:py-9 lg:py-9">
                    <div className="grid grid-cols-1 items-start lg:grid-cols-[320px_minmax(0,100%)] lg:gap-x-13.5">
                        <SideNavNavigation
                            navigationLabel={metadata.navigation}
                            mobileLabel={metadata.mobileNavigation}
                            secondaryGroupLabel={metadata.sellerPolicies}
                        />
                        <TermsContent Content={Content} />
                    </div>
                </MainContainer>
            </main>
        </>
    );
}
