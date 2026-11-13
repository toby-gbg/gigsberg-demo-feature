import type { CheckEmailValue } from '@/app/[locale]/checkout/[listingId]/_components/CheckoutContactForm/CheckEmailInput';

import Country from '@/interfaces/Country';
import User from '@/interfaces/User';

import type { PhoneValue } from '@/components/PhoneSelectInput';

export interface IUserToCheckoutForm {
    first_name: string;
    last_name: string;
    email: CheckEmailValue;
    phone: IUserToPhoneDetails;
    address?: User['default_address'];
    country?: Country;
    is_update_news?: boolean;
}

export interface IUserToAccountDetails {
    first_name: string;
    last_name: string;
    email: string;
    company_name: string;
    phone: IUserToPhoneDetails;
}

export type IUserToPhoneDetails =
    Omit<PhoneValue, 'formattedNumber' | 'nationalNumber'> | undefined;
