import { AppErrorKey } from '@/utils/api/api-error-codes';

export const CHECKOUT_TTL_SECONDS = 600; // 10 minutes
export const CHECKOUT_WARNING_THRESHOLD = 180; // 3 minutes
export const PURCHASE_REDIRECT_KEY = 'PURCHASE_REDIRECT';

export const KLARNA_SUPPORTED_CURRENCIES = [
    'EUR',
    'GBP',
    'DKK',
    'NOK',
    'SEK',
    'CZK',
    'RON',
    'PLN',
    'CHF',
];

export const CJ_EVENT_PARAM = 'cjevent';
export const CJ_EVENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 395; //395 days for cje cookie

export const CLICK_TRANSACTION_PARAMS = ['_ef_transaction_id', CJ_EVENT_PARAM, 'awc'] as const;
export const TRACKING_PARAMS = ['client_id', 'utm_source'] as const;
export const TRACKING_COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

// Errors that send the buyer back to the event page
export const CHECKOUT_REDIRECT_ERRORS = new Set<string>([
    AppErrorKey.INVALID_QUANTITY,
    AppErrorKey.LISTING_LOCKED,
    AppErrorKey.EVENT_DATE_INVALID,
    AppErrorKey.EVENT_IS_NOT_AVAILABLE,
]);

export type FallbackType = 'performer' | 'tour';

// Single source of truth for the redirect target and the title/message shown by the page and the toast
export function getCheckoutRedirectKeys(
    error: string,
    rawEventUrl?: string | null,
    fallbackUrl?: string,
    type?: FallbackType | null
) {
    const isEventClosed =
        error === AppErrorKey.EVENT_DATE_INVALID || error === AppErrorKey.EVENT_IS_NOT_AVAILABLE;
    // A closed event can still carry a stale eventUrl, so go to the performer/tour page instead
    const eventUrl = isEventClosed ? null : rawEventUrl;
    const href = eventUrl || fallbackUrl || '/';

    // Mirrors the redirect target: the event page wins, then the performer/tour fallback
    const redirecting =
        !eventUrl && fallbackUrl && type
            ? `redirecting_to_${type}_page`
            : 'redirecting_to_event_page';

    const isClosed =
        isEventClosed || (error === AppErrorKey.INVALID_QUANTITY && !eventUrl && !!fallbackUrl);

    if (isClosed) {
        return { title: 'event_closed_title', message: 'event_closed_message', redirecting, href };
    }
    if (error === AppErrorKey.LISTING_LOCKED) {
        return { title: 'sorry_tickets_gone_title', message: 'listing_locked', redirecting, href };
    }
    return {
        title: 'sorry_tickets_gone_title',
        message: 'tickets_not_available_anymore',
        redirecting,
        href,
    };
}
