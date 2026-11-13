'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import Order from '@/interfaces/Order';

import { useSite } from '@/providers/SiteProvider';

export default function ThankYouTitle({ order }: { order: Order }) {
    const websiteName = useSite().website?.name ?? '';
    const { orderUserEmail } = order ?? {};
    const t = useTranslations();

    return (
        <div className="space-y-4">
            <Image src="/ticket_success.png" alt="ticket-success" width={100} height={100} />
            <div className="space-y-2.5">
                <p className="font-semibold text-3xl md:text-4xl">
                    {t.rich('you_all_set', {
                        br: () => <br />,
                        name: websiteName,
                    })}
                </p>

                <p className="text-sm">
                    {t.rich('review_order', {
                        name: websiteName,
                        email: orderUserEmail || '',
                        highlight: (chunks) => <span className="font-medium">{chunks}</span>,
                    })}
                </p>
            </div>
        </div>
    );
}
