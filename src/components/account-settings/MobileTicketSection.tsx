'use client';

import { CheckCircleIcon, ExternalLink, InfoIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { bold, contact } from '@/lib/translation/custom-block.lib';

interface MobileLink {
    id: number;
    value: string;
    ticketNumber: number;
}

interface MobileTicketSectionProps {
    mobileLinks: MobileLink[];
    email: string;
}

export default function MobileTicketSection({ mobileLinks, email }: MobileTicketSectionProps) {
    const t = useTranslations();

    const transferred = mobileLinks.length > 0;
    const urls = mobileLinks.map((link) => link.value);

    if (!transferred) {
        return (
            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
                <span className="mt-1 text-lg leading-none">
                    <InfoIcon className="size-4" />
                </span>
                <div>
                    <p className="text-base font-semibold">{t('mobile_link_transfer_pending')}</p>
                    <p className="mt-1 text-sm text-black">
                        {t.rich('mobile_link_transfer_pending_description', { email, bold })}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="bg-primary-50 border-primary-200 rounded-2xl border p-4">
                <p className="text-primary-700 flex items-center gap-1.5 text-lg font-semibold">
                    <span>
                        <CheckCircleIcon className="size-4" />
                    </span>
                    {t('mobile_link_ready')}
                </p>
                <p className="pt-4">{t.rich('mobile_link_description', { contact })}</p>
                <div className="mt-4 flex w-full gap-4 overflow-auto pb-4">
                    {urls.map((url, index) => (
                        <a
                            key={index}
                            href={url}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="bg-primary-600 hover:bg-primary-700 inline-flex h-10 items-center gap-2 rounded-2xl px-4 text-sm font-bold text-nowrap text-white transition-colors"
                        >
                            {t('view_my_ticket', {
                                index: urls.length > 1 ? index + 1 : '',
                            })}
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
