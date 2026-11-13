'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { toggleMobileMenu } from '@/stores/modal';
import { extractShowId, fallbackTranslation } from '@/utils/common';

import { useSite } from '@/providers/SiteProvider';
import { useUser } from '@/providers/UserProvider';
import useIntlRouter from '@/hooks/useIntlRouter';

import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

import HeaderHelp from './HeaderHelp';
import HeaderLogin from './HeaderLogin';

const MainLinks = () => {
    const t = useTranslations();
    const router = useIntlRouter();
    const { listing } = useParams<{ listing?: string }>();

    const domainInfo = useSite().domainInfo;
    const user = useUser();

    const isTicketSellingEnabled = !domainInfo?.config?.features?.disableTicketSelling;
    const isAffiliateProgramEnabled = !domainInfo?.config?.features?.disableAffiliateProgram;
    const handleSellTicket = () => {
        toggleMobileMenu(false);

        if (user?.is_blocked) {
            return toast.add({ title: t('user_is_blocked'), type: 'error' });
        }

        return router.push(listing ? `/sell-ticket/${extractShowId(listing)}` : '/sell-ticket');
    };

    const handleAffiliateProgram = () => {
        toggleMobileMenu(false);
        router.push('/affiliate-program');
    };

    return (
        <div className="mt-4 flex flex-col gap-y-4 border-t border-on-header pt-4 text-on-header">
            <div className="flex items-center justify-between gap-2">
                <HeaderLogin mode="burger" />
                <HeaderHelp />
            </div>
            <div className="flex flex-col items-stretch gap-2">
                {isTicketSellingEnabled && (
                    <Button
                        onClick={handleSellTicket}
                        variant="ghost"
                        className="h-auto w-full rounded-full border border-on-header px-3 py-1 text-center text-sm text-on-header transition-colors duration-300 hover:bg-on-header hover:text-header-start"
                    >
                        {fallbackTranslation(t('sell_tickets'), 'sell_tickets', 'Sell Tickets')}
                    </Button>
                )}

                {isAffiliateProgramEnabled && (
                    <Button
                        onClick={handleAffiliateProgram}
                        variant="ghost"
                        className="h-auto w-full rounded-full border border-on-header px-3 py-1 text-center text-sm text-on-header transition-colors duration-300 hover:bg-on-header hover:text-header-start"
                    >
                        {fallbackTranslation(
                            t('affiliate_program'),
                            'affiliate_program',
                            'Affiliate Program'
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default MainLinks;
