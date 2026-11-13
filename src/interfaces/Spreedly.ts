export interface SpreedlyTransactionResponse {
    state: string;
    status: string;
    success?: boolean;
    message?: string;
    transactionToken: string;
    redirectUrl?: string;
    callbackUrl?: string;
    checkoutUrl?: string;
}

export interface SpreedlyPurchaseParams {
    paymentMethodToken: string;
    amount: number;
    currencyCode: string;
    orderId: string;
    email: string;
    description?: string;
    retain_on_success?: boolean;
}

export interface SpreedlyThreeDSLifecycle {
    token: string;
    state: string;
    transaction_token: string;
    redirect_url?: string;
    checkout_url?: string;
    checkout_form?: string;
}

export interface SpreedlyWebhookBody {
    transaction_token: string;
    order_id: string;
    listing_id: string;
    quantity: string;
    status: 'succeeded' | 'failed' | 'pending';
    error_message?: string;
}

export interface SpreedlyIFrameConfig {
    environmentKey: string;
    numberEl: string;
    cvvEl: string;
    fieldType: string;
    style?: string;
}

/** Request body for Fastify POST /spreedly/purchase */
export interface SpreedlyPurchaseRequest {
    paymentMethodToken: string;
    returnUrl: string;
    paymentType: 'card' | 'google_pay' | 'apple_pay';
    isWallet: boolean;
    browserInfo?: any;
    paymentInfo?: any;
    scaAuthenticationToken?: string;
    scaState?: string;
    isTokenizedWallet?: boolean;
    paymentIntentToken?: string;
    paymentIntentId?: string;
    metadata?: string;
}

/** Request body for Fastify POST /spreedly/purchase-apm */
export interface SpreedlyApmPurchaseRequest {
    paymentIntentId: string;
    paymentIntentToken: string;
    returnUrl: string;
    apmType: 'klarna';
    metadata?: string;
}

/** Response from Fastify POST /spreedly/purchase */
export interface SpreedlyPurchaseResponse {
    status: 'success' | 'auth_required' | 'error';
    transactionToken?: string;
    redirectUrl?: string;
    checkoutUrl?: string;
    authType?: string;
    apmClientSecret?: string;
    message?: string;
    paymentMethodToken?: string;
    state?: string;
    isTokenizedWallet?: boolean;
}

export interface SpreedlyThreeDSStatusEvent {
    action: 'challenge' | 'succeeded' | 'finalization-timeout' | 'error' | string;
    token?: string;
    context?: {
        state?: string;
        message?: string;
    };
}
