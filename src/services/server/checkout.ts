import { ListingCheckoutResponse } from '@/interfaces/Listing';
import Headers from '@/lib/headers';
import { getRoundUpDifference } from '@/utils/common';
import { CHECKOUT_REDIRECT_ERRORS, FallbackType } from '@/constants/checkout';

import { apiService } from './base';
import { apiEndpoints } from './config';
import { getCurrencyFromCookies } from './currencies';
import { getClientIp } from './ip';
import { ApiError } from './types/errors';
import { getUserToken, userApi } from './users';

export const checkoutApi = {
    async getCheckoutListing(
        listingId: string,
        quantity: string = '1',
        affiliateId?: string | undefined,
        eventId?: string | undefined
    ) {
        const ip = await getClientIp();
        const currencyCode = await getCurrencyFromCookies();
        const user = await userApi.getCurrentUser();
        const { hostname } = await Headers.getDomainInfo();
        const locale = await Headers.getExplicitLocale();
        const token = await getUserToken();

        try {
            const result = await apiService.get<ListingCheckoutResponse>(
                apiEndpoints.checkout.summary(listingId),
                {
                    params: {
                        currencyCode,
                        quantity,
                        affiliateId,
                        eventId,
                        ...(user &&
                            user.default_address && {
                                countryId: user.default_address.country_id.toString(),
                            }),
                    },
                    cache: 'no-store',
                    headers: {
                        'x-forwarded-for': ip,
                        'x-website-domain': hostname,
                        ...(locale && { 'x-explicit-locale': locale }),
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    retry: { enabled: true, maxRetries: 4, delay: 2000 },
                }
            );

            if (!result) return null;

            return {
                data: {
                    ...result,
                    specialOlympicsPrice: getRoundUpDifference(result.totalPrice),
                },
                error: null,
            };
        } catch (e: unknown) {
            console.log('Error in getCheckoutListing:', e);

            if (e instanceof ApiError) {
                const res = e.response as
                    | {
                          statusCode?: string;
                          eventUrl?: string | null;
                          fallbackUrl?: string;
                          type?: FallbackType | null;
                      }
                    | undefined;

                if (res?.statusCode && CHECKOUT_REDIRECT_ERRORS.has(res.statusCode)) {
                    return {
                        error: res.statusCode,
                        eventUrl: res.eventUrl,
                        fallbackUrl: res.fallbackUrl,
                        type: res.type,
                    };
                }
            }

            return null;
        }
    },
    async signUrl(url: string, ignoreParams?: string[]) {
        try {
            const result = await apiService.post<{ url: string }>(
                apiEndpoints.checkout.signUrl,
                { url, ignoreParams },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            return result?.url;
        } catch (e) {
            console.log('Error in signUrl:', e);
            return null;
        }
    },
    async validateUrl(url: string, ignoreParams: string[], referer?: string) {
        try {
            const result = await apiService.post<{ valid: boolean; redirectUrl?: string }>(
                apiEndpoints.checkout.validateUrl,
                { url, ignoreParams, referer },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            return result;
        } catch (e) {
            console.log('Error in validateUrl:', e);
            return { valid: false };
        }
    },
};
