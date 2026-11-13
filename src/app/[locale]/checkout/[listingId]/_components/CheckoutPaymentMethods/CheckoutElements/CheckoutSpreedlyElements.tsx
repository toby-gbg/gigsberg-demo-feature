'use client';

import { Fragment, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Script from 'next/script';

import {
    ApplePayPaymentAuthorizedEvent,
    ApplePaySessionConstructor,
    ApplePayValidateMerchantEvent,
    CheckoutPaymentIntent,
    CheckoutStep,
} from '@/interfaces/Checkout';

// import { KLARNA_SUPPORTED_CURRENCIES } from '@/constants/checkout';

import { useSite } from '@/providers/SiteProvider';

import { Skeleton } from '@/components/ui/Skeleton';

import useSpreedly from '../../../_hooks/useSpreedly';
import { useCheckoutData } from '../../../_providers/CheckoutDataProvider';
import { useCheckoutPayment } from '../../../_providers/CheckoutPaymentProvider';

// Utility function for normalizing environment variables
const normalizeEnvVar = (value?: string) => value?.replace(/^"|"$/g, '') || '';

const PAYPAL_ENABLED = normalizeEnvVar(process.env.NEXT_PUBLIC_PAYPAL_ENABLED) === 'true';
// const PAYPAL_ENABLED = false;

type SpreedlyCheckoutWindow = Window & {
    SpreedlyHostedFields?: unknown;
    SpreedlyStripeAPM?: unknown;
    ApplePaySession?: ApplePaySessionConstructor;
};

const isSpreedlyCheckoutSdkLoaded = (): boolean => {
    if (typeof window === 'undefined') return false;
    const spreedlyWindow = window as SpreedlyCheckoutWindow;
    return !!(spreedlyWindow.SpreedlyHostedFields || spreedlyWindow.SpreedlyStripeAPM);
};

const CheckoutSpreedlyElements = () => {
    const { processSpreedlyPayment, processSpreedlyApmPayment } = useSpreedly();
    const { createPaymentIntent, paymentIntent, currentStep } = useCheckoutPayment();
    const { data, country, currencyCode } = useCheckoutData();
    const { hostname } = useSite().domainInfo || {};

    const [nomupayPaymentIntent, setNomupayPaymentIntent] = useState<
        CheckoutPaymentIntent | undefined
    >(undefined);
    const [googlePayState, setGooglePayState] = useState({ ready: false, supported: false });
    const [applePayState, setApplePayState] = useState({ ready: false, supported: false });
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const googlePayContainerRef = useRef<HTMLDivElement | null>(null);

    // Check Klarna support currency
    // const listingCurrency = data.listingCurrencyCode;
    // const effectiveKlarnaCurrencies = isStage ? ['USD'] : KLARNA_SUPPORTED_CURRENCIES;
    // const isListingCurrencyKlarnaAllowed =
    //     !listingCurrency || effectiveKlarnaCurrencies.includes(listingCurrency);

    // // Check enable klarna
    // const isKlarnaEnabled =
    //     (paymentIntent?.enabledApmTypes?.includes('klarna') ?? false) &&
    //     isListingCurrencyKlarnaAllowed;

    const isKlarnaEnabled = false;

    // CheckoutSpreedly loads the same SDK script for card fields. When the browser
    // dedupes that tag, a dedicated Script onLoad never fires — watch window instead.
    const subscribeSpreedlySdk = useCallback(
        (onStoreChange: () => void) => {
            if (!isKlarnaEnabled || typeof window === 'undefined') return () => {};
            if (isSpreedlyCheckoutSdkLoaded()) return () => {};

            const interval = window.setInterval(() => {
                if (isSpreedlyCheckoutSdkLoaded()) onStoreChange();
            }, 50);
            const timeout = window.setTimeout(() => window.clearInterval(interval), 15000);

            return () => {
                window.clearInterval(interval);
                window.clearTimeout(timeout);
            };
        },
        [isKlarnaEnabled]
    );

    const isKlarnaSdkReady = useSyncExternalStore(
        subscribeSpreedlySdk,
        () => isKlarnaEnabled && isSpreedlyCheckoutSdkLoaded(),
        () => false
    );

    const paymentCountryCode = country?.code?.toUpperCase() || 'EE';

    // Shared Google Pay base request
    const googlePayBaseRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
            {
                type: 'CARD',
                parameters: {
                    allowedAuthMethods: ['CRYPTOGRAM_3DS', 'PAN_ONLY'],
                    allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'],
                },
                tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {
                        gateway: 'spreedly',
                        gatewayMerchantId: paymentIntent?.spreedlyEnvKey || '',
                        spreedlyEnvironmentKey: paymentIntent?.spreedlyEnvKey || '',
                    },
                },
            },
        ],
    };

    const initGooglePay = useCallback(async () => {
        if (!window.google?.payments?.api) return;

        const client = new window.google.payments.api.PaymentsClient({
            environment: paymentIntent?.spreedlyEnv !== 'production' ? 'TEST' : 'PRODUCTION',
            merchantInfo: {
                merchantName: paymentIntent?.googleMerchantName || '',
                merchantId: paymentIntent?.googleMerchantId || '',
            },
        });

        try {
            const { result } = await client.isReadyToPay(googlePayBaseRequest);
            setGooglePayState({ ready: result, supported: result });
        } catch (err) {
            console.warn('Google Pay not available:', err);
            setGooglePayState({ ready: false, supported: false });
        }
    }, []);

    useEffect(() => {
        if (
            !googlePayState.ready ||
            !googlePayContainerRef.current ||
            !window.google?.payments?.api
        )
            return;

        const container = googlePayContainerRef.current;
        container.innerHTML = '';

        const client = new window.google.payments.api.PaymentsClient({
            environment: paymentIntent?.spreedlyEnv !== 'production' ? 'TEST' : 'PRODUCTION',
            merchantInfo: {
                merchantName: paymentIntent?.googleMerchantName || '',
                merchantId: paymentIntent?.googleMerchantId || '',
            },
        });

        const button = client.createButton({
            onClick: async () => {
                try {
                    setIsLoading(true);
                    const paymentDataRequest = {
                        ...googlePayBaseRequest,
                        transactionInfo: {
                            totalPriceStatus: 'FINAL',
                            checkoutOption: 'COMPLETE_IMMEDIATE_PURCHASE',
                            totalPriceLabel: 'Total',
                            totalPrice: String(
                                (paymentIntent?.realAmount || data.totalPrice).toFixed(2)
                            ),
                            currencyCode:
                                paymentIntent?.paymentCurrency ||
                                currencyCode?.toUpperCase() ||
                                'EUR',
                            countryCode: paymentCountryCode,
                        },
                        merchantInfo: {
                            merchantName: paymentIntent?.googleMerchantName || '',
                            merchantId: paymentIntent?.googleMerchantId || '',
                        },
                        emailRequired: true,
                    };

                    const paymentData = await client.loadPaymentData(paymentDataRequest);
                    const googleToken = paymentData.paymentMethodData.tokenizationData.token;
                    const cardInfo = paymentData.paymentMethodData?.info;

                    await processSpreedlyPayment(
                        googleToken,
                        paymentIntent!,
                        { cardNetwork: cardInfo?.cardNetwork },
                        'google_pay',
                        true
                    );
                } catch (error) {
                    console.error('Google Pay error:', error);
                } finally {
                    setIsLoading(false);
                }
            },
            buttonColor: 'black',
            buttonType: 'pay',
            buttonSizeMode: 'fill',
        });

        container.appendChild(button);
    }, [googlePayState.ready]);

    // Apple Pay check
    useEffect(() => {
        try {
            if (typeof window !== 'undefined' && window.ApplePaySession) {
                const isSupported = window.ApplePaySession.canMakePayments();
                setApplePayState({ ready: Boolean(isSupported), supported: Boolean(isSupported) });
            } else {
                setApplePayState({ ready: false, supported: false });
            }
        } catch (error) {
            console.warn('Apple Pay detection failed:', error);
            setApplePayState({ ready: false, supported: false });
        }
    }, [isInitialized]); // Trigger Apple Pay check after initialized to avoid potential conflicts with script loading

    // Initialize Google Pay and Nomupay when step becomes 2
    useEffect(() => {
        if (!paymentIntent) {
            return; //Wait for payment intent to be created before processing
        }
        const initNomupayIntent = async () => {
            try {
                const pi = await createPaymentIntent({ paymentProvider: 'nomupay' });
                setNomupayPaymentIntent(pi);
            } catch (err) {
                console.warn('Failed to create nomupay payment intent:', err);
            }
        };

        if (currentStep === CheckoutStep.CONFIRM_AND_PAY && !isInitialized) {
            setIsInitialized(true);
            const script = document.createElement('script');
            script.src = 'https://pay.google.com/gp/p/js/pay.js';
            script.async = true;
            script.onload = () => initGooglePay();
            document.body.appendChild(script);

            if (PAYPAL_ENABLED && !nomupayPaymentIntent) {
                initNomupayIntent();
            }
        }
    }, [currentStep, isInitialized]);

    // Reset wallet states and DOM when currentStep is set to YOUR_INFORMATION
    useEffect(() => {
        if (currentStep === CheckoutStep.YOUR_INFORMATION) {
            setIsInitialized(false);
            setGooglePayState({ ready: false, supported: false });
            setApplePayState({ ready: false, supported: false });
            // Clear Google Pay button DOM if present
            if (googlePayContainerRef.current) {
                googlePayContainerRef.current.innerHTML = '';
            }
        }
    }, [currentStep]);

    const handleApplePay = useCallback(async () => {
        const spreedlyWindow = window as SpreedlyCheckoutWindow;
        if (!spreedlyWindow.ApplePaySession) return;

        try {
            setIsLoading(true);
            const request = {
                countryCode: paymentCountryCode,
                currencyCode:
                    paymentIntent?.paymentCurrency || currencyCode?.toUpperCase() || 'EUR',
                supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
                merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
                requiredBillingContactFields: ['name', 'phone', 'email'],
                total: {
                    label: paymentIntent?.appleMerchantName || '',
                    amount: String(paymentIntent?.realAmount || data.totalPrice),
                },
            };

            const session = new spreedlyWindow.ApplePaySession(6, request);

            session.onvalidatemerchant = async (event: ApplePayValidateMerchantEvent) => {
                try {
                    const res = await fetch('/api/spreedly/apple-validate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ validationURL: event.validationURL }),
                    });

                    if (!res.ok) {
                        throw new Error('Failed to validate Apple Pay merchant session');
                    }

                    const merchantSession = await res.json();
                    session.completeMerchantValidation(merchantSession);
                } catch (error) {
                    console.error('Apple Pay merchant validation failed:', error);
                    setIsLoading(false);
                }
            };

            session.onpaymentauthorized = async (event: ApplePayPaymentAuthorizedEvent) => {
                try {
                    const applePayToken = JSON.stringify(event.payment.token.paymentData);
                    const applePayInfo = event.payment.token.paymentMethod;

                    await processSpreedlyPayment(
                        applePayToken,
                        paymentIntent!,
                        { network: applePayInfo?.network },
                        'apple_pay',
                        true
                    );
                    session.completePayment(session.STATUS_SUCCESS);
                } catch (error) {
                    console.error('Apple Pay authorization error:', error);
                    session.completePayment(session.STATUS_FAILURE);
                } finally {
                    setIsLoading(false);
                }
            };

            session.oncancel = () => {
                setIsLoading(false);
            };

            session.begin();
        } catch (error) {
            console.error('Apple Pay error:', error);
            setIsLoading(false);
        }
    }, [paymentIntent]);

    const handleKlarnaPay = useCallback(async () => {
        if (!paymentIntent || isLoading) return;
        setIsLoading(true);
        try {
            await processSpreedlyApmPayment('klarna', paymentIntent);
        } finally {
            setIsLoading(false);
        }
    }, [paymentIntent, processSpreedlyApmPayment, isLoading]);

    return (
        <Fragment>
            {isKlarnaEnabled && isKlarnaSdkReady ? (
                <button
                    type="button"
                    onClick={handleKlarnaPay}
                    disabled={isLoading}
                    aria-disabled={isLoading}
                    className="flex justify-center items-center bg-[#FFB3C7] hover:bg-[#ffa0bb] disabled:opacity-60 mb-1 rounded-md w-full h-12 font-semibold text-black transition-colors disabled:cursor-not-allowed"
                >
                    Pay with Klarna
                </button>
            ) : isKlarnaEnabled ? (
                <Skeleton className="mb-1 rounded-md w-full h-12" />
            ) : null}

            <div id="spreedly-klarna-element" className="sr-only" aria-hidden="true" />
            <div
                id="spreedly-google-pay-container"
                ref={googlePayContainerRef}
                className="mb-1 [&_button]:w-full! [&_button]:h-12!"
            />

            {!googlePayState.ready && isInitialized && googlePayState.supported && (
                <Skeleton className="mb-1 rounded-md w-full h-12" />
            )}

            {applePayState.supported ? (
                applePayState.ready ? (
                    <button
                        type="button"
                        onClick={handleApplePay}
                        className="flex justify-center items-center gap-2 bg-black hover:bg-gray-900 mb-1 rounded-md w-full h-12 font-medium text-white transition-colors"
                        style={{ WebkitAppearance: 'none', appearance: 'none' }}
                    >
                        <svg width="20" height="24" viewBox="0 0 20 24" fill="currentColor">
                            <path d="M15.42 12.76c-.02-2.29 1.87-3.39 1.96-3.44-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.82-.81-2.99-.79-1.54.02-2.95.89-3.74 2.27-1.6 2.77-.41 6.87 1.15 9.12.76 1.1 1.67 2.33 2.86 2.29 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.78.74 2.99.72 1.24-.02 2.02-1.12 2.77-2.22.87-1.27 1.23-2.51 1.25-2.57-.03-.01-2.4-.92-2.42-3.67z" />
                            <path d="M13.13 5.54c.63-.77 1.06-1.83.94-2.89-.91.04-2.01.61-2.66 1.37-.59.68-1.1 1.76-.96 2.8 1.01.08 2.04-.52 2.68-1.28z" />
                        </svg>
                        Pay
                    </button>
                ) : (
                    <Skeleton className="mb-1 rounded-md w-full h-12" />
                )
            ) : null}

            {PAYPAL_ENABLED ? (
                nomupayPaymentIntent ? (
                    <div className="mb-1">
                        <form
                            action={`https://${hostname}/api/nomupay`}
                            method="POST"
                            className="paymentWidgets"
                            data-brands="PAYPAL"
                        />
                        <Script
                            key={`nomupay-${nomupayPaymentIntent.paymentIntentId}`}
                            src={`${process.env.NEXT_PUBLIC_NOMUPAY_BASE_URL}/v1/paymentWidgets.js?checkoutId=${nomupayPaymentIntent.paymentIntentId}`}
                            strategy="afterInteractive"
                            integrity={nomupayPaymentIntent.clientSecret}
                            crossOrigin="anonymous"
                        />
                    </div>
                ) : (
                    <Skeleton className="mb-1 rounded-md w-full h-12" />
                )
            ) : null}
        </Fragment>
    );
};

export default CheckoutSpreedlyElements;
