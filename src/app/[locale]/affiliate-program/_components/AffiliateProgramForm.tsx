'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { isEmail } from 'validator';

import Country from '@/interfaces/Country';
import { fallbackTranslation } from '@/utils/common';
import { useSendAffiliateProgramFormMutation } from '@/swr/features/affiliate';
import { useGetCountriesQuery } from '@/swr/features/countries';
import { BRAND_NAME } from '@/constants/affiliates';

import FloatingInput from '@/components/FloatingInput';
import FloatingSelect, { type FloatingSelectOption } from '@/components/FloatingSelect';
import PhoneSelectInput, { PhoneValue } from '@/components/PhoneSelectInput';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from '@/components/ui/Toast';

type AffiliateProgramFormValues = {
    firstName: string;
    lastName: string;
    email: string;
    phone: PhoneValue;
    company: string;
    country: string;
    visitors: string;
    website: string;
    description: string;
};

const visitorsOptions = [
    'Under 1,000',
    '1,000–10,000',
    '10,000–50,000',
    '50,000–200,000',
    '200,000+',
];

type AffiliateOption = FloatingSelectOption;

export default function AffiliateProgramForm() {
    const t = useTranslations();
    const locale = useLocale();

    const { control, reset, handleSubmit } = useForm<AffiliateProgramFormValues>();

    const { trigger: submitAffiliateProgramForm, isMutating: isLoading } =
        useSendAffiliateProgramFormMutation({
            onSuccess: () => {
                toast.add({ title: t('success'), type: 'success' });
                reset();
            },
            onError: (error) => {
                toast.add({ title: t('generic_error'), type: 'error' });
                console.error('Failed to send affiliate program form', error);
            },
        });
    const { data: countries, isLoading: isLoadingCountries } = useGetCountriesQuery({
        pageSize: 300,
    });

    const getLocalizedCountryName = (country: Country) => {
        const nameKey = `name_${locale}` as keyof Country;
        return (country[nameKey] as string) || country.name;
    };

    const countryOptions = useMemo<AffiliateOption[]>(
        () =>
            (countries?.rows ?? []).map((country) => ({
                value: String(country.id),
                label: getLocalizedCountryName(country),
            })),
        [countries?.rows, locale]
    );

    const visitorOptions = useMemo<AffiliateOption[]>(
        () =>
            visitorsOptions.map((option) => ({
                value: option,
                label: fallbackTranslation(t(option), option, option),
            })),
        [t]
    );

    const companyLabel = `${fallbackTranslation(t('company'), 'company', 'Company')} / ${fallbackTranslation(t('brand'), 'brand', 'Brand')}`;
    const websiteLabel = fallbackTranslation(t('website'), 'website', 'Website');
    const descriptionPlaceholder = fallbackTranslation(
        t('audience_description'),
        'audience_description',
        'Describe your audience, content type and promotion strategy…'
    );

    const onSubmit: SubmitHandler<AffiliateProgramFormValues> = (data) => {
        const selectedCountry = countries?.rows?.find(
            (country) => country.id.toString() === data.country
        );

        submitAffiliateProgramForm({
            first_name: data?.firstName,
            last_name: data?.lastName,
            email: data?.email,
            phone_prefix: data?.phone?.prefix ? `+${data?.phone?.prefix.replace(/\+/g, '')}` : '',
            phone:
                (data?.phone?.formattedNumber || data?.phone?.nationalNumber)
                    ?.split(' ')
                    .join('') || '',
            company: data?.company,
            country: selectedCountry?.name || '',
            monthly_visitors: data?.visitors,
            website: data?.website,
            drive_traffic_question: data?.description,
        });
    };

    return (
        <form className="space-y-6" noValidate onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                    control={control}
                    name="firstName"
                    rules={{
                        required: t('field_required'),
                        maxLength: {
                            value: 100,
                            message: t('field_max_length', { length: 100 }),
                        },
                        minLength: { value: 2, message: t('field_min_length', { length: 2 }) },
                        pattern: {
                            value: /^[\p{L}][\p{L}\s'\-.]*$/u,
                            message: t('field_invalid_format'),
                        },
                    }}
                    render={({ field, fieldState: { error } }) => (
                        <FloatingInput
                            id="affiliate-first-name"
                            label={t('firstname')}
                            errorMessage={error?.message}
                            required
                            classNames={{ inputGroup: 'bg-white' }}
                            {...field}
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="lastName"
                    rules={{
                        required: t('field_required'),
                        maxLength: {
                            value: 100,
                            message: t('field_max_length', { length: 100 }),
                        },
                        minLength: { value: 2, message: t('field_min_length', { length: 2 }) },
                        pattern: {
                            value: /^[\p{L}][\p{L}\s'\-.]*$/u,
                            message: t('field_invalid_format'),
                        },
                    }}
                    render={({ field, fieldState: { error } }) => (
                        <FloatingInput
                            id="affiliate-last-name"
                            label={t('lastname')}
                            errorMessage={error?.message}
                            required
                            classNames={{ inputGroup: 'bg-white' }}
                            {...field}
                        />
                    )}
                />
            </div>
            <Controller
                name="email"
                control={control}
                rules={{
                    required: t('field_required'),
                    validate: (email) => isEmail(email) || t('invalid_email_format'),
                }}
                render={({ field, fieldState: { error } }) => (
                    <FloatingInput
                        id="affiliate-email"
                        label={t('email_address')}
                        type="email"
                        errorMessage={error?.message}
                        required
                        classNames={{ inputGroup: 'bg-white' }}
                        {...field}
                    />
                )}
            />
            <Controller
                control={control}
                name="phone"
                rules={{
                    required: t('phone_required'),
                    validate: (value) => value?.isValid || t('invalid_phone_format'),
                }}
                render={({ field, fieldState }) => (
                    <PhoneSelectInput
                        onChange={field.onChange}
                        value={field.value}
                        error={fieldState.error}
                    />
                )}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                    control={control}
                    name="company"
                    rules={{
                        required: t('field_required'),
                        maxLength: {
                            value: 100,
                            message: t('field_max_length', { length: 100 }),
                        },
                        minLength: { value: 2, message: t('field_min_length', { length: 2 }) },
                        pattern: {
                            value: /^[\p{L}\p{N}][\p{L}\p{N}\s'\-.]*$/u,
                            message: t('field_invalid_format'),
                        },
                    }}
                    render={({ field, fieldState: { error } }) => (
                        <FloatingInput
                            id="affiliate-company"
                            label={companyLabel}
                            errorMessage={error?.message}
                            required
                            classNames={{ inputGroup: 'bg-white' }}
                            {...field}
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="website"
                    rules={{
                        required: t('field_required'),
                        maxLength: {
                            value: 1500,
                            message: t('field_max_length', { length: 1500 }),
                        },
                        minLength: { value: 4, message: t('field_min_length', { length: 4 }) },
                        pattern: {
                            value: /^(https?:\/\/)?(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(:\d+)?(\/[^\s]*)?$/,
                            message: t('field_invalid_format'),
                        },
                    }}
                    render={({ field, fieldState: { error } }) => (
                        <FloatingInput
                            id="affiliate-website"
                            label={websiteLabel}
                            errorMessage={error?.message}
                            required
                            classNames={{ inputGroup: 'bg-white' }}
                            {...field}
                        />
                    )}
                />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                    control={control}
                    name="country"
                    rules={{
                        required: t('field_required'),
                    }}
                    render={({ field, fieldState: { error } }) => (
                        <FloatingSelect
                            label={t('select_your_country')}
                            options={countryOptions}
                            value={field.value}
                            onChange={(value) => field.onChange(value == null ? '' : String(value))}
                            isLoading={isLoadingCountries}
                            isRequired
                            errorMessage={error?.message}
                            classNames={{ trigger: 'bg-white' }}
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="visitors"
                    rules={{ required: t('field_required') }}
                    render={({ field, fieldState: { error } }) => (
                        <FloatingSelect
                            label={fallbackTranslation(
                                t('monthly_visitors'),
                                'monthly_visitors',
                                'Monthly Visitors'
                            )}
                            options={visitorOptions}
                            value={field.value}
                            onChange={(value) => field.onChange(value == null ? '' : String(value))}
                            isRequired
                            errorMessage={error?.message}
                            classNames={{ trigger: 'bg-white' }}
                        />
                    )}
                />
            </div>
            <Controller
                control={control}
                name="description"
                rules={{
                    required: t('field_required'),
                    minLength: { value: 5, message: t('field_min_length', { length: 5 }) },
                    maxLength: {
                        value: 1500,
                        message: t('field_max_length', { length: 1500 }),
                    },
                    pattern: {
                        value: /^(?!.*(<[^>]+>|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html|\bon\w+\s*=|\b(OR|AND)\b\s+(\d+\s*=\s*\d+|'[^']+'\s*=\s*'[^']+'|"[^"]+"\s*=\s*"[^"]+")))[\s\S]*$/i,
                        message: t('field_invalid_format'),
                    },
                }}
                render={({ field, fieldState: { error } }) => (
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="affiliate-description"
                            className="text-[12px] text-white md:text-[14px]"
                        >
                            {fallbackTranslation(
                                t('traffic_strategy', { brandName: BRAND_NAME }),
                                'traffic_strategy',
                                `How will you drive traffic to ${BRAND_NAME}?`
                            )}{' '}
                            <span aria-hidden="true" className="text-red-500">
                                *
                            </span>
                        </label>
                        <Textarea
                            id="affiliate-description"
                            required
                            aria-invalid={Boolean(error)}
                            aria-describedby={
                                error?.message
                                    ? 'affiliate-description-error'
                                    : 'affiliate-description-description'
                            }
                            placeholder={descriptionPlaceholder}
                            className="min-h-28 border-none bg-white! text-neutral-900 shadow-xs focus-visible:border-none focus-visible:ring-2 focus-visible:ring-ring/50"
                            {...field}
                            value={field.value ?? ''}
                        />
                        {error?.message ? (
                            <p id="affiliate-description-error" className="text-danger text-xs">
                                {error.message}
                            </p>
                        ) : (
                            <p
                                id="affiliate-description-description"
                                className="text-xs text-white/60"
                            >
                                {descriptionPlaceholder}
                            </p>
                        )}
                    </div>
                )}
            />
            <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1a5fff] text-white"
                isLoading={isLoading}
            >
                {fallbackTranslation(
                    t('signup_affiliate'),
                    'signup_affiliate',
                    'Sign Up as an Affiliate'
                )}
            </Button>
        </form>
    );
}
