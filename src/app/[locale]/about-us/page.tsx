import { FC } from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import AboutUsImg from '@/assets/img/AboutUs.svg';
import LogoAmex from '@/assets/img/amex_logo.webp';
import LogoAtletico from '@/assets/img/atleticomadrid.webp';
import IconSupport from '@/assets/img/customer-service.svg';
import IconDelivery from '@/assets/img/delivery-van.svg';
import LogoDHL from '@/assets/img/dhl.webp';
import LogoEspanyol from '@/assets/img/espanyonlogo.webp';
import LogoMastercard from '@/assets/img/mastercard.webp';
import IconGuarantee from '@/assets/img/refund.svg';
import LogoApproved from '@/assets/img/shopper.png';
import SpecialOlymp from '@/assets/img/special_olymp.png';
import LogoSpecialOlympics from '@/assets/img/specialolympics.webp';
import LogoVisa from '@/assets/img/visaNew.webp';
import Headers from '@/lib/headers';
import { headingMapper } from '@/utils/mappers/seo/heading.mapper';
import { generateSiteName } from '@/utils/metaTitle';
import { generateIndexMetaTag } from '@/utils/seo';
import { seoApi } from '@/services/server/seo';

import { CarouselItem } from '@/components/carousel/CarouselItem';
import { CarouselSection } from '@/components/carousel/CarouselSection';
import MainContainer from '@/components/MainContainer';
import MainTitle from '@/components/MainTitle';
import SubTitle from '@/components/SubTitle';

const partners = [
    { src: LogoSpecialOlympics, alt: 'Special Olympics' },
    { src: LogoVisa, alt: 'Visa' },
    { src: LogoMastercard, alt: 'Mastercard' },
    { src: LogoAmex, alt: 'American Express' },
    { src: LogoDHL, alt: 'DHL' },
    { src: LogoApproved, alt: 'Shopper Approved' },
    { src: LogoAtletico, alt: 'Atletico Madrid' },
    { src: LogoEspanyol, alt: 'Espanyol' },
];

export async function generateMetadata({
    searchParams,
}: PageProps<'/[locale]/about-us'>): Promise<Metadata> {
    const seoMetadata = await seoApi.getSeoMetadata({
        params: { type: 'about-us' },
    });
    const t = await getTranslations();
    const domainInfo = await Headers.getDomainInfo();
    const brandName = generateSiteName(t, domainInfo);

    return {
        ...seoMetadata,
        title: seoMetadata?.seo_item.metatitle || t('meta_title_about_us', { brandName }),
        ...generateIndexMetaTag(await searchParams),
    };
}

const AboutUsPage: FC = async () => {
    const t = await getTranslations();
    const seoData = await seoApi.getSeoMetadata({ params: { type: 'about-us' } });
    const heading = seoData ? headingMapper(seoData) : null;
    return (
        <div>
            <div className="relative h-[200px] md:h-[250px] lg:h-[300px] w-full">
                <Image
                    src={AboutUsImg}
                    alt="About Us Background"
                    layout="fill"
                    objectFit="cover"
                    sizes="100vw"
                    className="z-0"
                    priority
                />
                <MainContainer className="absolute inset-0 flex items-center justify-center">
                    <MainTitle
                        className="text-white md:text-5xl font-bold"
                        title={heading?.h1 || t('about-title')}
                    />
                </MainContainer>
            </div>

            <MainContainer>
                <div className="px-4 py-8 text-gray-800 text-center">
                    <p className="text-md md:text-lg">{t('about-description')}</p>
                </div>
                <div className="text-center px-4 py-12 max-w-4xl mx-auto">
                    <SubTitle className="font-bold !text-blue-700 mb-4" title={t('pledge-title')} />
                    <p className="text-md md:text-lg text-gray-700 mb-10">
                        {t('pledge-description1')}
                        <br />
                        {t('pledge-description2')}
                    </p>
                </div>
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-sm text-gray-800 px-4">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-blue-700 rounded-full w-24 h-24 flex items-center justify-center mb-4">
                                <Image src={IconGuarantee} alt="Guarantee" width={40} height={40} />
                            </div>
                            <p>{t('guarantee-text')}</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-blue-700 rounded-full w-24 h-24 flex items-center justify-center mb-4">
                                <Image src={IconDelivery} alt="Delivery" width={40} height={40} />
                            </div>
                            <p>{t('delivery-text')}</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-blue-700 rounded-full w-24 h-24 flex items-center justify-center mb-4">
                                <Image src={IconSupport} alt="Support" width={40} height={40} />
                            </div>
                            <p>{t('support-text')}</p>
                        </div>
                    </div>
                </div>
                <div className="px-4 py-16 relative">
                    <SubTitle
                        className="font-bold text-blue-700! text-center mb-8"
                        title={t('responsibility-title')}
                    />

                    <div className="relative flex flex-col md:flex-row gap-10">
                        <div className="shrink-0 w-55 h-55 relative rounded overflow-hidden self-center">
                            <Image
                                src={SpecialOlymp}
                                alt="Special Olympics Partnership"
                                fill
                                sizes="220px"
                                className="object-cover"
                            />
                        </div>

                        <div className="w-full md:pl-[270px]text-gray-800 text-md text-center leading-relaxed">
                            <p>
                                {t('responsibility-description1')}{' '}
                                <strong>{t('responsibility-description2')}</strong>.{' '}
                                {t('responsibility-description3')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full py-16">
                    <SubTitle
                        className="font-bold text-blue-700! text-center mb-12"
                        title={t('partners-title')}
                    />

                    <CarouselSection
                        isAutoPlay
                        classNames={{
                            layout: 'flex items-center h-[55px]',
                            actions: 'pt-2',
                        }}
                    >
                        {partners.map((logo) => (
                            <CarouselItem
                                key={logo.alt}
                                className="px-3 sm:px-5 w-1/2 sm:w-40 lg:w-48"
                            >
                                <div className="flex justify-center items-center h-15 sm:h-28">
                                    <Image
                                        src={logo.src}
                                        alt={logo.alt}
                                        className="py-1 w-auto max-h-15 object-contain"
                                        height={60}
                                        width={100}
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselSection>
                </div>
                <hr className="border-t border-gray-300 my-8" />

                <div className="px-6 pb-12 text-left text-sm text-gray-800">
                    <p className="font-semibold">{t('company-details-title')}</p>
                    <p>{t('company-number')} CHE-307.779.219</p>
                    <div className="flex items-center gap-1 mt-1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            className="w-4 h-4 text-gray-700"
                        >
                            <path d="M8 0a5.5 5.5 0 0 0-5.5 5.5c0 3.49 4.473 8.012 4.673 8.221a.5.5 0 0 0 .654 0C9.027 13.512 13.5 8.99 13.5 5.5A5.5 5.5 0 0 0 8 0zm0 8a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                        </svg>
                        <span>Gewerbestrasse 5, 6330 Cham, Switzerland</span>
                    </div>
                </div>
            </MainContainer>
        </div>
    );
};

export default AboutUsPage;
