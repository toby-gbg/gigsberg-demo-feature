'use client';

import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useElements } from '@stripe/react-stripe-js';
import Cookies from 'js-cookie';
import { useLocale, useTranslations } from 'next-intl';
import { useUpdateEffect } from 'react-use';

import Address from '@/interfaces/Address';
import {
    CheckoutPaymentIntent,
    CheckoutPaymentIntentForm,
    CheckoutPaymentProvider as CheckoutPaymentProviderType,
    CheckoutStep,
    ClickSourceEnum,
} from '@/interfaces/Checkout';
import { markPurchaseRedirect } from '@/utils/purchaseRedirect';
import {
    useCompleteZeroPayOrderMutation,
    useLoadPaymentIntentMutation,
} from '@/swr/features/checkout';
import { useReleaseTicketMutation } from '@/swr/features/listings';
import { paymentProviders as PROVIDERS } from '@/constants/paymentProvider';

import { useUser } from '@/providers/UserProvider';
import useCookie from '@/hooks/useCookie';

import { toast } from '@/components/ui/Toast';

import { useCheckoutCoupon } from './CheckoutCouponProvider';
import { useCheckoutData } from './CheckoutDataProvider';
import { useCheckoutLead } from './CheckoutLeadProvider';

type Method = 'card' | 'stripe' | 'nomupay' | 'klarna';

interface CheckoutPaymentContextValue {
    paymentProvider: CheckoutPaymentProviderType;
    paymentIntent?: CheckoutPaymentIntent;
    setPaymentIntent: Dispatch<SetStateAction<CheckoutPaymentIntent | undefined>>;

    currentStep: CheckoutStep;
    setCurrentStep: Dispatch<SetStateAction<CheckoutStep>>;

    currentMethod?: Method;
    setMethod: (method: Method) => void;
    resetMethod: () => void;

    useBalance: boolean;
    setUseBalance: (v: boolean) => void;

    donateToSpecialOlympics: boolean;
    setDonateToSpecialOlympics: (v: boolean) => void;

    createPaymentIntent: (options: {
        paymentProvider?: CheckoutPaymentProviderType;
        leadId?: number;
    }) => Promise<CheckoutPaymentIntent>;

    preparePayment: (leadId: number) => Promise<CheckoutPaymentIntent | undefined>;

    isLoading: boolean;
    setIsLoading: Dispatch<SetStateAction<boolean>>;

    isSubmittingInformation: boolean;
    setIsSubmittingInformation: Dispatch<SetStateAction<boolean>>;

    releaseTicket: (shouldSetStep?: boolean) => Promise<void>;
    handleZeroPayment: (paymentIntentId: string) => Promise<void>;

    balanceUsed: number;
    finalPrice: number;
    finalPriceOrigin: number;

    selectedBillingAddress: Address | null;
    setSelectedBillingAddress: Dispatch<SetStateAction<Address | null>>;
}

const CheckoutPaymentContext = createContext<CheckoutPaymentContextValue | null>(null);

interface Props {
    children: ReactNode;
    paymentProvider: CheckoutPaymentProviderType;
}

export function CheckoutPaymentProvider({
    children,
    paymentProvider: defaultPaymentProvider,
}: Props) {
    const t = useTranslations();
    const locale = useLocale();

    const { getCookie } = useCookie<string>('gc');

    const elements = useElements();

    const user = useUser();

    // External providers
    const { data, quantity, country, currencyCode } = useCheckoutData();
    const { lead, deleteLead } = useCheckoutLead();
    const { couponCode } = useCheckoutCoupon();

    // State
    const [paymentProvider, setPaymentProvider] = useState(defaultPaymentProvider);
    const [paymentIntent, setPaymentIntent] = useState<CheckoutPaymentIntent>();
    const [currentStep, setCurrentStep] = useState<CheckoutStep>(CheckoutStep.YOUR_INFORMATION);
    const [donateToSpecialOlympics, setDonateToSpecialOlympics] = useState(false);
    const [useBalance, setUseBalance] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmittingInformation, setIsSubmittingInformation] = useState(false);
    const [currentMethod, setCurrentMethod] = useState<Method>();
    const [selectedBillingAddress, setSelectedBillingAddress] = useState<Address | null>(null);

    // API
    const { trigger: loadPaymentIntentAsync } = useLoadPaymentIntentMutation({
        onError: (error) => toast.add({ title: t(error.data.errorKey), type: 'error' }),
    });
    const { trigger: completeZeroPayOrder } = useCompleteZeroPayOrderMutation({
        onError: (error) => toast.add({ title: t(error.data.errorKey), type: 'error' }),
    });
    const { trigger: releaseTicketMutation } = useReleaseTicketMutation({
        onError: (error) => toast.add({ title: t(error.data.errorKey), type: 'error' }),
    });

    // Calculate price
    const { finalPrice, finalPriceOrigin, balanceUsed } = useMemo(() => {
        const grossPrice =
            data.totalPrice + (donateToSpecialOlympics ? data.specialOlympicsPrice : 0);

        const balanceUsed = useBalance ? Math.min(grossPrice, data.availableBalance ?? 0) : 0;

        const finalPrice = grossPrice - balanceUsed;

        // Original price (before currency conversion)
        const grossPriceOrigin =
            data.originalCurrencyTotalPrice +
            (donateToSpecialOlympics ? data.originalCurrencySpecialOlympicsPrice : 0);

        const balancedUsedOrigin = useBalance
            ? Math.min(grossPriceOrigin, data.originalCurrency?.availableBalance ?? 0)
            : 0;

        const finalPriceOrigin = grossPriceOrigin - balancedUsedOrigin;

        return {
            balanceUsed,
            finalPrice,
            finalPriceOrigin,
        };
    }, [donateToSpecialOlympics, data, useBalance]);

    // Handle create payment intent
    const createPaymentIntent = async (options: {
        paymentProvider?: CheckoutPaymentProviderType;
        leadId?: number;
    }) => {
        const leadId = options?.leadId ?? lead?.id;

        // Client Id
        const clientId = Cookies.get('client_id');

        // Click source
        const utmSource = Cookies.get('utm_source');
        const clickSource = Object.values(ClickSourceEnum).find(
            (source) => source.toLowerCase() === utmSource?.toLowerCase()
        );

        // Transaction Id
        const clickTransactionId = Cookies.get('clickTransactionId');

        const form: CheckoutPaymentIntentForm = {
            jwt: data.jwt,
            paymentProvider: options?.paymentProvider ?? defaultPaymentProvider,
            quantity,
            countryId: country?.id,
            currencyCode,
            makeDonation: donateToSpecialOlympics,
            userId: user?.id,
            leadId,
            redirectUnregCookie: getCookie(),
            couponCode,
            addressId: selectedBillingAddress?.id,
            balanceUsed,
            ...(clickTransactionId && { clickTransactionId }),
            ...(clickSource && { clickSource }),
            ...(clientId && { clientId }),
        };

        const intent = await loadPaymentIntentAsync([data.listing.id, form]);

        return intent;
    };

    // Handle zero order when finalPrice = 0
    const handleZeroPayment = async (paymentIntentId: string) => {
        await completeZeroPayOrder([data.listing.id, { paymentIntentId }]);

        markPurchaseRedirect(paymentIntentId);
    };

    // Shared payment preparation for step CONFIRM_AND_PAY
    // Called from CheckoutAttendeeDetails after attendee form is submitted
    const preparePayment = async (leadId: number) => {
        if (paymentProvider === 'stripe') return;
        const paymentIntent = await createPaymentIntent({ leadId });
        setPaymentIntent(paymentIntent);
        return paymentIntent;
    };

    // Release ticket lock and reset lead data
    const releaseTicket = async (shouldSetStep = true) => {
        const leadId = lead?.id;
        if (!leadId) return;

        try {
            await toast.promise(releaseTicketMutation({ leadId }), {
                loading: { title: t('loading'), type: 'loading' },
                success: { title: t('tickets_released_successfully'), type: 'success' },
                error: { title: t('error_releasing_tickets'), type: 'error' },
            });
        } catch (error) {
            console.error(error);
        } finally {
            deleteLead();
            sessionStorage.removeItem('CHECKOUT_LISTING_ID');
            sessionStorage.removeItem('CHECKOUT_QUANTITY');
            if (shouldSetStep) setCurrentStep(CheckoutStep.YOUR_INFORMATION);
        }
    };

    // Update stripe amount when user choose donate Special Olympics and use balance
    useUpdateEffect(() => {
        if (!elements) return;

        const amount = Math.round(finalPriceOrigin * 100);

        if (amount > 0) {
            // Update Stripe amount
            elements.update({ amount });
        }
    }, [finalPriceOrigin, elements]);

    // Update payment provider base on specific test account
    // Allows testing different providers by email prefix (e.g. "nomupay-test@gigsberg.com")
    useUpdateEffect(() => {
        if (!user) return;
        if (paymentProvider === 'stripe') return;

        const userEmail = user?.email.toLowerCase();
        // Check if email is in format <paymentProvider><optional digits>-test@gigsberg.com
        const match = userEmail.match(/^([a-zA-Z]+)\d*-test@gigsberg\.com$/);
        if (match) {
            const emailPrefix = match[1];
            // Return the payment provider from test email directly
            setPaymentProvider(emailPrefix as CheckoutPaymentProviderType);
        }
    }, [user]);

    // Reset step on locale change
    useEffect(() => {
        const storedLocale = sessionStorage.getItem('checkout_locale');
        if (storedLocale && storedLocale !== locale) {
            setCurrentStep(CheckoutStep.YOUR_INFORMATION);
        }
        sessionStorage.setItem('checkout_locale', locale);
    }, [locale]);

    // Reset step on currency change
    useUpdateEffect(() => {
        setCurrentStep(CheckoutStep.YOUR_INFORMATION);
    }, [currencyCode]);

    // Set random payment provider exclude Fibonatix for Italian users
    useEffect(() => {
        if (country?.code === 'IT' && paymentProvider === 'fibonatix') {
            const providers = PROVIDERS.filter((p) => p !== 'fibonatix');
            const randomIndex = Math.floor(Math.random() * providers.length);
            const selected = providers[randomIndex];

            setPaymentProvider(selected);
        }
    }, [country]);

    // Set current processing provider
    const setMethod = (provider: Method) => setCurrentMethod(provider);

    // Reset current processing provider
    const resetMethod = () => setCurrentMethod(undefined);

    return (
        <CheckoutPaymentContext.Provider
            value={{
                paymentProvider,
                paymentIntent,
                setPaymentIntent,
                currentStep,
                setCurrentStep,
                donateToSpecialOlympics,
                setDonateToSpecialOlympics,
                releaseTicket,
                createPaymentIntent,
                preparePayment,
                isLoading,
                setIsLoading,
                isSubmittingInformation,
                setIsSubmittingInformation,
                currentMethod,
                setMethod,
                resetMethod,
                useBalance,
                setUseBalance,
                handleZeroPayment,
                balanceUsed,
                finalPrice,
                finalPriceOrigin,
                selectedBillingAddress,
                setSelectedBillingAddress,
            }}
        >
            {children}
        </CheckoutPaymentContext.Provider>
    );
}

export function useCheckoutPayment() {
    const ctx = useContext(CheckoutPaymentContext);
    if (!ctx) {
        throw new Error('useCheckoutPayment must be used within CheckoutPaymentProvider');
    }
    return ctx;
}
