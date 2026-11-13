import { ReactNode } from 'react';

import MainContainer from '@/components/MainContainer';
import TrustBenefitStrip from '@/components/TrustBenefitStrip';

export default async function TypeLayout({
    slider,
    subtypes,
    popularPerformers,
    popularEvents,
    children,
}: {
    slider: ReactNode;
    subtypes: ReactNode;
    popularTours: ReactNode;
    popularPerformers: ReactNode;
    popularEvents: ReactNode;
    children: ReactNode;
}) {
    return (
        <>
            {slider}
            <MainContainer className="mt-10">
                {subtypes}
                {popularPerformers}
                {popularEvents}
                <TrustBenefitStrip className="mb-10" />
                {children}
            </MainContainer>
        </>
    );
}
