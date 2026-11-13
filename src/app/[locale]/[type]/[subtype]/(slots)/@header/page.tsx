import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';

import SectionOverlay from '@/assets/img/Section_Overlay.png';
import { cn } from '@/lib/cn';
import { fallbackTranslation, removeTicketsSuffix } from '@/utils/common';
import { headingMapper } from '@/utils/mappers/seo/heading.mapper';
import { seoApi } from '@/services/server/seo';

import MainContainer from '@/components/MainContainer';
import MainTitle from '@/components/MainTitle';
import SocialLinks from '@/components/SocialLinks';

export default async function Page({ params }: PageProps<'/[locale]/[type]/[subtype]'>) {
    const { type, subtype } = await params;

    const [t, seoData, locale] = await Promise.all([
        getTranslations(),
        seoApi.getSeoMetadata({ params: { type, subtype } }),
        getLocale(),
    ]);
    const headingData = seoData ? headingMapper(seoData) : null;
    const { h1, entity } = headingData || {};

    const titleKey = `${removeTicketsSuffix(type)}_${subtype}`;
    const translatedName = fallbackTranslation(t(titleKey), titleKey, entity?.name || subtype);
    const title = h1 || t('type_title', { type: translatedName });
    const tagline = t('subtype_header_tagline', {
        name: translatedName,
    });

    return (
        <section>
            <div className="relative flex flex-col bg-header-start text-on-header border-y border-gray-500/50">
                <Image
                    src={SectionOverlay}
                    alt="Background"
                    fill
                    sizes="100vw"
                    className="opacity-25 object-center object-cover mix-blend-hard-light"
                    priority
                />
                <MainContainer>
                    <div className="relative flex flex-col justify-between py-7 lg:py-10">
                        <div className="flex justify-between items-end w-full">
                            <div>
                                <MainTitle
                                    title={title}
                                    className={cn(
                                        'col-span-12 md:col-span-8 mb-0',
                                        locale.includes('es') ? '' : 'capitalize'
                                    )}
                                />
                                <div className="text-on-header/55 text-sm xl:text-lg">
                                    {tagline}
                                </div>
                            </div>
                            <SocialLinks className="hidden md:flex text-on-header" />
                        </div>
                    </div>
                </MainContainer>
            </div>
        </section>
    );
}
