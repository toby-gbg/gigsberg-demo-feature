export interface SpreedlyFieldError {
    key?: string;
    attribute?: string | null;
    message?: string;
}

// Spreedly's message is diagnostic copy, not a translation identifier.
export const getSpreedlyErrorKey = ({ key, attribute }: SpreedlyFieldError) => {
    const hasLabel = !!spreedlyFieldLabels[attribute || ''];
    switch (key) {
        case 'errors.blank':
            return hasLabel ? 'spreedly_field_required' : 'field_required';
        case 'errors.invalid':
            return hasLabel ? 'spreedly_field_invalid' : 'field_invalid';
        case 'errors.blank_card_type':
            return 'spreedly_field_invalid';
        case 'errors.expired':
            return 'expired_card';
        case 'errors.account_inactive':
            return 'spreedly_account_inactive';
        default:
            return 'generic_error';
    }
};

export const spreedlyFieldLabels: Record<string, string> = {
    number: 'card_number',
    verification_value: 'cvv',
    cvv: 'cvv',
    month: 'expiration_month',
    year: 'expiration_year',
    first_name: 'full_name',
    last_name: 'full_name',
    full_name: 'full_name',
    name: 'full_name',
};

export const spreedlyInlineFields: Record<string, string> = {
    month: 'expiry',
    year: 'expiry',
    verification_value: 'cvv',
    first_name: 'name',
    last_name: 'name',
    full_name: 'name',
};
