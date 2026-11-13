import Country from './Country';
import State from './State';

export interface AddressForm {
    address_line1: string;
    address_line2: string;
    city: string;
    state?: State | null;
    postcode: string;
    country: Country;
    fullname: string;
}

export interface AddressBody extends Omit<AddressForm, 'country' | 'state'> {
    country_id: number;
    state_id?: number | null;
    isDefault?: boolean;
}

export type DefaultAddressEntryPoint = 'checkout' | 'sell_ticket' | 'account';
export default interface Address {
    id: number;
    user_id: number;
    fullname: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state_id: number | null;
    state?: State | null;
    country_id: number;
    postcode: string;
    phone_prefix: string;
    phone: string;
    country: Country;
    is_favorite: boolean;
    isDefault?: boolean;
}
