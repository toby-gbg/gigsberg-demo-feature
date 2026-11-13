import { DateTime } from 'luxon';

import { NotifyMeTriggerState } from '@/interfaces/trackers/GoogleAnalystic';
import { getOpenSaleDateTime } from '@/utils/event';

export function getNotifyMeTriggerState({
    isSaleInFuture,
}: {
    isSaleInFuture: boolean;
}): NotifyMeTriggerState {
    return isSaleInFuture ? 'sale_not_started' : 'no_inventory';
}

export function getNotifyMeTriggerStateFromOpenSale(
    openSaleDate?: string | null,
    openSaleTime?: string | null,
    ianaZone?: string | null,
    openSaleTimestamp?: string | null
): NotifyMeTriggerState {
    const openSaleDateTime = getOpenSaleDateTime({
        openSaleTimestamp,
        openSaleDate,
        openSaleTime,
        openSaleTimezone: ianaZone,
    });
    const isSaleInFuture = openSaleDateTime ? openSaleDateTime > DateTime.now() : false;

    return getNotifyMeTriggerState({ isSaleInFuture });
}
