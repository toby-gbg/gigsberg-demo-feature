import { ReactNode } from 'react';

import MainContainer from '@/components/MainContainer';
import TrustBenefitStrip from '@/components/TrustBenefitStrip';

interface VenueLayoutProps {
    header: ReactNode;
    events: ReactNode;
}

export default function VenueLayout({ header, events }: VenueLayoutProps) {
    return (
        <div className="mb-10 flex flex-col gap-10">
            {header}

            <MainContainer className="space-y-10">
                <div className="space-y-6">{events}</div>
                <TrustBenefitStrip />
            </MainContainer>
        </div>
    );
}
