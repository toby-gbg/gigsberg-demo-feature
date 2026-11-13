import type { PhoneValue } from '@/components/PhoneSelectInput';

import Address, { AddressBody } from './Address';
import Website from './Website';

export interface UserDelete {
    agree: boolean;
}
export interface UpdateUserPassword {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface UpdateUser {
    email?: string;
    first_name?: string;
    last_name?: string;
    address?: AddressBody;
    company_name?: string;
    phone?: PhoneValue;
    is_update_news?: boolean;
    is_seller?: boolean;
    is_api_permitted?: boolean;
    is_payment_method_confirmed?: boolean;
    is_uk_seller?: boolean;
    is_dhl_permit?: boolean;
    is_pro?: boolean;
    seller_per_ticket_fee?: number;
    buyer_per_ticket_fee?: number;
    seller_percentage_fee?: number;
    buyer_percentage_fee?: number;
    seller_payment_method_id?: number;
    default_payment_method_id?: number;
    default_address_id?: number;
    website_currency_id?: number;
}

export default interface User {
    id: number;
    password: string;
    security_password: string;
    email: string;
    created_at: number;
    last_login_time: number;
    last_edit_update: number;
    password_updated_time: number | number;
    approved_time: number;
    inactive: number;
    user_status_id: number | null;
    company_name: string;
    fullname: string;
    first_name: string;
    last_name: string;
    phone_prefix: string | null;
    phone: string | null;
    phone_authentication: number;
    is_update_news: boolean;
    default_payment_method_id: number | null;
    default_payment_seller_method_id: number | null;
    default_address_id: number | null;
    default_address?: Address;
    default_presented_address_id: number | null;
    seller_per_ticket_fee: number;
    seller_per_ticket_currency_id: number | null;
    seller_per_ticket_currency: {
        code: string;
    } | null;
    seller_precentage_fee: number;
    buyer_per_ticket_fee: number;
    buyer_per_ticket_currency_id: number | null;
    buyer_precentage_fee: number;
    is_pro: number;
    active_listings: number;
    seller_payment_method_id: number;
    is_blacklisted: number;
    is_seller: boolean | null;
    is_api_permitted: number;
    api_secret_key: string;
    is_payment_method_confirmed: number;
    facebook_userid: string;
    is_uk_seller: number;
    is_dhl_permit: number;
    is_new_listing_blocked: boolean | null;
    website_currency_id: number;
    deleted_at: string | null;
    is_blocked: boolean;
    primary_seller_websites: Pick<Website, 'id' | 'domain'>[] | null;
    is_id_verified?: boolean;
}
