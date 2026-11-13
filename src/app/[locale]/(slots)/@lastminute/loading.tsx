'use client';

import { useTranslations } from 'next-intl';

import useFont from '@/hooks/useFont';

import EventCardSkeleton from '@/components/event-card/EventCardSkeleton';
import SubTitle from '@/components/SubTitle';

export default function TrendingLoading() {
    const t = useTranslations();
    const { sectionTitleFont } = useFont();
    return (
        <>
            <SubTitle
                title={t('last_minute_events')}
                className="mb-7"
                fontClassName={sectionTitleFont.className}
            />
            <EventCardSkeleton
                showSubtitle
                showDate
                showDescription
                showBadges
                initSnapCount={4}
                cardClassName="h-[300px]! md:h-[330px]! lg:h-[375px]!"
            />
        </>
    );
}
