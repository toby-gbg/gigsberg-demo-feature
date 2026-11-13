'use client';

import { useTranslations } from 'next-intl';
import { Controller, useFormContext } from 'react-hook-form';

import { AddressForm } from '@/interfaces/Address';
import OpenStreetMap from '@/interfaces/OpenStreetMap';
import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';

import CountrySelect from '@/components/CountrySelect';
import FloatingInput from '@/components/FloatingInput';
import StateSelect from '@/components/StateSelect';
import SuggestionAddressInput from '@/components/SuggestionAddressInput';

const countryWithLettersInZipCode = ['GB', 'CA', 'NL', 'IE'];

const StoreAddressForm = () => {
    const t = useTranslations();

    const { control, watch, setValue, trigger } = useFormContext<AddressForm>();

    const selectedCountry = watch('country');

    const handleSuggestionSelect = (newSuggestion: OpenStreetMap) => {
        if (!newSuggestion) return;
        const { address } = newSuggestion;
        const city = address.city || address.town || address.village || address.municipality || '';
        setValue('city', city);
        setValue('postcode', address.postcode || '');
        trigger('city');
        trigger('postcode');
    };

    return (
        <>
            <Controller
                control={control}
                name="country"
                rules={{
                    required: t('field_required'),
                }}
                render={({ field: { onChange, value: country }, fieldState: { error } }) => (
                    <>
                        <div
                            className={cn('col-span-12', {
                                'md:col-span-6': ['CA', 'US'].includes(country?.code),
                            })}
                        >
                            <CountrySelect
                                shouldExcludeCountries
                                isRequired
                                value={country?.id}
                                errorMessage={error?.message}
                                onChange={(nextCountry) => {
                                    onChange(nextCountry);
                                    if (nextCountry?.id !== country?.id) {
                                        setValue('state', null);
                                    }
                                }}
                                classNames={{ trigger: 'h-13.5', skeleton: 'h-13.5' }}
                            />
                        </div>
                        {['CA', 'US'].includes(country?.code) && (
                            <Controller
                                control={control}
                                name="state"
                                rules={{
                                    required: t('field_required'),
                                }}
                                render={({
                                    field: { onChange, value: state },
                                    fieldState: { error },
                                }) => (
                                    <div className="col-span-12 md:col-span-6">
                                        <StateSelect
                                            value={state?.id}
                                            countryId={country.id}
                                            errorMessage={error?.message}
                                            onChange={onChange}
                                            classNames={{
                                                trigger: 'h-13.5',
                                                skeleton: 'h-13.5',
                                            }}
                                        />
                                    </div>
                                )}
                            />
                        )}
                    </>
                )}
            />
            <Controller
                control={control}
                name="fullname"
                rules={{
                    maxLength: {
                        value: 50,
                        message: t('field_max_length', { length: 50 }),
                    },
                }}
                render={({ field, fieldState: { error } }) => (
                    <FloatingInput
                        label={t('full_name')}
                        classNames={{ wrapper: 'col-span-12' }}
                        errorMessage={error?.message}
                        autoComplete="name"
                        {...field}
                    />
                )}
            />

            <Controller
                control={control}
                name="address_line1"
                rules={{
                    required: t('address_required'),
                    // pattern: {
                    //     value: LATIN_REGEX,
                    //     message: t('latin_characters'),
                    // },
                }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <SuggestionAddressInput
                        value={value ?? ''}
                        countryCode={selectedCountry?.code}
                        error={error}
                        onChange={onChange}
                        onSuggestionSelect={handleSuggestionSelect}
                    />
                )}
            />

            <Controller
                control={control}
                name="city"
                rules={{ required: t('city_required') }}
                render={({ field, fieldState: { error } }) => (
                    <FloatingInput
                        required
                        label={t('city')}
                        classNames={{ wrapper: 'col-span-12 md:col-span-6' }}
                        errorMessage={error?.message}
                        autoComplete="address-level2"
                        {...field}
                    />
                )}
            />

            <Controller
                control={control}
                name="postcode"
                rules={{ required: t('postal_required') }}
                render={({ field, fieldState: { error } }) => (
                    <FloatingInput
                        required
                        label={fallbackTranslation(t('postal_code'), 'postal_code', 'Postal code')}
                        classNames={{ wrapper: 'col-span-12 md:col-span-6' }}
                        errorMessage={error?.message}
                        autoComplete="postal-code"
                        inputMode={
                            countryWithLettersInZipCode.includes(selectedCountry?.code)
                                ? 'text'
                                : 'numeric'
                        }
                        {...field}
                    />
                )}
            />

            <Controller
                control={control}
                name="address_line2"
                rules={{
                    required: false,
                }}
                render={({ field, fieldState: { error } }) => (
                    <FloatingInput
                        label={`${t('apartment_building')} (${t('optional')})`}
                        classNames={{ wrapper: 'col-span-12' }}
                        errorMessage={error?.message}
                        autoComplete="address-line2"
                        {...field}
                    />
                )}
            />
        </>
    );
};

export default StoreAddressForm;
