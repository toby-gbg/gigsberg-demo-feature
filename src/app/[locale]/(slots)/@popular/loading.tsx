'use client';

import { useTranslations } from 'next-intl';

import useFont from '@/hooks/useFont';

import EventCardSkeleton from '@/components/event-card/EventCardSkeleton';
import SubTitle from '@/components/SubTitle';

export default function PopularLoading() {
    const t = useTranslations();
    const { sectionTitleFont } = useFont();
    return (
        <>
            <SubTitle
                title={t('popular_performers')}
                className="mb-7"
                fontClassName={sectionTitleFont.className}
            />
            <EventCardSkeleton showSubtitle showDate showDescription showBadges initSnapCount={4} />
        </>
    );
}
