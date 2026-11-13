'use client';

import { FC } from 'react';
import { useTranslations } from 'next-intl';

import Link from '@/components/Link';
import MainContainer from '@/components/MainContainer';
import MainTitle from '@/components/MainTitle';
import { buttonVariants } from '@/components/ui/Button';

interface ContactUsViewProps {
    h1?: string | null;
}
const ContactUsView: FC<ContactUsViewProps> = ({ h1 }) => {
    const t = useTranslations();
    const faqLinks = [
        'faq-noRefund',
        'faq-contactSupport',
        'faq-createAccount',
        'faq-giveTicket',
        'faq-whenRefund',
        'faq-isLegit',
    ];

    return (
        <MainContainer className="py-10">
            <MainTitle
                className="!text-3xl font-semibold text-gray-800 mb-2"
                title={h1 || t('page-faq-title')}
            />
            <p className="text-gray-600 mb-8">{t('notice')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-2">{t('faq-title')}</h2>
                    <p className="text-gray-700 mb-4">{t('faq-description')}</p>
                    <div className="flex mb-4">
                        <Link
                            prefetch={false}
                            href="/faqs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={buttonVariants()}
                        >
                            {t('faq-helpCentre')}
                        </Link>
                    </div>

                    <ul className="text-blue-700 text-sm space-y-1">
                        {faqLinks.map((key) => (
                            <li key={key}>
                                <Link
                                    prefetch={false}
                                    href="/faqs"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {t(key)}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-2">{t('contact-title')}</h2>
                    <p className="text-gray-700 mb-4">{t('contact-description')}</p>
                    <p className="text-sm text-gray-800 mb-1">
                        {t('contact-support')} &nbsp;&ndash;&nbsp;
                        <a
                            href="mailto:support@gigsberg.com"
                            className="text-blue-700"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            support@gigsberg.com
                        </a>
                    </p>
                    <p className="text-sm text-gray-800 mb-4">
                        {t('contact-selling')} &nbsp;&ndash;&nbsp;
                        <a
                            href="mailto:selling@gigsberg.com"
                            className="text-blue-700"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            selling@gigsberg.com
                        </a>
                    </p>
                    <p className="text-xs text-gray-600 italic">* {t('contact-notice')}</p>
                </div>
            </div>
        </MainContainer>
    );
};

export default ContactUsView;
