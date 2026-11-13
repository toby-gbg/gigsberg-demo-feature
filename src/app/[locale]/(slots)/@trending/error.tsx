'use client';

import { useTranslations } from 'next-intl';

import useFont from '@/hooks/useFont';

import EventCardSkeleton from '@/components/event-card/EventCardSkeleton';
import SubTitle from '@/components/SubTitle';

export default function TrendingError() {
    const t = useTranslations();
    const { sectionTitleFont } = useFont();
    return (
        <>
            <SubTitle
                title={t('trending_events')}
                className="mb-7"
                fontClassName={sectionTitleFont.className}
            />
            <EventCardSkeleton
                isLoaded
                showSubtitle
                showDescription
                messageError={t('section_load_error')}
                initSnapCount={4}
            />
        </>
    );
}
