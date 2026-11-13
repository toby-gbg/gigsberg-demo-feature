'use client';

import '@/assets/css/nomupay.css';

import { Fragment, useEffect, useState } from 'react';
import Script from 'next/script';
import { useLocale, useTranslations } from 'next-intl';
import { useEffectOnce, useUpdateEffect } from 'react-use';

import { CheckoutPaymentIntent, CheckoutStep } from '@/interfaces/Checkout';
import { cn } from '@/lib/cn';

import { useSite } from '@/providers/SiteProvider';
import { useUser } from '@/providers/UserProvider';

import { Skeleton } from '@/components/ui/Skeleton';

import { useCheckoutPayment } from '../../../_providers/CheckoutPaymentProvider';

const PaymentForm = ({
    brand,
    hostname,
    locale,
}: {
    brand: string;
    hostname: string;
    locale: string;
}) => (
    <form
        action={`https://${hostname}/api/nomupay?locale=${locale}`}
        method="POST"
        className="paymentWidgets"
        data-brands={brand}
    />
);
declare global {
    interface Window {
        wpwlOptions?: object;
        ApplePaySession?: {
            canMakePayments(): boolean;
            canMakePaymentsWithActiveCard(merchantIdentifier: string): Promise<boolean>;
        };
    }
}

export default function CheckoutNomupayElements() {
    const locale = useLocale();
    const t = useTranslations();

    const user = useUser();
    const domainInfo = useSite().domainInfo;
    const { hostname = '', config } = domainInfo ?? {};

    const {
        currentStep,
        paymentProvider,
        paymentIntent: defaultPaymentIntent,
        isLoading,
        createPaymentIntent,
        setMethod,
        resetMethod,
    } = useCheckoutPayment();

    const [paymentIntent, setPaymentIntent] = useState<CheckoutPaymentIntent | undefined>(
        paymentProvider === 'nomupay' ? defaultPaymentIntent : undefined
    );

    const [isApplePaySupported, setIsApplePaySupported] = useState<boolean>(false);

    // Environment-based feature flags
    const entityId = config?.payment?.nomupayEntityId || process.env.NEXT_PUBLIC_NOMUPAY_ENTITY_ID;
    const hasGooglePayConfig = !!(process.env.NEXT_PUBLIC_GOOGLE_MERCHANT_ID && entityId);
    const paymentFeatures = {
        paypal:
            process.env.NEXT_PUBLIC_PAYPAL_ENABLED === 'true' ||
            user?.email === 'nomupay-test@gigsberg.com',
        googlePay: hasGooglePayConfig, // Google Pay shown only if configured
        applePay: isApplePaySupported, // Apple Pay shown only if configured
        googleMerchantId: process.env.NEXT_PUBLIC_GOOGLE_MERCHANT_ID,
        nomupayEntityId: entityId,
        nomupayBaseUrl: process.env.NEXT_PUBLIC_NOMUPAY_BASE_URL,
    };

    const initialize = async () => {
        try {
            const paymentIntent = await createPaymentIntent({
                paymentProvider: 'nomupay',
            });
            setPaymentIntent(paymentIntent);
        } catch (error) {
            console.error('Failed to initialize Nomupay payment intent:', error);
        }
    };

    useEffect(() => {
        if (currentStep !== CheckoutStep.CONFIRM_AND_PAY) return;

        if (paymentProvider !== 'nomupay') initialize();
    }, [currentStep, paymentProvider]);

    useUpdateEffect(() => {
        if (!defaultPaymentIntent) return;

        if (paymentProvider === 'nomupay') setPaymentIntent(defaultPaymentIntent);
    }, [defaultPaymentIntent, paymentProvider]);

    // Check Apple Pay support
    useEffectOnce(() => {
        try {
            if (typeof window !== 'undefined' && window.ApplePaySession) {
                const isSupported = window.ApplePaySession.canMakePayments();
                setIsApplePaySupported(isSupported);
            } else {
                setIsApplePaySupported(false);
            }
        } catch (error) {
            console.warn('Apple Pay detection failed:', error);
            setIsApplePaySupported(false);
        }
    });

    // Configure payment widget options
    const wpwlOptions = {
        locale,
        style: 'card',
        applePay:
            paymentFeatures.applePay && isApplePaySupported
                ? {
                      displayName: 'Gigsberg',
                      total: { label: 'GIGSBERG, INC.' },
                      merchantCapabilities: ['supports3DS'],
                      supportedNetworks: ['visa', 'masterCard', 'amex'],
                  }
                : undefined,
        googlePay: paymentFeatures.googlePay
            ? {
                  merchantId: paymentFeatures.googleMerchantId!,
                  gatewayMerchantId: paymentFeatures.nomupayEntityId!,
                  buttonColor: 'black',
                  buttonType: 'pay',
                  buttonSizeMode: 'fill',
                  merchantName: 'Gigsberg',
                  shippingAddressParameters: {
                      phoneNumberRequired: true,
                  },
                  emailRequired: true,
                  billingAddressRequired: true,
                  billingAddressParameters: { format: 'FULL', phoneNumberRequired: true },
              }
            : undefined,
        onBeforeSubmitCard: () => {
            setMethod('nomupay');
            return true;
        },
        onError: (e: unknown) => {
            resetMethod();
            console.error(e);
        },
    };

    useEffect(() => {
        window.wpwlOptions = wpwlOptions;
    }, [wpwlOptions]);

    if (isLoading && currentStep === CheckoutStep.CONFIRM_AND_PAY) {
        return <Skeleton className="mb-1 h-12 w-full rounded-md" />;
    }

    if (
        !paymentIntent ||
        !paymentFeatures.nomupayBaseUrl ||
        currentStep !== CheckoutStep.CONFIRM_AND_PAY
    ) {
        return null;
    }

    return (
        <Fragment>
            <div className={cn('wpwl-express-container wpwl-nomupay-wallet-buttons', {})}>
                {/* PayPal */}
                {paymentFeatures.paypal && (
                    <PaymentForm brand="PAYPAL" hostname={hostname} locale={locale} />
                )}

                {/* Google Pay */}
                {wpwlOptions.googlePay && (
                    <PaymentForm brand="GOOGLEPAY" hostname={hostname} locale={locale} />
                )}

                {/* Apple Pay */}
                {wpwlOptions.applePay && (
                    <PaymentForm brand="APPLEPAY" hostname={hostname} locale={locale} />
                )}

                {/* Warning message for wallet payments */}
                {(wpwlOptions.googlePay || wpwlOptions.applePay) && (
                    <div className="nomupay-wallet-warning">
                        {t('nomupay_amex_wallet_not_accepted')}
                    </div>
                )}
            </div>
            <Script
                key={`nomupay-${paymentIntent.paymentIntentId}`}
                src={`${paymentFeatures.nomupayBaseUrl}/v1/paymentWidgets.js?checkoutId=${paymentIntent.paymentIntentId}`}
                strategy="afterInteractive"
                integrity={paymentIntent.clientSecret}
                crossOrigin="anonymous"
            />
        </Fragment>
    );
}
