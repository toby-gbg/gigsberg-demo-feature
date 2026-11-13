import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import Headers from '@/lib/headers';
import { generateSiteName } from '@/utils/metaTitle';
import { generateIndexMetaTag } from '@/utils/seo';
import { ipApi } from '@/services/server/ip';
import { seoApi } from '@/services/server/seo';

import MainContainer from '@/components/MainContainer';
import MainTitle from '@/components/MainTitle';
import SubTitle from '@/components/SubTitle';

import DiscountSelector from './_components/DiscountSelector';

export async function generateMetadata({
    searchParams,
}: PageProps<'/[locale]/student-discount'>): Promise<Metadata> {
    const t = await getTranslations();
    const domainInfo = await Headers.getDomainInfo();
    const brandName = generateSiteName(t, domainInfo);
    const seoMetadata = await seoApi.getSeoMetadata({
        params: { type: 'student-discount' },
    });

    return {
        ...seoMetadata,
        title: seoMetadata?.seo_item.metatitle || t('meta_title_student_discount', { brandName }),
        ...generateIndexMetaTag(await searchParams),
    };
}

export default async function StudentDiscountPage() {
    const [t, countryIp] = await Promise.all([getTranslations(), ipApi.getCountryIp()]);
    const countryCode = countryIp?.code;

    return (
        <div>
            <div className="bg-[#0d0f1a] py-5">
                <MainContainer className="flex flex-col gap-2">
                    <div className="flex justify-center">
                        <div className="flex items-center bg-[#a8e6cf]/10 px-1 border border-[#a8e6cf] rounded-full h-6 text-[#a8e6cf]">
                            <span className="px-1 font-light text-xs text-center">
                                {t('hero_badge')}
                            </span>
                        </div>
                    </div>
                    <MainTitle className="mb-0 text-white text-xl md:text-2xl 2xl:text-2xl text-center">
                        {t.rich('hero_title', {
                            highlight: (chunks) => <span className="text-[#a8e6cf]">{chunks}</span>,
                        })}
                    </MainTitle>
                    <SubTitle
                        className="font-light text-gray-400 text-xs xl:text-xs text-center normal-case!"
                        title={t('hero_subtitle')}
                    />
                </MainContainer>
            </div>
            <MainContainer className="pb-6">
                <DiscountSelector countryCode={countryCode} />
            </MainContainer>
        </div>
    );
}
