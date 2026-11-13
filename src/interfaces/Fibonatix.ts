export type FibonatixStatusGroup =
    | 'Received'
    | 'Resolved'
    | 'Approved'
    | 'Pending'
    | 'Declined by Validation'
    | 'Declined by Risk Management'
    | 'Declined by Authentication'
    | 'Declined by Processor'
    | 'Declined by Issuer'
    | 'Declined by Technical Error'
    | 'Unknown';

export interface FibonatixBody {
    error_message: string;
    'processor-tx-id': string;
    amount: string;
    orderid: string;
    client_orderid: string;
    bin: string;
    descriptor: string;
    type: string;
    'card-type': string;
    merchantdata: string;
    phone: string;
    'serial-number': string;
    'last-four-digits': string;
    'card-holder-name': string;
    control: string;
    status: FibonatixStatusGroup;
    'status-code': string;
}
