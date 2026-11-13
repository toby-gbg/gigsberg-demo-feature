'use client';

import { ReactNode, useEffect, useMemo } from 'react';
import { alpha2ToAlpha3 } from 'i18n-iso-countries';
import { ArrowLeft, Info } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';

import { EventGuestDataResponse } from '@/interfaces/AttendeeDetails';
import User from '@/interfaces/User';
import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';
import { normalizeFormValue } from '@/utils/formValidation';
import { useGetCountriesQuery } from '@/swr/features/countries';
import { AttendeeXS2Scope } from '@/constants/attendee';
import { LAS_VEGAS_COUNTRY_ID } from '@/constants/country';
import { DEFAULT_LARGE_SIZE } from '@/constants/pagination';

import { useUser } from '@/providers/UserProvider';

import { Button } from '@/components/ui/Button';

import { buildAttendeeValidationRules, FIELD_RENDERERS } from './AttendeeFieldBuilder';

interface AttendeeFormValues {
    [key: string]: string;
}

interface IOptionSlect {
    value: string | number;
    label: string;
}

interface Props {
    schema: EventGuestDataResponse | null | undefined;
    activeGuestCount: number;
    isSubmitting: boolean;
    fieldErrors: Record<string, string>;
    onSubmit: (guests: Record<string, string>[]) => void;
    showBackButton?: boolean;
    onBack?: () => void;
    renderAfter?: ReactNode;
}

function getPreFilledValue(fieldName: string, user: User | null): string | undefined {
    switch (fieldName) {
        case 'first_name':
            return user?.first_name;
        case 'last_name':
            return user?.last_name;
        case 'contact_email':
            return user?.email;
        case 'contact_phone':
            return user?.phone || '';
        case 'city':
            return user?.default_address?.city;
        case 'zip':
            return user?.default_address?.postcode;
        case 'street_name':
            return user?.default_address?.address_line1;
        default:
            return undefined;
    }
}

export default function AttendeeFormFields({
    schema,
    activeGuestCount,
    isSubmitting,
    fieldErrors,
    onSubmit,
    showBackButton,
    onBack,
    renderAfter,
}: Props) {
    const t = useTranslations();
    const locale = useLocale();
    const user = useUser();
    const { data: countries } = useGetCountriesQuery({ pageSize: DEFAULT_LARGE_SIZE });

    const getScopeTranslation = () => {
        switch (schema?.scope) {
            case AttendeeXS2Scope.ALL_PERSONS: {
                return fallbackTranslation(t('all_person'), 'all_person', 'All Person');
            }
            case AttendeeXS2Scope.LEAD_GUEST:
            default: {
                return fallbackTranslation(t('lead_guest'), 'lead_guest', 'Lead Guest');
            }
        }
    };

    const getTitle = (guestIdx: number) =>
        activeGuestCount > 1 ? `${t('guest')} ${guestIdx + 1}` : t('lead_guest');

    const countryOptions = useMemo((): IOptionSlect[] => {
        if (!countries?.rows) return [];
        return countries.rows
            .map((country): IOptionSlect | null => {
                // Ignore all data that are not country
                if (country.id === LAS_VEGAS_COUNTRY_ID) return null;
                const alpha3 = alpha2ToAlpha3(country.iso_code);
                if (!alpha3) return null;
                const nameKey = `name_${locale}` as keyof typeof country;
                const label = (country[nameKey] as string) || country.name;
                return { value: alpha3, label };
            })
            .filter((o): o is IOptionSlect => o !== null);
    }, [countries, locale]);

    const preFilledValues = useMemo(() => {
        if (schema?.scope !== AttendeeXS2Scope.ALL_PERSONS || !schema?.attendersData) return {};
        const values: Record<string, string> = {};
        for (const field of schema.attendersData) {
            const val = getPreFilledValue(field.field_name, user);
            if (val) values[field.field_name] = val;
        }
        return values;
    }, [user]);

    const defaultValues = useMemo(() => {
        const values: Record<string, string> = {};
        for (let i = 0; i < activeGuestCount; i++) {
            for (const field of schema?.attendersData ?? []) {
                const key = `${field.field_name}_${i}`;
                values[key] = i === 0 ? (preFilledValues[field.field_name] ?? '') : '';
            }
        }
        return values;
    }, [preFilledValues]);

    const {
        handleSubmit,
        control,
        formState: { isValid },
        reset,
    } = useForm<AttendeeFormValues>({
        defaultValues,
        mode: 'onChange',
        reValidateMode: 'onBlur',
    });

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const getFieldError = (fieldName: string, guestIdx: number): string | undefined => {
        return fieldErrors[`${fieldName}_${guestIdx}`];
    };

    const onFormSubmit = async (formValues: AttendeeFormValues) => {
        const guests: Record<string, string>[] = [];
        for (let i = 0; i < activeGuestCount; i++) {
            const guest: Record<string, string> = {};
            for (const field of schema?.attendersData ?? []) {
                const key = `${field.field_name}_${i}`;
                guest[field.field_name] = normalizeFormValue(formValues[key] ?? '');
            }
            guests.push(guest);
        }
        await onSubmit(guests);
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-3 bg-blue-50 p-4 border border-blue-200 rounded-lg">
                <Info size={20} className="mt-0.5 text-blue-600 shrink-0" />
                <div>
                    <p className="font-semibold text-blue-800 text-sm">
                        {fallbackTranslation(
                            t('why_need_this'),
                            'why_need_this',
                            'Why do we need this?'
                        )}
                    </p>
                    <p className="mt-1 text-blue-700 text-sm">
                        {fallbackTranslation(
                            t('attendee_info_disclaimer'),
                            'attendee_info_disclaimer',
                            'The event organiser requires personal details for all attendees to verify entry on the day. This information is only shared with the organiser — not used for marketing.'
                        )}
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <span>Scope:</span>
                <div className="bg-primary-800 px-1.5 py-0.5 rounded-md text-white text-sm">
                    {getScopeTranslation()}
                </div>
            </div>
            <form onSubmit={handleSubmit(onFormSubmit)} noValidate className="space-y-6">
                {Array.from({ length: activeGuestCount }).map((_, guestIdx) => (
                    <div key={guestIdx} className="space-y-4">
                        <h3 className="font-semibold text-lg capitalize">{getTitle(guestIdx)}</h3>

                        <div className="gap-4 grid grid-cols-12">
                            {schema?.attendersData?.map((field) => {
                                const key = `${field.field_name}_${guestIdx}`;
                                const fieldError = getFieldError(field.field_name, guestIdx);
                                const validationRules = buildAttendeeValidationRules(
                                    field,
                                    t,
                                    countryOptions
                                );
                                const renderer = FIELD_RENDERERS.find((r) => r.matches(field))!;

                                return (
                                    <div key={key} className="col-span-12 md:col-span-6">
                                        <Controller
                                            name={key}
                                            control={control}
                                            rules={validationRules}
                                            render={({ field: rhfField, fieldState: { error } }) =>
                                                renderer.render({
                                                    field,
                                                    rhfField,
                                                    error: fieldError
                                                        ? {
                                                              message: fieldError,
                                                              type: 'server' as const,
                                                          }
                                                        : error,
                                                    selectOptions: countryOptions,
                                                    t,
                                                })
                                            }
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="flex items-center gap-4 pt-2">
                    {showBackButton && onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex items-center gap-2 rounded-md border border-gray-300 px-4 h-10 text-sm font-medium transition-colors hover:bg-gray-50"
                        >
                            <ArrowLeft size={16} />
                            {t('back')}
                        </button>
                    )}

                    <Button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        className={cn('h-full', {
                            'flex-1': showBackButton,
                            'w-full': !showBackButton,
                        })}
                        isLoading={isSubmitting}
                    >
                        {t('continue')}
                    </Button>
                </div>

                {renderAfter}
            </form>
        </div>
    );
}
