'use client';

import { ReactElement } from 'react';
import { capitalize, startCase } from 'lodash-es';
import { useTranslations } from 'next-intl';
import { ControllerRenderProps, FieldError } from 'react-hook-form';
import validator from 'validator';

import { AttendeeField } from '@/interfaces/AttendeeDetails';
import { fallbackTranslation } from '@/utils/common';
import {
    getPersonNameValidationError,
    isCountryOfResidenceField,
    isDateOfBirthField,
    isValidCountrySelection,
    isValidDateOfBirth,
    isValidIsoCalendarDate,
    normalizeFormValue,
    shouldValidatePersonName,
} from '@/utils/formValidation';

import FloatingDatePickerSelect from '@/components/FloatingDatePickerSelect';
import FloatingInput from '@/components/FloatingInput';
import FloatingSelect from '@/components/FloatingSelect';

export interface AttendeeFieldRendererContext {
    field: AttendeeField;
    rhfField: ControllerRenderProps<Record<string, string>, string>;
    error: FieldError | undefined;
    selectOptions?: {
        value: string | number;
        label: string;
    }[];
    t: ReturnType<typeof useTranslations>;
    disabled?: boolean;
}

export interface AttendeeFieldRendererStrategy {
    matches: (field: AttendeeField) => boolean;
    render: (ctx: AttendeeFieldRendererContext) => ReactElement;
}

const validatePersonName = (
    value: string,
    fieldName: string,
    t: ReturnType<typeof useTranslations>
) => {
    const error = getPersonNameValidationError(value, fieldName);

    if (error === 'invalid_characters') {
        return fallbackTranslation(
            t('invalid_name_characters'),
            'invalid_name_characters',
            'Name can only contain letters, spaces, apostrophes, and hyphens'
        );
    }
    if (error === 'minimum_words') {
        return fallbackTranslation(
            t('invalid_full_name_minimum_words'),
            'invalid_full_name_minimum_words',
            'Please enter at least two words for the full name'
        );
    }
    if (error === 'too_long') {
        return fallbackTranslation(
            t('invalid_name_format'),
            'invalid_name_format',
            'Please enter a valid name'
        );
    }

    return true;
};

export function buildAttendeeValidationRules(
    field: AttendeeField,
    t: ReturnType<typeof useTranslations>,
    countryOptions: AttendeeFieldRendererContext['selectOptions'] = []
) {
    const rules: Record<string, unknown> = {};
    const validate: Record<string, (v: string) => true | string> = {};

    if (field.required || field.validations?.includes('required')) {
        rules.required = fallbackTranslation(
            t('field_required'),
            'field_required',
            'This field is required'
        );
    }

    for (const v of field.validations ?? []) {
        switch (v) {
            case 'is_valid_name':
                validate.name = (val) => !val || validatePersonName(val, field.field_name, t);
                break;

            case 'is_alphanumeric':
                if (shouldValidatePersonName(field.field_name, field.validations ?? [])) break;
                validate.alphanumeric = (val) =>
                    !val ||
                    validator.isAlphanumeric(val.replace(/\s/g, ''), 'en-US') ||
                    fallbackTranslation(
                        t('invalid_alphanumeric'),
                        'invalid_alphanumeric',
                        'Only letters and numbers are allowed'
                    );
                break;

            case 'is_email':
            case 'is_valid_email':
                validate.email = (val) =>
                    !val ||
                    validator.isEmail(val) ||
                    fallbackTranslation(
                        t('invalid_email'),
                        'invalid_email',
                        'Please enter a valid email'
                    );
                break;

            case 'is_valid_phone':
                validate.phone = (val) =>
                    !val ||
                    validator.isMobilePhone(val, 'any', {
                        strictMode: false,
                    }) ||
                    fallbackTranslation(
                        t('invalid_phone'),
                        'invalid_phone',
                        'Please enter a valid phone number'
                    );
                break;

            case 'is_iso_8601':
                validate.iso8601 = (val) =>
                    !val ||
                    (isDateOfBirthField(field.field_name)
                        ? isValidDateOfBirth(val)
                        : isValidIsoCalendarDate(val)) ||
                    fallbackTranslation(
                        t('invalid_date'),
                        'invalid_date',
                        'Please enter a valid date'
                    );
                break;

            case 'is_iso_3166_1_alpha_3':
                validate.alpha3 = (val) =>
                    !val ||
                    isValidCountrySelection(val, countryOptions) ||
                    fallbackTranslation(
                        t('invalid_country'),
                        'invalid_country',
                        'Please select a valid country'
                    );
                break;
        }
    }

    if (shouldValidatePersonName(field.field_name, field.validations ?? []) && !validate.name) {
        validate.name = (val) => !val || validatePersonName(val, field.field_name, t);
    }

    if (isCountryOfResidenceField(field.field_name) && !validate.alpha3) {
        validate.alpha3 = (val) =>
            !val ||
            isValidCountrySelection(val, countryOptions) ||
            fallbackTranslation(
                t('invalid_country'),
                'invalid_country',
                'Please select a valid country'
            );
    }

    if (Object.keys(validate).length > 0) rules.validate = validate;
    return rules;
}

const dateRenderer: AttendeeFieldRendererStrategy = {
    matches: (field) => field.field_type === 'date',
    render: ({ field, rhfField, error, disabled, t }) => {
        const { value, onChange } = rhfField;
        const dateOfBirth = isDateOfBirthField(field.field_name);

        return (
            <FloatingDatePickerSelect
                label={fallbackTranslation(
                    t(field.field_name),
                    field.field_name,
                    startCase(field.field_name)
                )}
                value={value}
                error={error}
                isRequired={field.required || field?.validations?.includes('required')}
                isDisabled={disabled}
                onChange={onChange}
                disablePastDays={false}
                captionLayout="dropdown"
                disableFutureDays={dateOfBirth}
            />
        );
    },
};

const selectRenderer: AttendeeFieldRendererStrategy = {
    matches: (field) => field.field_type === 'select',
    render: ({ field, rhfField, error, disabled, t }) => {
        const { value, onChange, ...rest } = rhfField;
        const options = (field.allowed_values || []).map((value) => ({
            label: capitalize(value),
            value,
        }));
        return (
            <FloatingSelect
                label={fallbackTranslation(
                    t(field.field_name),
                    field.field_name,
                    startCase(field.field_name)
                )}
                classNames={{ trigger: 'min-h-13.5 border-none' }}
                options={options}
                value={value ?? ''}
                onChange={onChange}
                isRequired={field.required}
                isDisabled={disabled}
                errorMessage={error?.message}
                {...rest}
            />
        );
    },
};

const countryRenderer: AttendeeFieldRendererStrategy = {
    matches: (field) => field.field_name === 'country_of_residence',
    render: ({ field, rhfField, error, selectOptions, disabled, t }) => {
        const { value, onChange, ...rest } = rhfField;
        return (
            <FloatingSelect
                label={fallbackTranslation(
                    t(field.field_name),
                    field.field_name,
                    startCase(field.field_name)
                )}
                classNames={{ trigger: 'min-h-13.5 border-none' }}
                options={selectOptions ?? []}
                value={value ?? ''}
                onChange={onChange}
                isRequired={field.required}
                isDisabled={disabled}
                isLoading={!selectOptions}
                errorMessage={error?.message}
                {...rest}
            />
        );
    },
};

const defaultTextRenderer: AttendeeFieldRendererStrategy = {
    matches: () => true,
    render: ({ field, rhfField, error, disabled, t }) => {
        const { value, onChange, onBlur, ...rest } = rhfField;
        return (
            <FloatingInput
                label={fallbackTranslation(
                    t(field.field_name),
                    field.field_name,
                    startCase(field.field_name)
                )}
                type="text"
                required={field.required}
                disabled={disabled}
                value={value || ''}
                onChange={onChange}
                onBlur={(event) => {
                    onChange(normalizeFormValue(event.target.value));
                    onBlur();
                }}
                errorMessage={error?.message}
                classNames={{ inputGroup: 'border-none' }}
                {...rest}
            />
        );
    },
};

export const FIELD_RENDERERS: AttendeeFieldRendererStrategy[] = [
    dateRenderer,
    selectRenderer,
    countryRenderer,
    defaultTextRenderer,
];
