import { ReactNode } from 'react';

import MainContainer from '@/components/MainContainer';

import OrganizationJsonLd from './_components/OrganizationJsonLd';

export default async function HomeLayout({
    slider,
    trending,
    lastminute,
    popular,
    mobileDownloadBanner,
    review,
    partners,
    cities,
}: {
    slider: ReactNode;
    trending: ReactNode;
    lastminute: ReactNode;
    popular: ReactNode;
    mobileDownloadBanner: ReactNode;
    review: ReactNode;
    partners: ReactNode;
    cities: ReactNode;
}) {
    return (
        <>
            <OrganizationJsonLd />
            {slider}

            <MainContainer className="space-y-10">
                {trending}
                {lastminute}
                {popular}
                {mobileDownloadBanner}
                {review}
                {partners}
                {cities}
            </MainContainer>
        </>
    );
}
