import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import Headers from '@/lib/headers';
import { fallbackTranslation } from '@/utils/common';
import { headingMapper } from '@/utils/mappers/seo/heading.mapper';
import { generateSiteName } from '@/utils/metaTitle';
import { generateIndexMetaTag } from '@/utils/seo';
import { seoApi } from '@/services/server/seo';

import MainContainer from '@/components/MainContainer';
import MainTitle from '@/components/MainTitle';

export async function generateMetadata({
    searchParams,
}: PageProps<'/[locale]/imprint'>): Promise<Metadata> {
    const t = await getTranslations();
    const domainInfo = await Headers.getDomainInfo();
    const brandName = generateSiteName(t, domainInfo);
    const seoMetadata = await seoApi.getSeoMetadata({
        params: { type: 'imprint' },
    });

    return {
        ...seoMetadata,
        title: seoMetadata?.seo_item.metatitle || t('meta_title_imprint', { brandName }),
        ...generateIndexMetaTag(await searchParams),
    };
}

export default async function ImprintPage() {
    const t = await getTranslations();
    const seoData = await seoApi.getSeoMetadata({ params: { type: 'imprint' } });
    const heading = seoData ? headingMapper(seoData) : null;

    return (
        <MainContainer>
            <MainTitle
                className="p-5 pl-0 !mb-0 !text-3xl font-bold text-primary"
                title={
                    heading?.h1 ||
                    fallbackTranslation(t('imprint-title'), 'imprint-title', 'Imprint')
                }
            />
            <div className="flex flex-col gap-y-3 bg-white p-5">
                <p>Gigsberg GmbH</p>
                <p>
                    {fallbackTranslation(
                        t('imprint-managing-director'),
                        'imprint-managing-director',
                        'Managing Director: Marieadele Küttel-Brambilla'
                    )}
                </p>
                <p>
                    {fallbackTranslation(
                        t('imprint-address'),
                        'imprint-address',
                        'Gewerbestrasse 5, 6330 Cham, Schweiz'
                    )}
                </p>
                <p>
                    {fallbackTranslation(
                        t('imprint-registration'),
                        'imprint-registration',
                        'Schweizer Handelsregister CHE-307.779.219 MWST'
                    )}
                </p>
                <p>
                    {fallbackTranslation(
                        t('imprint-support-info'),
                        'imprint-support-info',
                        'For support and information'
                    )}{' '}
                    -{' '}
                    <a href="mailto:support@gigsberg.com" className="text-primary hover:underline">
                        support@gigsberg.com
                    </a>
                </p>
                <p>
                    {fallbackTranslation(
                        t('imprint-ticket-info'),
                        'imprint-ticket-info',
                        'For ticket selling or reselling'
                    )}{' '}
                    -{' '}
                    <a href="mailto:selling@gigsberg.com" className="text-primary hover:underline">
                        selling@gigsberg.com
                    </a>
                </p>
                <a
                    href="https://api.whatsapp.com/send?phone=+16316869478&amp;text=Hello%20Gigsberg,%20I%20would%20like%20to%20inquire%20about"
                    target="_blank"
                    className="text-primary hover:underline"
                >
                    {fallbackTranslation(
                        t('imprint-whatsapp-info'),
                        'imprint-whatsapp-info',
                        'Contact us on WhatsApp'
                    )}
                </a>
            </div>
        </MainContainer>
    );
}
