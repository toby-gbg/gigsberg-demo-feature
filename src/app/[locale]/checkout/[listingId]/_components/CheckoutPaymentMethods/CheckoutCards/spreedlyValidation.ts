import type { useTranslations } from 'next-intl';
import type { RegisterOptions } from 'react-hook-form';

import { fallbackTranslation } from '@/utils/common';

export interface PaymentFormValues {
    name: string;
    month: string;
    year: string;
}

export function buildSpreedlyValidationRules(t: ReturnType<typeof useTranslations>) {
    const requiredError = fallbackTranslation(
        t('field_required'),
        'field_required',
        'This field should not be empty'
    );

    return {
        name: {
            validate: (value) => !!value.trim() || requiredError,
        },
        month: {
            validate: (value) =>
                !value.trim()
                    ? requiredError
                    : /^(0?[1-9]|1[0-2])$/.test(value.trim()) ||
                      fallbackTranslation(t('invalid_month'), 'invalid_month', 'Invalid Month'),
            deps: ['year'],
        },
        year: {
            validate: (value, { month }) => {
                if (!value.trim()) return requiredError;
                if (!/^\d{4}$/.test(value.trim())) {
                    return fallbackTranslation(t('invalid_year'), 'invalid_year', 'Invalid Year');
                }
                const now = new Date();
                const year = Number(value);
                const isExpired =
                    year < now.getFullYear() ||
                    (year === now.getFullYear() &&
                        /^(0?[1-9]|1[0-2])$/.test(month.trim()) &&
                        Number(month) < now.getMonth() + 1);
                return (
                    !isExpired ||
                    fallbackTranslation(
                        t('expired_card'),
                        'expired_card',
                        'This card has expired. Please enter another one.'
                    )
                );
            },
        },
    } satisfies {
        [Field in keyof PaymentFormValues]: RegisterOptions<PaymentFormValues, Field>;
    };
}
