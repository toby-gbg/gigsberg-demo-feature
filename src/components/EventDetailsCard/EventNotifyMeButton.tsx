'use client';

import { MouseEvent } from 'react';
import { useTranslations } from 'next-intl';

import { EventTicket } from '@/interfaces/Event';
import { NotifyMeClickData } from '@/interfaces/trackers/GoogleAnalystic';
import { cn } from '@/lib/cn';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { fallbackTranslation } from '@/utils/common';
import { isEventAvailableForSale as checkIsEventOpenForSale } from '@/utils/event';
import { getNotifyMeTriggerState } from '@/utils/notifyMeAnalytics.util';
import { GOOGLE_ANALYTICS_EVENT_KEYS } from '@/constants/trackers';

import { useSite } from '@/providers/SiteProvider';
import { useUser } from '@/providers/UserProvider';

import { Button } from '@/components/ui/Button';

interface Props {
    event: EventTicket;
    onClick?: () => void;
}

function EventNotifyMeButton({ event, onClick }: Props) {
    const t = useTranslations();

    const { performerId } = event || {};

    const user = useUser();
    const { domain, config } = useSite().domainInfo || {};
    const { useBrandStyling = false } = config?.features || {};

    const eventId = String(event.eventId ?? event.id);
    const isEventOpenForSale = checkIsEventOpenForSale(event);

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        GoogleAnalyticsTracker.triggerGA4Event<NotifyMeClickData>({
            event: GOOGLE_ANALYTICS_EVENT_KEYS.NOTIFY_ME_CLICK,
            key: GOOGLE_ANALYTICS_EVENT_KEYS.NOTIFY_ME_CLICK,
            data: {
                performer_id: performerId?.toString() ?? null,
                event_id: eventId ?? null,
                trigger_state: getNotifyMeTriggerState({ isSaleInFuture: !isEventOpenForSale }),
                domain: domain ?? '',
                user_logged_in: !!user?.id,
            },
        });

        onClick?.();
    };

    return (
        <Button
            type="button"
            variant="outline"
            className={cn(
                'box-border flex justify-center items-center gap-2 bg-white px-2 md:px-3 py-2 border border-primary rounded-lg w-full h-auto min-h-10 whitespace-normal wrap-anywhere max-md:min-h-0',
                useBrandStyling && 'border-[#1565C0]'
            )}
            onClick={handleClick}
        >
            <span
                className={cn(
                    'font-bold text-primary text-xs md:text-sm',
                    useBrandStyling && 'text-[#1565C0]'
                )}
            >
                {fallbackTranslation(t('notify_me'), 'notify_me', 'Notify me')}
            </span>
        </Button>
    );
}

export default EventNotifyMeButton;
