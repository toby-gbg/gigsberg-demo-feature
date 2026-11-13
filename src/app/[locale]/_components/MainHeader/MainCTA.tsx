'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { extractShowId, fallbackTranslation } from '@/utils/common';

import { useSite } from '@/providers/SiteProvider';
import { useUser } from '@/providers/UserProvider';
import useIntlRouter from '@/hooks/useIntlRouter';

import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

const MainCTA = () => {
    const t = useTranslations();
    const { listing } = useParams<{ listing?: string }>();

    const user = useUser();
    const domainInfo = useSite().domainInfo;
    const { config } = domainInfo ?? {};

    const router = useIntlRouter();

    const onSellTicketClick = () => {
        if (user?.is_blocked) {
            return toast.add({ title: t('user_is_blocked'), type: 'error' });
        }
        return router.push(listing ? `/sell-ticket/${extractShowId(listing)}` : '/sell-ticket');
    };

    const onAffiliateClick = () => {
        router.push('/affiliate-program');
    };

    return (
        <div className="flex min-[1920px]:flex-row flex-col justify-center min-[1920px]:items-center gap-2 ml-2">
            {!config?.features?.disableTicketSelling && (
                <Button
                    onClick={onSellTicketClick}
                    variant="ghost"
                    className="hover:bg-on-header px-3 py-1 border border-on-header rounded-full h-auto text-on-header hover:text-header-start max-[1475px]:text-xs text-sm text-nowrap transition-colors duration-300"
                >
                    {fallbackTranslation(t('sell_tickets'), 'sell_tickets', 'Sell Tickets')}
                </Button>
            )}

            {!config?.features?.disableAffiliateProgram && (
                <Button
                    onClick={onAffiliateClick}
                    variant="ghost"
                    className="hover:bg-on-header px-3 py-1 border border-on-header rounded-full h-auto text-on-header hover:text-header-start max-[1475px]:text-xs text-sm text-nowrap transition-colors duration-300"
                >
                    {fallbackTranslation(
                        t('affiliate_program'),
                        'affiliate_program',
                        'Affiliate Program'
                    )}
                </Button>
            )}
        </div>
    );
};

export default MainCTA;
