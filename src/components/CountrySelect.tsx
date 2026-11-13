'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@nanostores/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ClassValue } from 'clsx';
import { MapPin, Navigation, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import Country from '@/interfaces/Country';
import { $userCountry } from '@/stores';
import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';
import { useGetCountriesQuery } from '@/swr/features/countries';
import { DEFAULT_EXCLUDED_COUNTRIES } from '@/constants/country';
import { DEFAULT_LARGE_SIZE } from '@/constants/pagination';

import useGeolocation from '@/hooks/useGeolocation';

import {
    Combobox,
    ComboboxClearTrigger,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
    ComboboxValue,
    useComboboxFilter,
} from '@/components/ui/Combobox';
import { Skeleton } from '@/components/ui/Skeleton';

const CITY_ROW_HEIGHT = 36;
const CITY_LIST_MAX_HEIGHT = 300;
const CITY_OVERSCAN = 10;

interface Props {
    classNames?: {
        wrapper?: ClassValue;
        skeleton?: ClassValue;
        trigger?: ClassValue;
    };
    value: number | undefined | string;
    shouldExcludeCountries?: boolean;
    excludeCountries?: string[];
    errorMessage?: string;
    hideErrorMessage?: boolean;
    isRequired?: boolean;
    isClearable?: boolean;
    onChange: (value: Country | undefined) => void;
    onData?: (countries: Country[]) => void;
}

export default function CountrySelect({
    value,
    classNames,
    shouldExcludeCountries = false,
    excludeCountries = DEFAULT_EXCLUDED_COUNTRIES,
    errorMessage,
    hideErrorMessage = false,
    isRequired = false,
    isClearable = false,
    onChange,
    onData,
}: Props) {
    const t = useTranslations();
    const locale = useLocale();
    const storedCountry = useStore($userCountry);

    const [open, setOpen] = useState(false);
    const { contains } = useComboboxFilter(locale);
    const [inputValue, setInputValue] = useState('');
    const [listElement, setListElement] = useState<HTMLDivElement | null>(null);

    const { data: countries, isLoading: isLoadingCountries } = useGetCountriesQuery(
        {
            pageSize: DEFAULT_LARGE_SIZE,
        },
        {
            onSuccess: (data) => onData?.(data.rows ? data.rows : []),
            onError: () => onData?.([]),
        }
    );

    const getLocalizedCountryName = (country: Country) => {
        const nameKey = `name_${locale}` as keyof Country;
        return (country[nameKey] as string) || country.name;
    };

    const options = useMemo<{ value: number; label: string }[]>(() => {
        if (!countries?.rows) return [];

        return countries?.rows.map((country) => ({
            value: country.id,
            label: getLocalizedCountryName(country),
        }));
    }, [countries?.rows, locale]);

    const filteredOptions = useMemo(() => {
        if (!inputValue) return options;

        return options.filter((option) => contains(option.label, inputValue));
    }, [contains, inputValue, options]);

    const listHeight = Math.min(
        Math.max(filteredOptions.length, 1) * CITY_ROW_HEIGHT + 8,
        CITY_LIST_MAX_HEIGHT
    );

    // eslint-disable-next-line react-hooks/incompatible-library
    const rowVirtualizer = useVirtualizer({
        count: filteredOptions.length,
        getScrollElement: () => listElement,
        estimateSize: () => CITY_ROW_HEIGHT,
        overscan: CITY_OVERSCAN,
        enabled: !!listElement,
    });

    const selectedOption = useMemo(
        () => options.find((option) => String(option.value) === String(value)) ?? null,
        [options, value]
    );

    const visibleCountries = useMemo(() => {
        const rows = countries?.rows || [];

        if (!shouldExcludeCountries) return rows;

        const excluded = excludeCountries.map((name) => name.trim().toUpperCase());

        return rows.filter((country) => {
            const countryName = (country.name || '').trim().toUpperCase();
            return !excluded.includes(countryName);
        });
    }, [countries, shouldExcludeCountries, excludeCountries]);

    const { handleUseMyLocation, isLoading } = useGeolocation(visibleCountries);

    const handleValueChange = (payload: number | null) => {
        const country = countries?.rows.find((item) => String(item.id) === String(payload));

        if (!country || !payload) return;

        onChange?.(country);
        setOpen(false);
    };

    const handleLocationClick = async () => {
        if (storedCountry) {
            if (!storedCountry) return;
            onChange?.(storedCountry);
            setOpen(false);
            return;
        }

        const country = await handleUseMyLocation();

        if (!country) return;

        onChange?.(country);
        setOpen(false);
    };

    if (isLoadingCountries) {
        return (
            <Skeleton
                className={cn(
                    'min-h-9 h-10 bg-zinc-200 w-full rounded-lg shadow-field',
                    classNames?.skeleton
                )}
            />
        );
    }

    return (
        <div className={cn('z-50 relative w-full', classNames?.wrapper)}>
            <Combobox<{ label: string; value: number }>
                locale={locale}
                open={open}
                onOpenChange={setOpen}
                items={options}
                filteredItems={filteredOptions}
                virtualized
                inputValue={inputValue}
                onInputValueChange={setInputValue}
                value={selectedOption}
                onValueChange={(payload) => handleValueChange(payload?.value ?? null)}
            >
                <ComboboxTrigger
                    aria-required={isRequired}
                    aria-invalid={Boolean(errorMessage)}
                    aria-label={t('select_your_country')}
                    className={cn(
                        'group bg-zinc-100 flex justify-between items-center',
                        classNames?.trigger
                    )}
                >
                    <div className="flex items-center gap-2">
                        <MapPin className="text-primary size-5" />
                        <span className="flex items-center gap-0.5 group-aria-invalid:text-danger">
                            <ComboboxValue placeholder={t('select_your_country')} />
                            {isRequired && !selectedOption && (
                                <span aria-hidden="true" className="text-danger">
                                    *
                                </span>
                            )}
                        </span>
                    </div>
                </ComboboxTrigger>

                {isClearable && selectedOption && (
                    <ComboboxClearTrigger onClick={() => onChange(undefined)} />
                )}

                <ComboboxContent>
                    {typeof navigator !== 'undefined' && navigator.geolocation ? (
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                event.preventDefault();
                                handleLocationClick();
                            }}
                            className={cn(
                                'p-2 rounded-md w-full font-medium text-gray-800 text-sm text-left transition-colors cursor-pointer hover:bg-zinc-100 flex justify-start items-center gap-2',
                                { 'pointer-events-none opacity-60': isLoading }
                            )}
                        >
                            <span className="relative flex justify-center items-center">
                                <Navigation className="text-primary size-4" />
                                {isLoading && (
                                    <span className="inline-flex absolute bg-primary opacity-50 rounded-full size-full animate-ping" />
                                )}
                            </span>
                            <span>{isLoading ? t('fetching_location') : t('use_my_location')}</span>
                        </button>
                    ) : null}

                    <ComboboxInput
                        placeholder={t('select_your_country')}
                        showTrigger={false}
                        showClear={false}
                        prefixIcon={<Search />}
                    />

                    <ComboboxList
                        ref={setListElement}
                        style={{
                            height: listHeight,
                            maxHeight: CITY_LIST_MAX_HEIGHT,
                            overflowY: 'auto',
                        }}
                    >
                        <div
                            style={{
                                height: rowVirtualizer.getTotalSize(),
                                position: 'relative',
                                width: '100%',
                            }}
                        >
                            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                                const option = filteredOptions[virtualItem.index];
                                if (!option) return null;

                                return (
                                    <ComboboxItem
                                        key={option.value}
                                        value={option}
                                        index={virtualItem.index}
                                        style={{
                                            height: virtualItem.size,
                                            transform: `translateY(${virtualItem.start}px)`,
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                        }}
                                    >
                                        <span className="block min-w-0 truncate">
                                            {option.label}
                                        </span>
                                    </ComboboxItem>
                                );
                            })}
                        </div>
                        <ComboboxEmpty>
                            {fallbackTranslation(t('no_data'), 'no_data', 'No data')}
                        </ComboboxEmpty>
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
            {!hideErrorMessage && errorMessage && (
                <p className="mt-1 text-danger text-xs">{errorMessage}</p>
            )}
        </div>
    );
}
