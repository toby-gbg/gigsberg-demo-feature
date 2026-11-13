'use client';

import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useOptimistic,
    useState,
} from 'react';
import { useQueryStates } from '@/nuqs/hooks/useQueryStates';

import Address from '@/interfaces/Address';
import Country from '@/interfaces/Country';
import { ExternalDigitalVenueBlocks, ListingCheckout, ListingMetadata } from '@/interfaces/Listing';
import Website from '@/interfaces/Website';
import { useGetCheckoutListingQuery } from '@/swr/features/checkout';

import { useSite } from '@/providers/SiteProvider';
import { useUser } from '@/providers/UserProvider';

import { checkoutSearchParamsParsers } from '../_searchParams';
import { useCheckoutCoupon } from './CheckoutCouponProvider';
import { CheckoutExtraParams } from './CheckoutProvider';

interface CheckoutDataContextValue {
    data: ListingCheckout;
    isFetching: boolean;
    quantity: string;
    country?: Country;
    setCountry: (c?: Country) => void;
    refresh: () => void;
    extraParams: CheckoutExtraParams;
    metadata: ListingMetadata | null;
    addresses: Address[];
    setAddresses: Dispatch<SetStateAction<Address[]>>;
    external_3ddv_id: string | null;
    external_3ddv_blocks: ExternalDigitalVenueBlocks[];
    ipCountry: Country;
    currencyCode: string;
    website?: Website | null;
    setOptimisticCurrencyCode: (action: string) => void;
}

interface CheckoutContextProps {
    children: ReactNode;
    listing: ListingCheckout;
    extraParams: CheckoutExtraParams;
    metadata: ListingMetadata | null;
    addresses: Address[];
    external_3ddv_id?: string | null;
    external_3ddv_blocks?: ExternalDigitalVenueBlocks[];
    ipCountry: Country;
    currencyCode: string;
}

const CheckoutDataContext = createContext<CheckoutDataContextValue | null>(null);

export function CheckoutDataProvider({
    children,
    listing,
    extraParams,
    metadata,
    addresses: defaultAddresses,
    external_3ddv_id,
    external_3ddv_blocks,
    ipCountry,
    currencyCode,
}: CheckoutContextProps) {
    const website = useSite().website;
    const [searchParams] = useQueryStates(checkoutSearchParamsParsers);

    // Read ticket quantity from URL; fallback to 1
    const user = useUser();
    const quantity = searchParams.quantity || '0';
    const { couponCode } = useCheckoutCoupon();

    const defaultChosenAddress = useMemo(
        () =>
            defaultAddresses.find((a) => a.isDefault) ||
            defaultAddresses.find((a) => a.id === user?.default_address?.id) ||
            defaultAddresses[defaultAddresses.length - 1],
        [defaultAddresses, user]
    );

    const [country, setCountry] = useState<Country | undefined>(
        defaultChosenAddress?.country || ipCountry || undefined
    );
    const [addresses, setAddresses] = useState<Address[]>(defaultAddresses);

    const [optimisticCurrencyCode, setOptimisticCurrencyCode] = useOptimistic(currencyCode);

    const checkoutParams = {
        currencyCode: optimisticCurrencyCode,
        quantity,
        ...(country && { countryId: String(country.id) }),
        ...(couponCode && { couponCode }),
    };

    const { data, isValidating, mutate } = useGetCheckoutListingQuery(
        listing.listing.id,
        checkoutParams,
        listing,
        user?.id
    );

    // push refreshed server data (new currency) into SWR, otherwise its cache wins over `listing`
    useEffect(() => {
        mutate(listing, { revalidate: false });
    }, [listing, mutate]);

    return (
        <CheckoutDataContext.Provider
            value={{
                data: data ?? listing,
                isFetching: isValidating,
                quantity,
                country,
                setCountry,
                refresh: mutate,
                extraParams,
                metadata,
                addresses,
                setAddresses,
                external_3ddv_id: external_3ddv_id ?? '',
                external_3ddv_blocks: external_3ddv_blocks ?? [],
                ipCountry,
                currencyCode: optimisticCurrencyCode,
                setOptimisticCurrencyCode,
                website,
            }}
        >
            {children}
        </CheckoutDataContext.Provider>
    );
}

export function useCheckoutData() {
    const ctx = useContext(CheckoutDataContext);
    if (!ctx) {
        throw new Error('useCheckoutData must be used within CheckoutDataProvider');
    }
    return ctx;
}
