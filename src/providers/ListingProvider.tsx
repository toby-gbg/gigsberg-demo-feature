'use client';

import {
    createContext,
    Dispatch,
    SetStateAction,
    startTransition,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { listingParamsParsers } from '@/app/[locale]/[type]/[subtype]/[event]/[listing]/_searchParams';
import { useQueryStates } from '@/nuqs/hooks/useQueryStates';
import { useStore } from '@nanostores/react';
import { useUpdateEffect } from 'react-use';

import Country from '@/interfaces/Country';
import { EventDetail, EventRestriction } from '@/interfaces/Event';
import {
    ExternalDigitalVenueBlocks,
    ListingMetadata,
    ListingSearch,
    ListingSearchFilters,
} from '@/interfaces/Listing';
import User from '@/interfaces/User';
import Website from '@/interfaces/Website';
import { $requestedCurrency, setRequestedCurrency } from '@/stores';
import PushlyTracker from '@/lib/seo/PushlyTracker';
import { ListingServerFilters } from '@/swr/types/listings';

import { useSite } from '@/providers/SiteProvider';
import { useUser } from '@/providers/UserProvider';
import useIntlRouter from '@/hooks/useIntlRouter';

// Server guest (null) and store guest (-1) both become 'guest'
const toUserKey = (id?: number | null) =>
    id === undefined || id === null || id === -1 ? 'guest' : String(id);

const CURRENCY_SWITCH_TIMEOUT_MS = 2000;

export interface ListingContextValue {
    eventDetails: EventDetail;
    metadata: ListingMetadata;
    listings: ListingSearch;
    restrictions: EventRestriction[];
    filters: ListingSearchFilters;
    setFilters: React.Dispatch<React.SetStateAction<ListingSearchFilters>>;
    defaultFilters: ListingSearchFilters;
    onResetFilters: () => void;
    mapUrls?: Record<string, string[]>;
    openRestrictionModal: boolean;
    setOpenRestrictionModal: (v: boolean) => void;
    external_3ddv_id?: string | null;
    external_3ddv_blocks?: ExternalDigitalVenueBlocks[];
    imageFromSvg: string;
    ipCountry: Country | undefined;
    currencyCode: string;
    website: Website | null;
    logo: string | null;
    logoDark: string | null;
    mainGradientStart?: string;
    mainGradientEnd?: string;
    textOnMain?: string;
    dataVersion: string;
    isCurrencySwitching: boolean;
    isUserSwitching: boolean;
    serverFilters: ListingServerFilters;
    rawSvgContent?: string;
}

type FiltersUpdater = (p: ListingSearchFilters) => ListingSearchFilters;

const ListingContext = createContext<ListingContextValue | null>(null);

interface ListingProviderProps {
    eventDetails: EventDetail;
    metadata: ListingMetadata;
    listings: ListingSearch;
    restrictions: EventRestriction[];
    currencyCode: string;
    currentUser?: User | null;
    mapUrls?: Record<string, string[]>;
    children: ReactNode;
    external_3ddv_id: string | null;
    external_3ddv_blocks: ExternalDigitalVenueBlocks[];
    queryNumberOfTickets?: number | null;
    ipCountry: Country | undefined;
    serverFilters: ListingServerFilters;
    rawSvgContent?: string;
}

export function ListingProvider({
    eventDetails,
    metadata,
    listings,
    restrictions,
    mapUrls,
    currencyCode,
    currentUser,
    children,
    external_3ddv_id = '',
    external_3ddv_blocks = [],
    ipCountry,
    serverFilters,
    rawSvgContent,
}: ListingProviderProps) {
    const website = useSite().website;
    const router = useIntlRouter();
    const userId = useUser()?.id ?? -1;
    const requestedCurrency = useStore($requestedCurrency);
    const [openRestrictionModal, setOpenRestrictionModal] = useState(false);

    // ── Identity keys
    // userKey  = who the *server* rendered for
    // storeUserKey = who the *client store* says you are
    const userKey = toUserKey(currentUser?.id);
    const storeUserKey = toUserKey(userId);
    const dataVersion = `${currencyCode}-${userKey}`; // changes only when server data changes

    // ── Switching flags (loading windows) Currency: client intent vs server prop
    const isCurrencySwitching = requestedCurrency !== null && requestedCurrency !== currencyCode;

    // User: applied key vs current store key
    const [appliedUserKey, setAppliedUserKey] = useState(storeUserKey);
    const isUserSwitching = appliedUserKey !== storeUserKey;

    // Clear currency-switch intent once server re-renders with the new currencyCode.
    // Also sync appliedUserKey when server + store agree.
    useEffect(() => {
        if (requestedCurrency !== null && requestedCurrency === currencyCode) {
            setRequestedCurrency(null);
        }
        if (storeUserKey === userKey && appliedUserKey !== storeUserKey) {
            setAppliedUserKey(storeUserKey);
        }

        // safety net to make currency changes not freezing
        if (requestedCurrency === null) return;
        const timer = setTimeout(() => setRequestedCurrency(null), CURRENCY_SWITCH_TIMEOUT_MS);
        return () => clearTimeout(timer);
    }, [currencyCode, requestedCurrency, storeUserKey, userKey, appliedUserKey]);

    // Skip the first userId change when server already rendered a logged-in user
    // but the store is still hydrating as guest (-1)
    const skipNextChange = useRef(Boolean(currentUser) && userId === -1);

    // ── Filters
    // URL slices (nuqs) + local paging state → single `filters` object
    // that matches the shape consumers / SWR already expect
    const [urlParams, setUrlParams] = useQueryStates(listingParamsParsers, {
        shallow: true,
        history: 'replace',
    });
    const [local, setLocal] = useState<{ page: number; skip?: boolean }>({ page: 1 });

    const defaultFilters: ListingSearchFilters = useMemo(
        () => ({
            event_id: eventDetails?.id ?? 0,
            page: 1,
            per_page: 32,
            currency_code: currencyCode,
        }),
        [eventDetails?.id, currencyCode]
    );

    const filters = useMemo<ListingSearchFilters>(
        () => ({
            ...defaultFilters,
            page: local.page,
            ...(local.skip !== undefined && { skip: local.skip }),
            ...(urlParams.quantity != null && {
                number_of_tickets: [urlParams.quantity, String(urlParams.quantity)] as [
                    number,
                    string,
                ],
            }),
            ...(urlParams.categories?.length && { categories: [...urlParams.categories] }),
            ...(urlParams.ticket_type?.length && {
                ticket_type: urlParams.ticket_type.map(
                    (id) => [id, String(id)] as [number, string]
                ),
            }),
            ...(urlParams.blocks?.length && { blocks: [...urlParams.blocks] }),
            ...(urlParams.min_price != null && { min_price: urlParams.min_price }),
            ...(urlParams.max_price != null && { max_price: urlParams.max_price }),
        }),
        [defaultFilters, urlParams, local]
    );

    // Keep setFilters identity stable (empty deps) while always reading latest values
    const filtersRef = useRef(filters);
    filtersRef.current = filters; // every render: store the newest filters object

    // created an adapter because normal set state can only touch 1 piece of state
    // but now we have 2: URL via setUrlParams and Local state via setLocal
    // if i use only old setFilters i have to add more logic to act on nuqs
    // summarize: Read from URL + local → merge into filters → when someone “sets filters”, split the update back into URL and local → keep the setter stable with refs.
    const setFilters: Dispatch<SetStateAction<ListingSearchFilters>> = useCallback((updater) => {
        const prev = filtersRef.current;

        // supports both styles so existing call sites keep working
        const next = typeof updater === 'function' ? (updater as FiltersUpdater)(prev) : updater;

        // Write URL-managed fields
        setUrlParams({
            quantity: next.number_of_tickets?.[0] ?? null,
            categories: next.categories?.length ? [...next.categories] : null,
            ticket_type: next.ticket_type?.length
                ? next.ticket_type.map(([id]) => Number(id))
                : null,
            blocks: next.blocks?.length ? [...next.blocks] : null,
            min_price: next.min_price ?? null,
            max_price: next.max_price ?? null,
        });

        // Write local-only fields (avoid extra setState if nothing changed)
        setLocal((prevLocal) => {
            const nextLocal = { page: next.page ?? 1, skip: next.skip };
            return prevLocal.page === nextLocal.page && prevLocal.skip === nextLocal.skip
                ? prevLocal
                : nextLocal;
        });
    }, []);

    // ── Sync filters when server currency / user payload changes ───
    // Run in an effect (not render) to avoid setState-during-render errors.
    const prevListingCheckRef = useRef({ currencyCode, userKey, userId });

    useEffect(() => {
        const prev = prevListingCheckRef.current;
        if (
            prev.currencyCode !== currencyCode ||
            prev.userKey !== userKey ||
            prev.userId !== userId
        ) {
            const currencyChanged = prev.currencyCode !== currencyCode;
            prevListingCheckRef.current = { currencyCode, userKey, userId };

            setFilters((prevFilters) => ({
                ...prevFilters,
                page: 1,
                currency_code: currencyCode,
                // Prices are in the old currency → clear them
                ...(currencyChanged && { min_price: undefined, max_price: undefined }),
            }));
        }
    }, [currencyCode, userKey, userId]);

    // Real login/logout → refresh so server sends new data for the new user
    useUpdateEffect(() => {
        if (skipNextChange.current) {
            skipNextChange.current = false;
            return;
        }
        startTransition(() => {
            router.refresh();
        });
    }, [userId]);

    const onResetFilters = () => {
        setFilters({ ...defaultFilters });
    };

    // ── Venue SVG map
    const [imageFromSvg, setImageFromSvg] = useState('');

    useEffect(() => {
        if (!rawSvgContent) return;

        const url = URL.createObjectURL(
            new Blob([rawSvgContent], { type: 'image/svg+xml;charset=utf-8' })
        );
        setImageFromSvg(url);

        return () => URL.revokeObjectURL(url);
    }, [rawSvgContent]);

    // ── Analytics
    useEffect(() => {
        PushlyTracker.trackViewItem({
            id: eventDetails.id,
            eventName: eventDetails.name,
            eventDate: eventDetails.date,
            price: metadata.min_price || 0,
            currency: currencyCode,
            venue: eventDetails.venueName,
            city: eventDetails.cityName,
            country: eventDetails.countryCode,
        });
    }, [eventDetails.id]);

    // ── Context value
    const value: ListingContextValue = {
        eventDetails,
        metadata,
        listings,
        restrictions,
        filters,
        setFilters,
        defaultFilters,
        onResetFilters,
        mapUrls,
        openRestrictionModal,
        setOpenRestrictionModal,
        external_3ddv_id,
        external_3ddv_blocks,
        imageFromSvg,
        ipCountry,
        currencyCode,
        website,
        logo: website?.logo ?? null,
        logoDark: website?.logo_dark ?? null,
        mainGradientStart: website?.main_gradient_start,
        mainGradientEnd: website?.main_gradient_end,
        textOnMain: website?.text_on_main,
        dataVersion,
        isCurrencySwitching,
        isUserSwitching,
        serverFilters,
        rawSvgContent,
    };

    return <ListingContext.Provider value={value}>{children}</ListingContext.Provider>;
}

export function useListing(): ListingContextValue {
    const ctx = useContext(ListingContext);
    if (!ctx) throw new Error('useListing must be used within a ListingProvider');
    return ctx;
}
