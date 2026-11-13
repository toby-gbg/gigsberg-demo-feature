'use client';

import { FC, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { EventTicket } from '@/interfaces/Event';
import { PerformerPriceDisplayedData } from '@/interfaces/trackers/GoogleAnalystic';
import { cn } from '@/lib/cn';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { fallbackTranslation } from '@/utils/common';
import { formatPrice } from '@/utils/currency.util';
import { checkEventHasValidMinPrice } from '@/utils/event';
import { GOOGLE_ANALYTICS_EVENT_KEYS } from '@/constants/trackers';

import { useSite } from '@/providers/SiteProvider';

interface EventMinPriceProps {
    event: EventTicket;
    currencyCode?: string;
}

const EventMinPrice: FC<EventMinPriceProps> = ({ event, currencyCode = 'USD' }) => {
    const locale = useLocale();

    const t = useTranslations();

    const hasTrackedPriceDisplay = useRef(false);

    const { domain, config } = useSite().domainInfo || {};

    const { useBrandStyling = false } = config?.features || {};

    const { lowestPrice = 0, lowestPriceCurrency = 'USD', performerId } = event || {};

    const eventId = String(event.eventId ?? event.id);

    const moneyDisplay = formatPrice(lowestPrice || 0, locale, lowestPriceCurrency || 'USD');

    const resolvedCurrency = currencyCode || lowestPriceCurrency || 'USD';

    const eventHasValidMinPrice = checkEventHasValidMinPrice({
        lowestPrice: lowestPrice ?? null,
        lowestPriceCurrency: lowestPriceCurrency ?? null,
    });

    useEffect(() => {
        if (!performerId || !eventHasValidMinPrice || hasTrackedPriceDisplay.current) {
            return;
        }

        hasTrackedPriceDisplay.current = true;

        GoogleAnalyticsTracker.triggerGA4Event<PerformerPriceDisplayedData>({
            event: GOOGLE_ANALYTICS_EVENT_KEYS.PERFORMER_PRICE_DISPLAYED,
            key: GOOGLE_ANALYTICS_EVENT_KEYS.PERFORMER_PRICE_DISPLAYED,
            data: {
                performer_id: performerId?.toString(),
                event_id: eventId,
                price: Number(lowestPrice),
                currency: resolvedCurrency,
                domain: domain ?? '',
            },
        });
    }, [performerId, eventHasValidMinPrice, eventId, lowestPrice, resolvedCurrency, domain]);

    if (!eventHasValidMinPrice) return null;

    return (
        <p
            className={cn(
                'mx-auto font-normal text-primary text-xs text-center',
                useBrandStyling && 'text-[#0F52A4]'
            )}
        >
            {fallbackTranslation(
                t('from_money', { money: moneyDisplay }),
                'from_money',
                `From ${moneyDisplay}`
            )}
        </p>
    );
};

export default EventMinPrice;
