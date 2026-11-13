'use client';

import { useMemo, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ClassValue } from 'clsx';
import { Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import City from '@/interfaces/City';
import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';
import { useGetCitiesQuery } from '@/swr/features/cities';
import { DEFAULT_LARGE_SIZE } from '@/constants/pagination';

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
    value: number | undefined | string;
    countryId?: number | string | undefined;
    availableCities?: City[];
    errorMessage?: string;
    hideErrorMessage?: boolean;
    isRequired?: boolean;
    onChange: (value: City | undefined) => void;
    classNames?: {
        skeleton?: ClassValue;
        trigger?: ClassValue;
    };
}

export default function CitySelect({
    value,
    countryId,
    availableCities,
    errorMessage,
    hideErrorMessage = false,
    isRequired = false,
    onChange,
    classNames,
}: Props) {
    const t = useTranslations();
    const locale = useLocale();

    const [open, setOpen] = useState(false);
    const { contains } = useComboboxFilter(locale);
    const [inputValue, setInputValue] = useState('');
    const [listElement, setListElement] = useState<HTMLDivElement | null>(null);

    const { data: defaultCities, isLoading } = useGetCitiesQuery(
        { countryId, pageSize: DEFAULT_LARGE_SIZE },
        { skip: !!availableCities }
    );
    const cities = useMemo(
        () =>
            (availableCities || defaultCities?.rows || []).filter((c) => c.country_id == countryId),
        [availableCities, defaultCities?.rows, countryId]
    );

    const options: { label: string; value: number }[] = useMemo(
        () =>
            cities.map((item) => ({
                value: item.id,
                label: item.name,
            })),
        [cities]
    );

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

    const handleChange = (payload: number | null) => {
        const selectedCity = cities.find((item) => String(item.id) === String(payload));

        if (!selectedCity || !payload) return;

        onChange?.(selectedCity);
        setOpen(false);
    };

    if (isLoading) {
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
        <div className="z-50 relative w-full">
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
                onValueChange={(payload) => handleChange(payload?.value ?? null)}
                disabled={!countryId}
            >
                <ComboboxTrigger
                    aria-required={isRequired}
                    aria-invalid={Boolean(errorMessage)}
                    aria-label={t('select_your_city')}
                    className={cn(
                        'group bg-zinc-100 flex justify-between items-center',
                        classNames?.trigger
                    )}
                >
                    <span className="flex items-center gap-0.5 group-aria-invalid:text-danger">
                        <ComboboxValue placeholder={t('select_your_city')} />
                        {isRequired && (
                            <span aria-hidden="true" className="text-danger">
                                *
                            </span>
                        )}
                    </span>
                </ComboboxTrigger>

                {value && <ComboboxClearTrigger onClick={() => onChange?.(undefined)} />}

                <ComboboxContent>
                    <ComboboxInput
                        placeholder={t('select_your_city')}
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
