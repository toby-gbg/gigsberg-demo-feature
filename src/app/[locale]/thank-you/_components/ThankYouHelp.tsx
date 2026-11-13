'use client';

import { AnchorHTMLAttributes } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { useSite } from '@/providers/SiteProvider';

interface Props {
    eventId: number;
}

export default function ThankYouHelp({ eventId }: Props) {
    const websiteName = useSite().website?.name ?? '';
    const t = useTranslations();

    return (
        <div className="flex flex-col md:flex-row gap-4">
            <LinkCard
                img="ticket_help"
                title={t('need_help')}
                description={t('contact_via', { name: 'Whatsapp' })}
                href="https://wa.me/+16316869478"
                target="_blank"
                rel="noopener noreferrer"
            />
            <LinkCard
                img="ticket_resell"
                title={t('can_not_make_to_event')}
                description={t('resell_them_on', { name: websiteName })}
                href={`/sell-ticket/${eventId}`}
            />
        </div>
    );
}

interface LinkCardProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    title: string;
    description: string;
    img: string;
}

const LinkCard = ({ title, description, img, ...props }: LinkCardProps) => {
    return (
        <a
            className="border border-neutral-400 rounded-2xl p-3 w-full hover:shadow-xs hover:border-border transition-all"
            {...props}
        >
            <Image
                src={`/${img}.png`}
                alt="ticket-resell"
                width={46}
                height={46}
                className="rounded-lg overflow-hidden border mb-4"
            />

            <p className="font-semibold">{title}</p>
            <p className="text-sm text-foreground-600">{description}</p>
        </a>
    );
};
