import Address from './Address';

export interface Lead {
    id: number;
    user_id: number;
    listing_id: number;
    url_id?: string;
    quantity: number;
    proceeds: number;
    seller_fee_percentage: number;
    buyer_fee_percentage: string;
    coupon_id: number | null;
    created_at: string;
    updated_at: string;
    user: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        phone_prefix: string;
        default_address: Address | null;
    };
    jwt?: string;
}

export default interface IStoreLead {
    listingId: number;
    quantity: string;
    affiliateId: string | undefined;
    jwt: string;
}
