'use client';

import { useCallback } from 'react';
import { useLocale } from 'next-intl';

import Country from '@/interfaces/Country';
import {
    FansAlsoLikeClickData,
    FansAlsoLikeEmptyData,
    FansAlsoLikeShownData,
} from '@/interfaces/trackers/GoogleAnalystic';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { GOOGLE_ANALYTICS_EVENT_KEYS } from '@/constants/trackers';

import { useSite } from '../providers/SiteProvider';

export function useFansAlsoLikeGA(performerId?: string, ipCountry?: Country) {
    const locale = useLocale();
    const { domain } = useSite().domainInfo || {};

    const geo =
        ipCountry?.code?.toLowerCase() ?? new Intl.Locale(locale).region?.toLowerCase() ?? '';

    const trackShown = useCallback(
        (recommendedIds: string[]) => {
            if (!performerId) return;

            GoogleAnalyticsTracker.triggerGA4Event<FansAlsoLikeShownData>({
                event: GOOGLE_ANALYTICS_EVENT_KEYS.FANS_ALSO_LIKE_SHOWN,
                key: GOOGLE_ANALYTICS_EVENT_KEYS.FANS_ALSO_LIKE_SHOWN,
                data: {
                    performer_id: performerId,
                    recommended_ids: recommendedIds,
                    result_count: recommendedIds.length,
                    geo,
                    domain: domain ?? '',
                },
            });
        },
        [performerId, geo, domain]
    );

    const trackEmpty = useCallback(
        (reason = 'no_results') => {
            if (!performerId) return;

            GoogleAnalyticsTracker.triggerGA4Event<FansAlsoLikeEmptyData>({
                event: GOOGLE_ANALYTICS_EVENT_KEYS.FANS_ALSO_LIKE_EMPTY,
                key: GOOGLE_ANALYTICS_EVENT_KEYS.FANS_ALSO_LIKE_EMPTY,
                data: {
                    performer_id: performerId,
                    geo,
                    domain: domain ?? '',
                    reason,
                },
            });
        },
        [performerId, geo, domain]
    );

    const trackClick = useCallback(
        (clickedPerformerId: string, position: number) => {
            if (!performerId) return;

            GoogleAnalyticsTracker.triggerGA4Event<FansAlsoLikeClickData>({
                event: GOOGLE_ANALYTICS_EVENT_KEYS.FANS_ALSO_LIKE_CLICK,
                key: GOOGLE_ANALYTICS_EVENT_KEYS.FANS_ALSO_LIKE_CLICK,
                data: {
                    source_performer_id: performerId,
                    clicked_performer_id: clickedPerformerId,
                    position,
                    geo,
                    domain: domain ?? '',
                },
            });
        },
        [performerId, geo, domain]
    );

    return { trackShown, trackEmpty, trackClick, geo, domain: domain ?? '' };
}

export type FansAlsoLikeGATracker = ReturnType<typeof useFansAlsoLikeGA>;
