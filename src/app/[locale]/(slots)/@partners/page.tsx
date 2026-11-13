import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import Headers from '@/lib/headers';
import { fallbackTranslation } from '@/utils/common';
import { websiteApi } from '@/services/server/website';
import { COMMON_PARTNERS } from '@/constants/partners';

import SubTitle from '@/components/SubTitle';

import '@/assets/css/globals.css';

import getFonts from '@/utils/getFonts';

import { CarouselItem } from '@/components/carousel/CarouselItem';
import { CarouselSection } from '@/components/carousel/CarouselSection';

export default async function PartnersSlot() {
    const [domainInfo, t, website] = await Promise.all([
        Headers.getDomainInfo(),
        getTranslations(),
        websiteApi.getWebsite(),
    ]);

    const font = getFonts(website.section_title_font);

    const partners = domainInfo.config?.features?.partners ?? COMMON_PARTNERS;

    return (
        <>
            <SubTitle
                title={fallbackTranslation(t('partners'), 'partners', 'Our Partners')}
                className="mb-5"
                fontClassName={font.className}
            />

            <CarouselSection
                isAutoPlay
                classNames={{
                    layout: 'flex items-center h-[55px]',
                    actions: 'pt-2',
                }}
            >
                {partners.map((logo, index) => (
                    <CarouselItem key={index} className="px-3 sm:px-5 w-1/2 sm:w-40 lg:w-48">
                        <div className="flex justify-center items-center h-15 sm:h-28">
                            <Image
                                src={logo}
                                alt={`Sponsor Logo ${index + 1}`}
                                className="py-1 w-auto max-h-15 object-contain"
                                height={60}
                                width={100}
                            />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselSection>
        </>
    );
}
