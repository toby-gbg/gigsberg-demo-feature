'use client';

import { createContext, ReactNode, useContext, useState } from 'react';
import { useQueryStates } from '@/nuqs/hooks/useQueryStates';
import { useTranslations } from 'next-intl';

import { Lead } from '@/interfaces/Lead';
import { ListingCheckout } from '@/interfaces/Listing';
import { useStoreLeadMutation } from '@/swr/features/lead';
import { CHECKOUT_REDIRECT_ERRORS, getCheckoutRedirectKeys } from '@/constants/checkout';

import useCookie from '@/hooks/useCookie';
import useIntlRouter from '@/hooks/useIntlRouter';

import { toast } from '@/components/ui/Toast';

import { checkoutSearchParamsParsers } from '../_searchParams';

interface CheckoutLeadContext {
    lead?: Lead;
    deleteLead: () => void;
    createLead: () => Promise<Lead>;
}

const CheckoutLeadContext = createContext<CheckoutLeadContext | null>(null);

export function CheckoutLeadProvider({
    children,
    listing,
}: {
    children: ReactNode;
    listing: ListingCheckout;
}) {
    const t = useTranslations();
    const { push } = useIntlRouter();

    const { setEncryptedCookie, deleteCookie } = useCookie<Lead>('USER_LEAD');
    const [lead, setLead] = useState<Lead>();

    const [searchParams] = useQueryStates(checkoutSearchParamsParsers);
    const { quantity, affiliate_id: affiliateId } = searchParams || {};

    // Create lead API
    const { trigger: storeLeadAsync } = useStoreLeadMutation({
        onSuccess: async (data) => {
            setLead(data);
            await setEncryptedCookie(data);
        },
        onError: (error) => {
            const { statusCode, errorKey } = error.data;
            const { eventUrl, tourNameUrl } = listing;

            const type = tourNameUrl ? 'tour' : 'performer';
            const fallbackUrl = eventUrl?.slice(0, eventUrl.lastIndexOf('/')) || undefined;

            const redirect = CHECKOUT_REDIRECT_ERRORS.has(statusCode)
                ? getCheckoutRedirectKeys(statusCode, eventUrl, fallbackUrl, type)
                : null;

            toast.add({
                title: redirect ? `${t(redirect.message)} ${t(redirect.redirecting)}` : t(errorKey),
                type: 'error',
                ...(redirect && {
                    id: 'checkout-redirect',
                    timeout: 3000,
                    onClose: () => push(redirect.href),
                }),
            });
        },
    });

    // Create a new lead (order placeholder) on the server
    // Required before payment intent can be created
    const createLead = async () => {
        const {
            jwt,
            listing: { id },
        } = listing;

        const result = await storeLeadAsync({
            listingId: id,
            quantity: quantity ?? '1',
            affiliateId: affiliateId ?? undefined,
            jwt,
        });

        return result;
    };

    // Clear local lead state and delete the encrypted cookie
    const deleteLead = () => {
        setLead(undefined);
        deleteCookie();
    };

    return (
        <CheckoutLeadContext.Provider value={{ lead, deleteLead, createLead }}>
            {children}
        </CheckoutLeadContext.Provider>
    );
}

export function useCheckoutLead() {
    const ctx = useContext(CheckoutLeadContext);
    if (!ctx) {
        throw new Error('useCheckoutLead must be used inside CheckoutLeadProvider');
    }
    return ctx;
}
