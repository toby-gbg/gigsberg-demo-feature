import type { CheckEmailValue } from '@/app/[locale]/checkout/[listingId]/_components/CheckoutContactForm/CheckEmailInput';

import type { PhoneValue } from '@/components/PhoneSelectInput';

import Address, { AddressForm } from './Address';

export enum CheckoutStep {
    YOUR_INFORMATION = 'YOUR_INFORMATION',
    ATTENDEE_DETAILS = 'ATTENDEE_DETAILS',
    CONFIRM_AND_PAY = 'CONFIRM_AND_PAY',
}

export enum PaymentProviderEnum {
    STRIPE = 'stripe',
    FIBONATIX = 'fibonatix',
    NOMUPAY = 'nomupay',
    PAYCOM = 'paycom',
    SECURE = 'secure',
    ZERO_PAY = 'zero_pay',
    SPREEDLY = 'spreedly',
}

export enum ClickSourceEnum {
    AWIN = 'Awin',
    CJ = 'CJ',
    LUUP = 'Luup',
}

export type CheckoutPaymentProvider =
    'fibonatix' | 'nomupay' | 'stripe' | 'paycom' | 'secure' | 'spreedly' | 'zero_pay';

export interface CheckoutPaymentIntent {
    clientSecret: string;
    paymentIntentId: string;

    googleMerchantName?: string;
    googleMerchantId?: string;
    appleMerchantName?: string;
    appleMerchantId?: string;

    realAmount?: number;
    paymentCurrency?: string;
    paymentIntentToken?: string;
    metadata?: string;

    // Spreedly
    spreedlyEnv?: string;
    spreedlyEnvKey?: string;
    certificateToken?: string;
    nonce?: string;
    timestamp?: string;
    signature?: string;
    acceptHeader?: string;
    inquirySupported?: boolean;
    enabledApmTypes?: string[];
    /** Allowed Klarna presentment currencies for this site (from DB config) */
    klarnaCurrencyCodes?: string[];
    /** Stripe pk_* for Spreedly Stripe APM — must match the Spreedly gateway Stripe account */
    stripePublishableKey?: string;
}

export interface CheckoutPaymentIntentForm {
    paymentProvider: CheckoutPaymentProvider;
    quantity: string;
    countryId?: number;
    currencyCode?: string;
    makeDonation?: boolean;
    userId?: number;
    leadId?: number;
    jwt: string;
    redirectUnregCookie?: string | undefined;
    couponCode?: string;
    addressId?: number;
    balanceUsed?: number;
    clickTransactionId?: string;
    clickSource?: ClickSourceEnum;
    clientId?: string;
}

export type SpreedlyWindow = Window & {
    SpreedlyStripeAPM?: new (config: Record<string, unknown>) => {
        mount(): { error?: unknown };
        confirmPayment(): Promise<{ error?: unknown }>;
    };
    Spreedly?: {
        createStripePaymentElement?: (config: Record<string, unknown>) => {
            mount(): { error?: unknown };
            confirmPayment(): Promise<{ error?: unknown }>;
        };
    };
    SpreedlyThreeDSLifecycle?: new (config: Record<string, unknown>) => { start(): void };
    serializeBrowserInfo?: (
        challengeWindowSize: string,
        acceptHeader: string
    ) => Record<string, unknown>;
};

export type CheckoutStep1Form = Partial<AddressForm> & {
    terms: boolean;
    email: CheckEmailValue;
    password: string;
    first_name: string;
    last_name: string;
    phone: PhoneValue;
    address?: Address;
    is_update_news?: boolean;
    is_fifa_accept?: boolean;
};

export interface ApplePayValidateMerchantEvent {
    validationURL: string;
}

export interface ApplePayPaymentMethod {
    displayName?: string;
    network?: string;
    type?: string;
    paymentPass?: unknown;
}

export interface ApplePayPaymentToken {
    paymentData: unknown;
    paymentMethod: ApplePayPaymentMethod;
    transactionIdentifier: string;
}

export interface ApplePayPayment {
    token: ApplePayPaymentToken;
    billingContact?: unknown;
    shippingContact?: unknown;
}

export interface ApplePayPaymentAuthorizedEvent {
    payment: ApplePayPayment;
}

export interface ApplePaySession {
    onvalidatemerchant: (event: ApplePayValidateMerchantEvent) => void;
    onpaymentauthorized: (event: ApplePayPaymentAuthorizedEvent) => void;
    oncancel: () => void;
    begin(): void;
    completeMerchantValidation(merchantSession: unknown): void;
    completePayment(status: number): void;
    readonly STATUS_SUCCESS: number;
    readonly STATUS_FAILURE: number;
}

export interface ApplePayPaymentRequest {
    countryCode: string;
    currencyCode: string;
    supportedNetworks: string[];
    merchantCapabilities: string[];
    requiredBillingContactFields?: string[];
    total: {
        label: string;
        amount: string;
    };
}

export interface ApplePaySessionConstructor {
    new (version: number, paymentRequest: ApplePayPaymentRequest): ApplePaySession;
    canMakePayments(): boolean;
    canMakePaymentsWithActiveCard(merchantIdentifier: string): Promise<boolean>;
    readonly STATUS_SUCCESS: number;
    readonly STATUS_FAILURE: number;
}
