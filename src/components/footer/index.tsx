import { Suspense } from 'react';
import Image from 'next/image';
import { all } from 'better-all';
import { getLocale, getTranslations } from 'next-intl/server';

import type Website from '@/interfaces/Website';
import Headers from '@/lib/headers';
import { isLightColor } from '@/utils/color';
import { fallbackTranslation } from '@/utils/common';
import { SOCIAL_FOLLOW } from '@/constants/footer';
import { PAYMENTS } from '@/constants/payments';

import Link from '@/components/Link';
import MainContainer from '@/components/MainContainer';

import SectionVisibility, { shouldShowFooterMainContent } from '../SectionVisibility';
import FooterEvents from './FooterEvents';
import FooterSubscribeNewsletter from './FooterSubscribeNewsletter';
import ImageLicenses from './ImageLicenses';

export default async function Footer({
    showSection,
    website,
}: {
    showSection?: (segments: string[]) => boolean;
    website?: Website | null;
} = {}) {
    const { t, locale, domainInfo } = await all({
        async t() {
            return getTranslations();
        },
        async locale() {
            return getLocale();
        },
        async domainInfo() {
            return Headers.getDomainInfo();
        },
    });

    const { text_on_header = '', logo = '', logo_es } = website || {};
    const { config } = domainInfo || {};
    const paymentSrc = isLightColor(text_on_header) ? '/payments/' : '/payments/color/';
    const useSpanishLogo = config?.features?.useSpanishLogo ?? true;
    const logoSrc = useSpanishLogo && locale.includes('es') ? logo_es || logo : logo;

    return (
        <SectionVisibility showSection={showSection}>
            <footer className="border-t border-gray-500/50 py-5 bg-header">
                <MainContainer>
                    <SectionVisibility showSection={shouldShowFooterMainContent}>
                        <section className="pb-4">
                            <div className="gap-4 md:gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-6">
                                    {logoSrc && (
                                        <div className="flex flex-col justify-start items-start">
                                            <Link
                                                prefetch={false}
                                                href="/"
                                                className="cursor-pointer"
                                            >
                                                <Image
                                                    src={logoSrc}
                                                    alt="Logo"
                                                    priority
                                                    quality={50}
                                                    className="aspect-auto"
                                                    width={150}
                                                    height={64}
                                                />
                                            </Link>
                                        </div>
                                    )}
                                    <div id="footer_signup" className="space-y-4">
                                        <h4 className="text-body-s text-on-header font-semibold!">
                                            {fallbackTranslation(
                                                t('sign_up_for_our_newsletter'),
                                                'sign_up_for_our_newsletter',
                                                'Sign up for our newsletter'
                                            )}
                                        </h4>
                                        <FooterSubscribeNewsletter />
                                    </div>
                                    <div id="footer_follow" className="space-y-4">
                                        <h4 className="font-semibold! text-body-s text-on-header">
                                            {fallbackTranslation(
                                                t('follow_us'),
                                                'follow_us',
                                                'Follow us'
                                            )}
                                        </h4>
                                        <ul className="flex flex-wrap justify-start items-center gap-x-2">
                                            {SOCIAL_FOLLOW.map((follow) => {
                                                const icon = follow.icon();
                                                return (
                                                    <li
                                                        key={follow.id}
                                                        className="flex flex-col justify-center items-center text-on-header"
                                                    >
                                                        <Link
                                                            prefetch={false}
                                                            href={follow.href}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            aria-label={follow.id.toUpperCase()}
                                                            className="flex flex-col justify-center items-center rounded-xl size-10 transition-all"
                                                        >
                                                            <span
                                                                aria-hidden="true"
                                                                className="bg-current size-6"
                                                                style={{
                                                                    mask: `url(${icon.src}) center / contain no-repeat`,
                                                                    WebkitMask: `url(${icon.src}) center / contain no-repeat`,
                                                                }}
                                                            />
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                    <div id="footer_payment" className="space-y-2">
                                        <h4 className="flex flex-col justify-center items-start font-semibold! text-body-s text-on-header">
                                            {fallbackTranslation(
                                                t('we_accept'),
                                                'we_accept',
                                                'We accept'
                                            )}
                                        </h4>
                                        <div className="flex flex-wrap justify-start items-center gap-x-2">
                                            {PAYMENTS.map((payment) => (
                                                <Image
                                                    key={payment}
                                                    title={payment}
                                                    src={`${paymentSrc}${payment}.png`}
                                                    alt={payment}
                                                    width={54}
                                                    height={30}
                                                    className="object-contain"
                                                    loading="lazy"
                                                    quality={75}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div id="footer-feature-events" className="space-y-2">
                                    <h4 className="font-semibold! text-body-s text-on-header">
                                        {fallbackTranslation(
                                            t('featured_events'),
                                            'featured_events',
                                            'Featured events'
                                        )}
                                    </h4>
                                    <ul className="text-body-s text-on-header">
                                        <Suspense>
                                            <FooterEvents isFeatured />
                                        </Suspense>
                                    </ul>
                                </div>

                                <div id="footer-popular-events" className="space-y-2">
                                    <h4 className="font-semibold! text-body-s text-on-header">
                                        {fallbackTranslation(
                                            t('trending_events'),
                                            'trending_events',
                                            'Trending events'
                                        )}
                                    </h4>
                                    <ul className="text-body-s text-on-header">
                                        <Suspense>
                                            <FooterEvents />
                                        </Suspense>
                                    </ul>
                                </div>

                                <div id="help-centre" className="space-y-2">
                                    <h4 className="font-semibold! text-body-s text-on-header">
                                        {fallbackTranslation(
                                            t('help_center'),
                                            'help_center',
                                            'Help center'
                                        )}
                                    </h4>
                                    <ul className="space-y-1 text-body-s text-on-header">
                                        <li>
                                            <Link
                                                prefetch={false}
                                                href="/faqs"
                                                className="inline-block py-1.5 hover:underline hover:underline-offset-4"
                                            >
                                                {fallbackTranslation(
                                                    t('help_center'),
                                                    'help_center',
                                                    'Help center'
                                                )}
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                prefetch={false}
                                                href="/terms-and-conditions"
                                                className="inline-block py-1.5 hover:underline hover:underline-offset-4"
                                            >
                                                {fallbackTranslation(
                                                    t('terms'),
                                                    'terms',
                                                    'Term and Conditions'
                                                )}
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                prefetch={false}
                                                href="/contact-us"
                                                className="inline-block py-1.5 hover:underline hover:underline-offset-4"
                                            >
                                                {fallbackTranslation(
                                                    t('contact_us'),
                                                    'contact_us',
                                                    'Contact us'
                                                )}
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                prefetch={false}
                                                href="/privacy-policy"
                                                className="inline-block py-1.5 hover:underline hover:underline-offset-4"
                                            >
                                                {fallbackTranslation(
                                                    t('privacy_policy'),
                                                    'privacy_policy',
                                                    'Privacy Policy'
                                                )}
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                prefetch={false}
                                                href="/about-us"
                                                className="inline-block py-1.5 hover:underline hover:underline-offset-4"
                                            >
                                                {fallbackTranslation(
                                                    t('about_us'),
                                                    'about_us',
                                                    'About Us'
                                                )}
                                            </Link>
                                        </li>
                                        {!config?.features?.disableAffiliateProgram && (
                                            <li>
                                                <Link
                                                    prefetch={false}
                                                    href="/affiliate-program"
                                                    className="inline-block py-1.5 hover:underline hover:underline-offset-4"
                                                >
                                                    {fallbackTranslation(
                                                        t('affiliate_program'),
                                                        'affiliate_program',
                                                        'Affiliate Program'
                                                    )}
                                                </Link>
                                            </li>
                                        )}
                                        {config?.features?.showStudentDiscount && (
                                            <li>
                                                <Link
                                                    prefetch={false}
                                                    href="/student-discount"
                                                    className="inline-block py-1.5 hover:underline hover:underline-offset-4"
                                                >
                                                    {fallbackTranslation(
                                                        t('student_discount'),
                                                        'student_discount',
                                                        'Student Discount'
                                                    )}
                                                </Link>
                                            </li>
                                        )}

                                        <li>
                                            <Link
                                                prefetch={false}
                                                href="/imprint"
                                                className="inline-block py-1.5 hover:underline hover:underline-offset-4"
                                            >
                                                {fallbackTranslation(
                                                    t('imprint'),
                                                    'imprint',
                                                    'Imprint'
                                                )}
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>
                    </SectionVisibility>

                    <hr className="w-full border-t border-gray-500/50 pb-4" />

                    <section className="flex flex-col items-center justify-center gap-2">
                        <div className="flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-4 sm:text-left">
                            <p className="mt-2 text-caption text-on-header text-center">
                                &copy; {new Date().getFullYear()}{' '}
                                {fallbackTranslation(
                                    t('all_rights_reserved'),
                                    'all_rights_reserved',
                                    'All Rights Reserved'
                                )}{' '}
                                Gigsberg GmbH * Gewerbestrasse 5, 6330 Cham, Suisse{' '}
                                {fallbackTranslation(
                                    t('programmed_by_gigsberg'),
                                    'programmed_by_gigsberg',
                                    'Programmed by Gigsberg'
                                )}{' '}
                                v1.0.0
                            </p>
                        </div>

                        <ImageLicenses />
                    </section>
                </MainContainer>
            </footer>
        </SectionVisibility>
    );
}
