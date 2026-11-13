export interface ResultInfoBase {
    code: string;
    description: string;
}

export interface ResultDetails {
    ConnectorTxID1: string;
}

export interface AuthenticationInfo {
    entityId: string;
}

export interface CardInfo {
    bin: string;
    last4Digits: string;
    holder: string;
    expiryMonth?: string;
    expiryYear?: string;
}

export interface RiskInfo {
    score: string;
}

export interface RedirectInfo {
    parameters: unknown[];
}

export interface CustomerInfo {
    givenName?: string;
    surname?: string;
    merchantCustomerId?: string;
    sex?: 'F' | 'M' | string;
    email?: string;
    ip: string;
}

export interface BasePayload {
    paymentBrand: string;
    authentication: AuthenticationInfo;
    risk: RiskInfo;
    timestamp: string;
    ndc: string;
    channelName: string;
    source: string;
    paymentMethod: string;
    shortId: string;
}

interface ThreeDSecure {
    eci: string;
}

export interface NomupayPaymentWebhook extends BasePayload {
    id: string;
    paymentType: 'PA';
    amount: string;
    currency: string;
    presentationAmount: string;
    presentationCurrency: string;
    descriptor: string;
    merchantTransactionId: string;
    result: ResultInfoBase;
    card: Required<CardInfo>;
    customer: CustomerInfo;
    threeDSecure: ThreeDSecure;
    customParameters: {
        SHOPPER_promoCode: string;
    };
    merchantMemo: string;
    buildNumber: string;
}
