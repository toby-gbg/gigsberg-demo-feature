'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import Listing from '@/interfaces/Listing';
import { PromotionItem } from '@/interfaces/trackers/GoogleAnalystic';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import PushlyTracker from '@/lib/seo/PushlyTracker';
import { extractShowId, fallbackTranslation } from '@/utils/common';
import { storeCurrencyInCookies } from '@/utils/cookies';
import GoogleEventMapper from '@/utils/GoogleEventMapper';
import MetaPixelEventMapper from '@/utils/MetaPixelEventMapper';
import PushlyEventMapper from '@/utils/PushlyEventMapper';
import { useSignUrlMutation } from '@/swr/features/checkout';
import { useMetaTracking } from '@/swr/features/tracking';
import { TRACKING_PARAMS } from '@/constants/checkout';

import { useListing } from '@/providers/ListingProvider';
import { useSite } from '@/providers/SiteProvider';
import { useUser } from '@/providers/UserProvider';
import useCookie from '@/hooks/useCookie';
import useIntlRouter from '@/hooks/useIntlRouter';

import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

import { $ticketDetailModal } from '../_stores';

interface CheckoutButtonProps {
    quantity: number;
    listing: Listing | undefined;
    currencyCode: string;
}

export default function CheckoutButton({
    quantity,
    listing,
    currencyCode: currentCurrencyCode,
}: CheckoutButtonProps) {
    const t = useTranslations();
    const router = useIntlRouter();
    const locale = useLocale();
    const { eventDetails } = useListing();
    const { hostname, config } = useSite().domainInfo || {};
    const currentUser = useUser();

    const targetLocale = locale?.split('-')[0] || '';

    const {
        listing: eventId,
        type,
        subtype,
    } = useParams<{ listing: string; type: string; subtype: string }>();

    const searchParams = useSearchParams();

    // Checkout item cookie
    const { setEncryptedCookie } = useCookie<PromotionItem>('CHECKOUT_ITEM');

    // Sign url API
    const { trigger: signUrl, isMutating: isLoading } = useSignUrlMutation({
        onSuccess: (data) => {
            if (data.url) {
                router.push(data.url);
            } else {
                toast.add({ title: t('cannot_redirect_checkout'), type: 'error' });
            }
        },
        onError: (error) => console.error('Error signing URL:', error),
    });

    const { trigger: trackWithMeta } = useMetaTracking();

    // WLB-1540: Handle signing the URL and redirecting
    const handleSignUrl = async () => {
        // Build checkout URL with listing ID
        const checkoutId = listing?.id === 0 ? listing.ext_listing_id : listing?.id;

        const url = new URL(`https://${hostname}/checkout/${checkoutId}`);

        // Append ticket quantitys
        url.searchParams.set('quantity', quantity.toString());
        storeCurrencyInCookies(currentCurrencyCode);

        // WLB-2853: Checkout page | Inconsistent when changing language in Checkout page and back to Event page
        // set locale for checkout page
        window.cookieStore.set('x-explicit-locale', targetLocale);

        // Append affiliate tracking params
        if (listing?.affiliate_id) {
            url.searchParams.set('affiliate_id', listing.affiliate_id.toString());
            const showId = extractShowId(eventId);
            if (showId) url.searchParams.set('event_id', showId.toString());
        }

        // Forward tracking params from current page to checkout

        TRACKING_PARAMS.forEach((param) => {
            const value = searchParams.get(param);
            if (value) url.searchParams.set(param, value);
        });

        await signUrl({ url: url.toString() });
    };

    const sendAnalyticsTracker = () => {
        if (listing && quantity) {
            //Send Google Events
            let item = GoogleEventMapper.mapListingToPromotionItem(
                listing,
                {
                    ...eventDetails,
                    type_name_url: type,
                    subType: locale === 'es-ES' ? { nameEs: subtype } : { nameUrl: subtype },
                },
                'en-GB',
                config?.features?.useGrossPrice || false
            );
            item = {
                ...item,
                quantity,
                item_list_id: eventDetails.venueName, // arena name
                item_list_name: listing.category_name || listing.category?.name || '', // ticket category
            };

            GoogleAnalyticsTracker.triggerGA4PromotionEvent('add_to_cart', {
                items: [item],
            });

            //Send Pushly Event
            PushlyTracker.trackCheckoutStarted(
                PushlyEventMapper.mapAddToCartData(
                    eventDetails,
                    listing,
                    locale,
                    config?.features?.useGrossPrice || false
                )
            );

            //Send Meta Pixel Event
            const metaUserData = currentUser
                ? MetaPixelEventMapper.mapUserData(currentUser)
                : undefined;
            const metaAddToCartEventData = MetaPixelEventMapper.mapAddToCartData({
                sourceUrl: window.location.href,
                userData: metaUserData,
                checkoutData: {
                    event: eventDetails,
                    listing,
                    locale,
                    useGrossPrice: config?.features?.useGrossPrice || false,
                },
            });
            trackWithMeta(metaAddToCartEventData);

            setEncryptedCookie(item, { expires: 1 / 12 }); // 2h
        }
    };

    const handleCheckout = () => {
        if (listing && quantity) {
            if (currentUser && listing.seller_id === currentUser.id) {
                toast.add({
                    title: fallbackTranslation(
                        t('cannot_purchase_own_listing'),
                        'cannot_purchase_own_listing',
                        'You cannot purchase tickets from your own listing.'
                    ),
                    type: 'error',
                });
                $ticketDetailModal.set(false);
                return;
            }

            sendAnalyticsTracker();

            // Proceed to sign URL and redirect
            handleSignUrl();
        }
    };

    return (
        <Button className="py-2 w-full" disabled={!quantity || isLoading} onClick={handleCheckout}>
            {isLoading ? t('redirecting') : t('checkout')}
        </Button>
    );
}
