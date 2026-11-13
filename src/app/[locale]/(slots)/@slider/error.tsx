'use client';

import { useTranslations } from 'next-intl';

import SlideSkeleton from '@/components/skeleton/SlideSkeleton';

export default function SliderError() {
    const t = useTranslations();

    return <SlideSkeleton isLoaded messageError={t('section_load_error')} />;
}
