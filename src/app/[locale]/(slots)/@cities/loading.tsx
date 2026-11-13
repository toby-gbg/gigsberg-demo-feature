'use client';

import { useTranslations } from 'next-intl';

import useFont from '@/hooks/useFont';

import EventCardSkeleton from '@/components/event-card/EventCardSkeleton';
import MainContainer from '@/components/MainContainer';
import SubTitle from '@/components/SubTitle';

export default function CitiesLoading() {
    const t = useTranslations();
    const { sectionTitleFont } = useFont();
    return (
        <MainContainer>
            <SubTitle
                fontClassName={sectionTitleFont.className}
                title={t('explore_locations')}
                className="mb-7"
            />
            <EventCardSkeleton className="mb-10" />
        </MainContainer>
    );
}
