'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { ClassValue } from 'clsx';
import { CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js';
import { useTranslations } from 'next-intl';
import { FieldError } from 'react-hook-form';

import { cn } from '@/lib/cn';
import countries, { countriesByPrefix } from '@/constants/countries';

import FloatingInput from '@/components/FloatingInput';
import FloatingSelect from '@/components/FloatingSelect';

export interface PhoneValue {
    formattedNumber?: string;
    internationalNumber: string;
    nationalNumber?: string;
    prefix?: string;
    countryCode?: CountryCode;
    isValid: boolean;
    forceChange?: boolean;
}

interface Props {
    value?: PhoneValue;
    error?: FieldError;
    name?: string;
    isRequired?: boolean;
    onChange: (value: PhoneValue | undefined) => void;
    onBlur?: () => void;
    containerClassName?: ClassValue;
}

const getCountyCodeByPrefix = (prefix: string | undefined) => {
    if (!prefix) return undefined;
    return countriesByPrefix.get(prefix)?.code;
};

export default function PhoneSelectInput({
    value,
    onChange,
    onBlur,
    error,
    name,
    isRequired = true,
    containerClassName,
}: Props) {
    const t = useTranslations();

    const countryCdTempRef = useRef<CountryCode | undefined>(getCountyCodeByPrefix(value?.prefix));
    const phoneInputRef = useRef<HTMLInputElement | null>(null);

    const [valueRaw, setValueRaw] = useState(value?.internationalNumber ?? '');
    const [countryCd, setCountryCd] = useState<CountryCode | undefined>(
        getCountyCodeByPrefix(value?.prefix)
    );

    const countryOptions = useMemo<{ value: string | number; label: string }[]>(
        () =>
            Object.values(countries).map((country) => ({
                value: country.code,
                label: `[${country.code}] ${country.label} (+${country.prefix})`,
            })),
        []
    );

    const handleOnchangePhoneNumber = () => {
        const phone = parsePhoneNumberFromString(valueRaw, countryCd);

        setCountryCd(phone?.country ?? countryCdTempRef.current);

        onChange?.({
            formattedNumber: phone?.formatNational(),
            internationalNumber: phone?.formatInternational() ?? '',
            nationalNumber: phone?.nationalNumber,
            prefix: phone?.countryCallingCode,
            countryCode: phone?.country,
            isValid: phone?.isValid() ?? false,
        });

        onBlur?.();
    };

    return (
        <div
            className={cn(
                'flex flex-col gap-4 sm:flex-row rtl:sm:flex-row-reverse',
                containerClassName
            )}
        >
            <FloatingSelect
                classNames={{ wrapper: 'flex-1' }}
                hideErrorMessage
                isRequired={isRequired}
                label={t('phone_country')}
                value={countryCd}
                errorMessage={error?.message}
                options={countryOptions}
                formatOptionLabel={(option) => {
                    const country = countries[option.value as CountryCode];

                    if (!country) return option.label;

                    return (
                        <span className="flex min-w-0 items-center gap-2">
                            <Image
                                src={country.flagUrl}
                                alt={country.label}
                                height={16}
                                width={23}
                                className="h-4 w-5.75 shrink-0 object-contain"
                            />
                            <span className="truncate">{option.label}</span>
                        </span>
                    );
                }}
                onChange={(countryCode) => {
                    const codeCountry = countryCode as CountryCode;
                    countryCdTempRef.current = codeCountry;
                    setCountryCd(codeCountry);
                    if (phoneInputRef.current) phoneInputRef.current.focus();
                }}
            />
            <FloatingInput
                ref={phoneInputRef}
                classNames={{ wrapper: 'flex-1' }}
                label={t('phone_number')}
                type="tel"
                inputMode="tel"
                name={name}
                required={isRequired}
                value={valueRaw}
                errorMessage={error?.message}
                onBlur={handleOnchangePhoneNumber}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        handleOnchangePhoneNumber();
                    }
                }}
                onChange={(e) => {
                    setValueRaw(e.target.value.replace(/[^\d+()\s-]/g, ''));
                }}
            />
        </div>
    );
}
