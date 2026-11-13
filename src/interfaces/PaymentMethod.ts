import Country from './Country';
import Select from './Select';

export interface PaymentMethodForm {
    email: string;
    fullname: string;
    bankCountryId: number;
    comments: string;
    iban: string;
    bic: string;
    institution: string;
    ukSortCode: string;
    accountNumber: string;
    isDefault: number;
    bankType: Select<number>;
    methodType: string;
    currency: string | null;
}

export interface PaymentMethodFormSubmit extends Omit<PaymentMethodForm, 'bankType'> {
    bankType: number;
}

export default interface PaymentMethod {
    id: number;
    created_at: string;
    changed_at: string | null;
    user_id: number;
    method_type: string;
    address_id: number | null;
    email: string;
    fullname: string;
    bank_type: number;
    beneficiary_name: string | null;
    bank_country_id: number;
    bank_country: Country;
    currency: string | null;
    uk_sort_code: string | null;
    account_number: string | null;
    iban: string | null;
    bic: string | null;
    institution: string;
    comments: string;
    is_default: number;
    active: number;
    deleted_at: string | null;
}
