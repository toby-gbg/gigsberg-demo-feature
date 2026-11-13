import PaymentMethod, { PaymentMethodForm } from '@/interfaces/PaymentMethod';
import { AUSTRALIA_ID, MEXICO_ID, UK_ID, USA_ID } from '@/constants/countries';

// Rules from tickets https://gigsberg.atlassian.net/browse/WLB-1205 and WLB-3008
export const getPaymentAccountRules = (countryId: number | undefined, currency: string | null) => {
    const hasNoRestrictions = countryId === AUSTRALIA_ID || countryId === MEXICO_ID;
    const selectedCurrency = currency ?? '';

    const hasSelection = Boolean(countryId && selectedCurrency);
    const isSupportedCurrency = ['EUR', 'USD', 'GBP'].includes(selectedCurrency);
    const shouldRequireBankDetails = hasSelection && isSupportedCurrency && !hasNoRestrictions;
    const isUsDollarAccount = countryId === USA_ID && selectedCurrency === 'USD';

    return {
        iban: true,
        bic: true,
        accountNumber: true,
        sortCode: true,
        required: {
            iban: shouldRequireBankDetails && countryId !== USA_ID,
            bic: shouldRequireBankDetails && !isUsDollarAccount,
            accountNumber:
                shouldRequireBankDetails &&
                (countryId === USA_ID || (countryId === UK_ID && selectedCurrency === 'GBP')),
            sortCode: shouldRequireBankDetails && countryId === UK_ID && selectedCurrency === 'GBP',
            bicOrSortCode: shouldRequireBankDetails && isUsDollarAccount,
        },
    };
};

export const getRoutingDetailsError = (bic: string, sortCode: string) => {
    if (!bic && !sortCode) return 'required';
    if (bic && sortCode) return 'exclusive';

    return null;
};

export const mapPaymentMethodForm = (input: PaymentMethod): PaymentMethodForm => {
    return {
        accountNumber: input.account_number ?? '',
        bankCountryId: input.bank_country_id,
        bic: input.bic ?? '',
        ukSortCode: input.uk_sort_code ?? '',
        currency: input.currency ?? null,
        bankType: {
            value: input.bank_type,
            label: '',
        },
        iban: input.iban ?? '',
        comments: input.comments,
        email: input.email,
        fullname: input.fullname,
        methodType: input.method_type,
        isDefault: input.is_default,
        institution: input.institution,
    };
};
