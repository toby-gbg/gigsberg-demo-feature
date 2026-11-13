'use client';

import { FC, ReactNode } from 'react';
import { HelpCircle, TicketSlash, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { fallbackTranslation } from '@/utils/common';

import Dropdown, { DropdownElementProps } from '@/components/Dropdown';
import Link from '@/components/Link';

const MainHelpItem: FC<
    DropdownElementProps<{ name: string; targetUrl: string; icon: ReactNode }>
> = ({ name, targetUrl, icon }) => {
    return (
        <Link
            href={targetUrl}
            className="flex items-center gap-2 hover:bg-gray-200 px-2 py-1.5 rounded-lg w-full! hover:font-bold transition-all duration-150 cursor-pointer"
        >
            <span className="shrink-0">{icon}</span>
            <span className="text-xs min-[1475px]:text-sm text-nowrap">{name}</span>
        </Link>
    );
};

const MainHelp = () => {
    const t = useTranslations();

    const items = [
        { name: t('help'), targetUrl: '/faqs', icon: <HelpCircle size={16} /> },
        {
            name: fallbackTranslation(t('sell_tickets'), 'sell_tickets', 'Sell Tickets'),
            targetUrl: '/sell-ticket',
            icon: <TicketSlash size={16} />,
        },
        {
            name: fallbackTranslation(
                t('affiliate_program'),
                'affiliate_program',
                'Affiliate Program'
            ),
            targetUrl: '/affiliate-program',
            icon: <Users size={16} />,
        },
    ];

    return (
        <Dropdown<{ name: string; targetUrl: string; icon: ReactNode }>
            elements={Object.values(items)}
            title={t('help')}
            Element={MainHelpItem}
            containerClassName="z-250"
            className="flex flex-col gap-2 w-52"
            showArrow
            closeOnChoose
        />
    );
};

export default MainHelp;
