'use client';

import { useEffect, useMemo, useState } from 'react';
import { alpha2ToAlpha3 } from 'i18n-iso-countries';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { startCase, upperFirst } from 'lodash-es';
import { useLocale, useTranslations } from 'next-intl';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import {
    AdditionalFieldValidation,
    AdditionalInformationResponse,
} from '@/interfaces/AdditionalInformation';
import {
    ExtraInformationSelectOption,
    FieldRendererContext,
    FieldRendererStrategy,
    GeneratedField,
} from '@/interfaces/ExtraInformationForm';
import { selectTriggerClassName } from '@/config/classname';
import { fallbackTranslation } from '@/utils/common';
import { parseAcceptedDate, toIsoDateString } from '@/utils/date';
import {
    getPersonNameValidationError,
    isCountryOfResidenceField,
    isDateOfBirthField,
    isValidCountrySelection,
    isValidDateOfBirth,
    normalizeFormValue,
    shouldValidatePersonName,
} from '@/utils/formValidation';
import { useGetCountriesQuery } from '@/swr/features/countries';
import {
    useSubmitExtraInfoMutation,
    useSubmitExtraInfoWithTokenMutation,
} from '@/swr/features/orders';
import { LAS_VEGAS_COUNTRY_ID } from '@/constants/country';
import { DEFAULT_LARGE_SIZE } from '@/constants/pagination';

import FloatingDatePickerSelect from '@/components/FloatingDatePickerSelect';
import FloatingInput from '@/components/FloatingInput';
import FloatingSelect from '@/components/FloatingSelect';
import PhoneSelectInput, { type PhoneValue } from '@/components/PhoneSelectInput';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

export type ExtraInformationState = Record<string, string>[];

interface ExtraInformationFormProps {
    additionalInformation: AdditionalInformationResponse | null;
    orderId: number;
    ticketCount?: number;
    token?: string;
    onSuccess?: (data: ExtraInformationState) => void;
}

const getEnumValues = (validations: AdditionalFieldValidation[]): string[] | null => {
    const v = validations.find((v) => v.startsWith('is_enum:'));
    return v ? v.slice('is_enum:'.length).split(',').filter(Boolean) : null;
};

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

const getValidationRules = (
    field: GeneratedField,
    t: ReturnType<typeof useTranslations>,
    countryOptions: ExtraInformationSelectOption[]
) => {
    const { fieldName, validations } = field;
    const rules: Record<string, unknown> = {};
    const validate: Record<string, (v: string) => true | string> = {};

    if (validations.includes('required')) {
        rules.required = fallbackTranslation(
            t('field_required'),
            'field_required',
            'This field is required'
        );
    }
    if (shouldValidatePersonName(fieldName, validations)) {
        validate.name = (v) => !v || validatePersonName(v, fieldName, t);
    }
    if (validations.includes('is_valid_email')) {
        rules.pattern = {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: fallbackTranslation(
                t('invalid_email'),
                'invalid_email',
                'Please enter a valid email'
            ),
        };
    }
    if (
        field.type === 'tel' ||
        validations.includes('is_valid_phone') ||
        validations.includes('is_phone')
    ) {
        validate.phone = (v) =>
            !v ||
            isValidPhoneNumber(v) ||
            fallbackTranslation(
                t('invalid_phone'),
                'invalid_phone',
                'Please enter a valid phone number'
            );
    }
    if (
        validations.includes('is_alphanumeric') &&
        !shouldValidatePersonName(fieldName, validations)
    ) {
        validate.alphanumeric = (v) =>
            !v ||
            /^[a-zA-Z0-9\s]+$/.test(v) ||
            fallbackTranslation(
                t('invalid_alphanumeric'),
                'invalid_alphanumeric',
                'Only letters and numbers are allowed'
            );
    }
    if (validations.includes('is_iso_8601') || validations.includes('is_valid_date')) {
        validate.iso8601 = (v) =>
            !v ||
            (isDateOfBirthField(fieldName)
                ? isValidDateOfBirth(toIsoDateString(v))
                : Boolean(parseAcceptedDate(v))) ||
            fallbackTranslation(
                t('invalid_date_with_format'),
                'invalid_date_with_format',
                'Please enter a valid date. Accepted format: YYYY-MM-DD or DD/MM/YYYY'
            );
    }
    if (validations.includes('is_iso_3166_1_alpha_3') || isCountryOfResidenceField(fieldName)) {
        validate.alpha3 = (v) =>
            !v ||
            isValidCountrySelection(v, countryOptions) ||
            fallbackTranslation(
                t('invalid_country'),
                'invalid_country',
                'Please select a valid country'
            );
    }

    const enumValues = getEnumValues(validations);
    if (enumValues) {
        validate.enumCheck = (v) =>
            !v ||
            enumValues.includes(v) ||
            fallbackTranslation(t('invalid_enum'), 'invalid_enum', 'Please select a valid option');
    }

    if (Object.keys(validate).length > 0) rules.validate = validate;
    return rules;
};

const enumRenderer: FieldRendererStrategy = {
    matches: (field) => field.type === 'enum' && getEnumValues(field.validations) !== null,
    render: ({ field, rhfField, error, t }) => {
        const enumValues = getEnumValues(field.validations)!;
        const options: ExtraInformationSelectOption[] = enumValues.map((v) => ({
            value: v,
            label: fallbackTranslation(
                t(`enum_${field.fieldName}_${v}`),
                `enum_${field.fieldName}_${v}`,
                v.charAt(0).toUpperCase() + v.slice(1)
            ),
        }));
        return (
            <FloatingSelect
                label={field.displayLabel}
                options={options}
                value={rhfField.value}
                onChange={(value) => rhfField.onChange(value == null ? '' : String(value))}
                onBlur={rhfField.onBlur}
                onOpenChange={(open) => {
                    if (!open) rhfField.onBlur();
                }}
                isRequired={field.validations.includes('required')}
                errorMessage={error?.message}
                classNames={{ trigger: selectTriggerClassName }}
            />
        );
    },
};

const countryRenderer: FieldRendererStrategy = {
    matches: (field) =>
        field.type === 'text' &&
        (field.validations.includes('is_iso_3166_1_alpha_3') ||
            isCountryOfResidenceField(field.fieldName)),
    render: ({ field, rhfField, error, selectOptions }) => (
        <FloatingSelect
            label={field.displayLabel}
            options={selectOptions ?? []}
            value={rhfField.value}
            onChange={(value) => rhfField.onChange(value == null ? '' : String(value))}
            onBlur={rhfField.onBlur}
            onOpenChange={(open) => {
                if (!open) rhfField.onBlur();
            }}
            isRequired={field.validations.includes('required')}
            isLoading={!selectOptions}
            errorMessage={error?.message}
            classNames={{ trigger: selectTriggerClassName }}
        />
    ),
};

const BIRTH_DATE_START_MONTH = new Date(1900, 0, 1);

const dateRenderer: FieldRendererStrategy = {
    matches: (field) => field.type === 'date',
    render: ({ field, rhfField, error, t }) => {
        const { value, onChange } = rhfField;
        const birthDate = isDateOfBirthField(field.fieldName);

        return (
            <FloatingDatePickerSelect
                label={fallbackTranslation(
                    t(field.fieldName),
                    field.fieldName,
                    startCase(field.fieldName)
                )}
                isRequired={field.validations.includes('required')}
                value={value ?? ''}
                onChange={(v) => onChange(v ?? '')}
                onBlur={rhfField.onBlur}
                error={error}
                disablePastDays={false}
                captionLayout="dropdown"
                disableFutureDays={birthDate}
                startMonth={birthDate ? BIRTH_DATE_START_MONTH : undefined}
            />
        );
    },
};

function ExtraInformationPhoneField({ field, rhfField, error }: FieldRendererContext) {
    const [phone, setPhone] = useState<PhoneValue>({
        internationalNumber: rhfField.value ?? '',
        isValid: isValidPhoneNumber(rhfField.value ?? ''),
    });

    return (
        <PhoneSelectInput
            name={rhfField.name}
            value={phone}
            containerClassName="sm:flex-col rtl:sm:flex-col"
            isRequired={field.validations.includes('required')}
            onChange={(value) => {
                if (!value) return;
                setPhone(value);
                const number = value.internationalNumber || value.formattedNumber || '';
                if (number !== rhfField.value) rhfField.onChange(number);
            }}
            onBlur={rhfField.onBlur}
            error={error}
        />
    );
}

const phoneRenderer: FieldRendererStrategy = {
    matches: (field) =>
        field.type === 'tel' ||
        field.validations.includes('is_phone') ||
        field.validations.includes('is_valid_phone'),
    render: (context) => <ExtraInformationPhoneField {...context} />,
};

const defaultInputRenderer: FieldRendererStrategy = {
    matches: () => true,
    render: ({ field, rhfField, error }) => {
        const { value, onChange, onBlur, ...rest } = rhfField;
        return (
            <FloatingInput
                label={field.displayLabel}
                type={field.type}
                errorMessage={error?.message}
                required={field.validations.includes('required')}
                classNames={{ wrapper: 'col-span-12' }}
                value={value ?? ''}
                onChange={onChange}
                onBlur={(event) => {
                    onChange(normalizeFormValue(event.target.value));
                    onBlur();
                }}
                {...rest}
            />
        );
    },
};

const FIELD_RENDERERS: FieldRendererStrategy[] = [
    enumRenderer,
    countryRenderer,
    dateRenderer,
    phoneRenderer,
    defaultInputRenderer, // ALWAYS KEEP THIS LAST
];

const ExtraInformationForm = ({
    additionalInformation,
    orderId,
    ticketCount = 1,
    token,
    onSuccess,
}: ExtraInformationFormProps) => {
    const t = useTranslations();
    const locale = useLocale();

    const { trigger: submitExtraInfo, isMutating: isLoadingNormalInfo } =
        useSubmitExtraInfoMutation();
    const { trigger: submitTokenExtraInfo, isMutating: isLoadingTokenInfo } =
        useSubmitExtraInfoWithTokenMutation();
    const isLoading = token ? isLoadingTokenInfo : isLoadingNormalInfo;

    const { data: countries } = useGetCountriesQuery({ pageSize: DEFAULT_LARGE_SIZE });

    const generatedFields = useMemo(() => {
        if (!additionalInformation?.extraInfoSchema?.fields) return [];

        const fields: GeneratedField[] = [];

        additionalInformation.extraInfoSchema.fields.forEach((field) => {
            const cleanFieldName = field.unique_name.replace('_%[INDEX]', '');
            const displayLabel = upperFirst(
                fallbackTranslation(t(cleanFieldName), cleanFieldName, startCase(cleanFieldName))
            );

            if (field.is_per_ticket) {
                for (let i = 0; i < ticketCount; i++) {
                    fields.push({
                        ...field,
                        fieldName: cleanFieldName,
                        displayLabel,
                        ticketIndex: i,
                    });
                }
            } else {
                fields.push({
                    ...field,
                    fieldName: cleanFieldName,
                    displayLabel,
                    ticketIndex: 0,
                });
            }
        });

        return fields.sort((a, b) => {
            if (a.ticketIndex !== b.ticketIndex) {
                return a.ticketIndex - b.ticketIndex;
            }
            return a.fieldName.localeCompare(b.fieldName);
        });
    }, [additionalInformation?.extraInfoSchema?.fields, ticketCount, t]);

    const { sharedFields, ticketGroups } = useMemo(() => {
        const shared: GeneratedField[] = [];
        const tickets = new Map<number, GeneratedField[]>();

        generatedFields.forEach((field) => {
            if (!field.is_per_ticket) {
                shared.push(field);
                return;
            }

            const group = tickets.get(field.ticketIndex) ?? [];
            group.push(field);
            tickets.set(field.ticketIndex, group);
        });

        return {
            sharedFields: shared,
            ticketGroups: [...tickets.entries()].sort(([a], [b]) => a - b),
        };
    }, [generatedFields]);

    const showTicketHeadings = ticketGroups.length > 1;

    // critical: every field starts with empty string
    const defaultValues = useMemo(() => {
        const values: Record<string, string> = {};
        const givenByUniqueName = new Map(
            (additionalInformation?.extraInfoGiven ?? []).map((item) => [
                item.unique_name,
                item.value ?? '',
            ])
        );

        generatedFields.forEach((f) => {
            const controlName = `${f.fieldName}_${f.ticketIndex}`;

            // Schema uses 0-based ticketIndex; API stores per-ticket as 1-based (first_name_1, ...)
            const lookupName = f.is_per_ticket
                ? `${f.fieldName}_${f.ticketIndex + 1}`
                : f.fieldName;

            values[controlName] = givenByUniqueName.get(lookupName) ?? '';
        });

        return values;
    }, [generatedFields, additionalInformation?.extraInfoGiven]);

    const methods = useForm<Record<string, string>>({
        defaultValues,
        mode: 'all',
    });

    const {
        handleSubmit,
        control,
        reset,
        formState: { isValid },
    } = methods;

    // keep form in sync when ticket count / schema / given values change
    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const countryOptions = useMemo((): ExtraInformationSelectOption[] => {
        if (!countries?.rows) return [];
        return countries.rows
            .map((country): ExtraInformationSelectOption | null => {
                if (country.id === LAS_VEGAS_COUNTRY_ID) return null;
                const alpha3 = alpha2ToAlpha3(country.iso_code);
                if (!alpha3) return null;
                const nameKey = `name_${locale}` as keyof typeof country;
                const label = (country[nameKey] as string) || country.name;
                return { value: alpha3, label };
            })
            .filter((o): o is ExtraInformationSelectOption => o !== null);
    }, [countries, locale]);

    const onSubmit = (formValues: Record<string, string>) => {
        const payload: ExtraInformationState = Array.from({ length: ticketCount }, () => ({}));
        Object.entries(formValues).forEach(([key, val]) => {
            const match = key.match(/^(.+)_(\d+)$/);
            if (!match) return;
            const [, fieldName, idxStr] = match;
            const normalizedValue = normalizeFormValue(val ?? '');
            payload[Number(idxStr)][fieldName] = parseAcceptedDate(normalizedValue)
                ? toIsoDateString(normalizedValue)
                : normalizedValue;
        });

        const request = token
            ? submitTokenExtraInfo({ token, orderId, extraInformation: payload })
            : submitExtraInfo({ orderId, extraInformation: payload });

        return toast.promise(
            request.then(() => {
                onSuccess?.(payload);
            }),
            {
                loading: { title: t('loading'), type: 'loading' },
                success: { title: t('success'), type: 'success' },
                error: { title: t('generic_error'), type: 'error' },
            }
        );
    };

    const renderField = (field: GeneratedField) => {
        const controlName = `${field.fieldName}_${field.ticketIndex}`;
        const renderer = FIELD_RENDERERS.find((item) => item.matches(field))!;

        return (
            <div key={controlName} className="relative">
                <Controller
                    name={controlName}
                    control={control}
                    rules={getValidationRules(field, t, countryOptions)}
                    render={({ field: rhfField, fieldState: { error } }) =>
                        renderer.render({
                            field,
                            rhfField,
                            error,
                            selectOptions: countryOptions,
                            t,
                        })
                    }
                />
            </div>
        );
    };

    if (
        !additionalInformation?.extraInfoSchema?.fields ||
        additionalInformation.extraInfoSchema.fields.length === 0
    ) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="font-bold text-black text-2xl">
                    {fallbackTranslation(
                        t('additional_info_title'),
                        'additional_info_title',
                        'We Need A Few More Details'
                    )}
                </h2>
                <p className="text-gray-500 text-sm">
                    {fallbackTranslation(
                        t('additional_info_subtitle'),
                        'additional_info_subtitle',
                        'Please fill in the details below to continue'
                    )}
                </p>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-black text-lg">
                            {fallbackTranslation(
                                t('additional_info_attendee_information'),
                                'additional_info_attendee_information',
                                'Attendee Information'
                            )}
                        </h3>

                        <div className="space-y-5">
                            {sharedFields.length > 0 && (
                                <div className="space-y-3">{sharedFields.map(renderField)}</div>
                            )}

                            {showTicketHeadings ? (
                                <Accordion
                                    key={ticketGroups.map(([ticketIndex]) => ticketIndex).join('-')}
                                    multiple
                                    keepMounted
                                    defaultValue={ticketGroups.map(([ticketIndex]) =>
                                        String(ticketIndex)
                                    )}
                                    className="gap-3 overflow-visible rounded-none border-none bg-transparent p-0 shadow-none"
                                >
                                    {ticketGroups.map(([ticketIndex, fields]) => (
                                        <AccordionItem
                                            key={ticketIndex}
                                            value={String(ticketIndex)}
                                            className="overflow-hidden rounded-xl border border-gray-200"
                                        >
                                            <AccordionTrigger className="h-auto min-h-0 px-4 py-3 text-base font-semibold text-black hover:bg-transparent">
                                                {fallbackTranslation(
                                                    t('additional_info_ticket_group', {
                                                        number: ticketIndex + 1,
                                                    }),
                                                    'additional_info_ticket_group',
                                                    `Ticket ${ticketIndex + 1}`
                                                )}
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-3">
                                                    {fields.map(renderField)}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            ) : (
                                ticketGroups.map(([ticketIndex, fields]) => (
                                    <div key={ticketIndex} className="space-y-3">
                                        {fields.map(renderField)}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <Accordion
                        className="shadow-none px-0 border-none"
                        defaultValue={['why-we-ask']}
                    >
                        <AccordionItem
                            value="why-we-ask"
                            aria-label="Why we ask"
                            className="py-0 w-full"
                        >
                            <AccordionTrigger className="justify-between items-center hover:bg-transparent py-0 h-auto min-h-0 font-medium text-black text-base">
                                {fallbackTranslation(
                                    t('additional_info_why_we_ask'),
                                    'additional_info_why_we_ask',
                                    'Why we ask'
                                )}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 text-sm">
                                <p>
                                    {fallbackTranslation(
                                        t('additional_info_why_we_ask_description'),
                                        'additional_info_why_we_ask_description',
                                        'Some events require extra attendee details to help organizers prepare for you and ensure your tickets are processed smoothly throughout.'
                                    )}
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <Button
                        type="submit"
                        className={`h-auto w-full min-h-9.5 px-3 py-3 ${
                            !isValid ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : ''
                        }`}
                        disabled={isLoading || !isValid}
                    >
                        {isLoading
                            ? fallbackTranslation(t('loading'), 'loading', 'Loading...')
                            : fallbackTranslation(t('continue'), 'continue', 'Continue')}
                    </Button>
                </form>
            </FormProvider>
        </div>
    );
};

export default ExtraInformationForm;
