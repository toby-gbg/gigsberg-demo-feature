export type ISO2A = string;
export type CurrencyISO3A = string;
export type BoolStr = '0' | '1';
export type NumericStr = `${number}`;
export type DateStr = `${number}-${number}-${number}`;
export type TimestampStr = `${DateStr} ${number}:${number}:${number}`;

export interface SecureTradingFormData {
    errorcode: string;
    transactionreference: string;
    baseamount: string;
    currencyiso3a: string;
    errormessage: string;
    enrolled: string;
    settlestatus: string;
    jwt: string;
}

export interface BaseTxnResponse {
    transactionstartedtimestamp: TimestampStr;
    livestatus: BoolStr;
    issuer: string;
    merchantcategorycode: NumericStr;
    dccenabled: BoolStr;
    settleduedate: DateStr;
    errorcode: NumericStr;
    tid: NumericStr;
    merchantnumber: string;
    merchantcountryiso2a: ISO2A;
    transactionreference: string;
    merchantname: string;
    paymenttypedescription: string;
    accounttypedescription: string;
    customfield1?: string;
    customfield2?: string;
    customfield3?: string;
    customfield4?: string;
    errormessage: string;
    issuercountryiso2a: ISO2A;
    maskedpan: string;
    enrolled: string;
    operatorname: string;
    settlestatus: NumericStr;
    debtrepayment?: BoolStr;
}

export interface ThreeDQueryResponse extends BaseTxnResponse {
    requesttypedescription: 'THREEDQUERY';
}

export interface AuthResponse extends BaseTxnResponse {
    requesttypedescription: 'AUTH';
    parenttransactionreference: string;
    acquirerresponsecode: string;
    customeroutput?: string;
    baseamount: NumericStr;
    splitfinalnumber?: NumericStr;
    securityresponsesecuritycode?: string;
    currencyiso3a: CurrencyISO3A;
    authcode: string;
    securityresponsepostcode?: string;
    securityresponseaddress?: string;
}

export type TransactionResponse = ThreeDQueryResponse | AuthResponse;

export interface GatewayInnerPayload {
    requestreference: string;
    version: string;
    jwt: string;
    response: [ThreeDQueryResponse, AuthResponse];
    secrand: string;
}

export interface SecureTradingWebhook {
    payload: GatewayInnerPayload;
}
