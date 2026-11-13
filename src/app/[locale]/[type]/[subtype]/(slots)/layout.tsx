import { ReactNode } from 'react';

import MainContainer from '@/components/MainContainer';
import TrustBenefitStrip from '@/components/TrustBenefitStrip';

export default async function Layout({
    header,
    upcomingBigMatches,
    tours,
    performers,
    events,
    children,
}: {
    header: ReactNode;
    upcomingBigMatches: ReactNode;
    tours: ReactNode;
    performers: ReactNode;
    events: ReactNode;
    children: ReactNode;
}) {
    return (
        <>
            {header}
            <MainContainer className={'mt-10'}>
                {upcomingBigMatches}
                {tours}
                {performers}
                {events}
                <TrustBenefitStrip className="mb-10" />
                {children}
            </MainContainer>
        </>
    );
}
