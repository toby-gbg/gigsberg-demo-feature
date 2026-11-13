'use client';

import { useTranslations } from 'next-intl';

import HpSlide from '@/interfaces/HpSlide';
import { Type } from '@/interfaces/Subtype';
import { fallbackTranslation } from '@/utils/common';

import useFooterImages from '@/hooks/useFooterImages';

import HeroCarousel from '@/components/HeroCarousel';
import MainTitle from '@/components/MainTitle';

export default function TypePageSlider({
    h1,
    slides,
    type,
    currencyCode,
}: {
    h1: string | undefined;
    slides: HpSlide[];
    type: Type;
    currencyCode: string;
}) {
    useFooterImages({ slides, clearOnUnmount: false });
    const t = useTranslations();

    const titleKey = type.name_url;
    const typeTranslation = t(titleKey);
    const translatedName = fallbackTranslation(typeTranslation, titleKey, type.name);
    const title = h1 || t('type_title', { type: titleKey ? typeTranslation : translatedName });

    return (
        <>
            <MainTitle title={title} hidden />
            {slides.length > 0 && (
                <HeroCarousel
                    initialSlides={slides}
                    currencyCode={currencyCode}
                    type={type.name_url}
                />
            )}
        </>
    );
}
