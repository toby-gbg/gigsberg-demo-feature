'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ClassValue } from 'clsx';
import { ChevronDown, MapPin, Navigation, Search, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { FieldError } from 'react-hook-form';

import Country from '@/interfaces/Country';
import { $userCountry } from '@/stores';
import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';

import useGeolocation from '@/hooks/useGeolocation';

import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
    ComboboxValue,
    useComboboxFilter,
} from '@/components/ui/Combobox';
import type { ComboboxOption } from '@/components/ui/Combobox';
import { Skeleton } from '@/components/ui/Skeleton';

const SELECT_RECORD_ROW_HEIGHT = 36;
const SELECT_RECORD_LIST_MAX_HEIGHT = 300;
const SELECT_RECORD_OVERSCAN = 10;

type TOption = ComboboxOption<string | number>;
interface Props<D extends TOption> {
    fullWidth?: boolean;
    classNames?: {
        wrapper?: ClassValue;
        trigger?: ClassValue;
        iconClassName?: ClassValue;
        skeletonClassName?: ClassValue;
        labelClassName?: ClassValue;
    };
    hideLabel?: boolean;
    label?: string;
    isRequired?: boolean;
    isClearable?: boolean;
    error?: FieldError;
    value?: string | number;
    loading?: boolean;
    isUseMyLocation?: boolean;
    placeholder?: string;
    isDisabled?: boolean;
    isIconTrigger?: boolean;
    visibleCountries?: Country[];
    countries?: Country[];
    options?: D[];
    onChange?: (value: D['value'] | null) => void;
}

export default function SelectComboboxVirtualized<D extends TOption>({
    classNames,
    label = '',
    hideLabel,
    placeholder,
    fullWidth,
    value,
    error,
    loading = false,
    isDisabled = false,
    isRequired = false,
    isClearable = false,
    isUseMyLocation = false,
    isIconTrigger = true,
    visibleCountries = [],
    options = [],
    onChange,
}: Props<D>) {
    const t = useTranslations();
    const locale = useLocale();
    const errorMessageId = useId();
    const storedCountry = useStore($userCountry);

    const { contains } = useComboboxFilter(locale);
    const { handleUseMyLocation, isLoading } = useGeolocation(visibleCountries);

    const comboboxAnchorRef = useRef<HTMLDivElement | null>(null);

    const [comboboxListElement, setComboboxListElement] = useState<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const selectedOption = useMemo(
        () => options.find((option) => String(option.value) === String(value)) ?? null,
        [options, value]
    );

    const filteredOptions = useMemo(() => {
        if (!inputValue) return options;

        return options.filter((option) => contains(option.label, inputValue));
    }, [contains, inputValue, options]);

    const listHeight = Math.min(
        Math.max(filteredOptions.length, 1) * SELECT_RECORD_ROW_HEIGHT + 8,
        SELECT_RECORD_LIST_MAX_HEIGHT
    );

    // TanStack Virtual returns imperative helpers; React Compiler should skip this hook.
    // eslint-disable-next-line react-hooks/incompatible-library
    const rowVirtualizer = useVirtualizer({
        count: filteredOptions.length,
        getScrollElement: () => comboboxListElement,
        estimateSize: () => SELECT_RECORD_ROW_HEIGHT,
        overscan: SELECT_RECORD_OVERSCAN,
        initialRect: {
            height: SELECT_RECORD_LIST_MAX_HEIGHT,
            width: 0,
        },
        enabled: !!comboboxListElement,
    });

    const handleValueChange = (nextValue: D['value'] | null) => {
        onChange?.(nextValue);
        setOpen(false);
    };

    const handleLocationClick = async () => {
        if (storedCountry) {
            onChange?.(storedCountry.id as D['value']);
            setOpen(false);
            return;
        }

        const country = await handleUseMyLocation();
        if (country) onChange?.(country.id as D['value']);
        setOpen(false);
    };

    return (
        <div
            className={cn('z-50 relative w-full', classNames?.wrapper, {
                'xl:max-w-71': !fullWidth,
            })}
        >
            {!hideLabel && (
                <label
                    className={cn('block mb-1.5 text-black text-sm', classNames?.labelClassName)}
                >
                    {label ?? t('country')} {isRequired && <span className="text-red-500">*</span>}{' '}
                    :
                </label>
            )}

            {loading ? (
                <Skeleton
                    className={cn(
                        'bg-white border border-gray-300 rounded-lg w-full min-h-10',
                        classNames?.skeletonClassName
                    )}
                />
            ) : (
                <Combobox<D>
                    locale={locale}
                    open={open}
                    onOpenChange={setOpen}
                    disabled={isDisabled}
                    items={options}
                    filteredItems={filteredOptions}
                    virtualized
                    inputValue={inputValue}
                    onInputValueChange={setInputValue}
                    value={selectedOption}
                    onValueChange={(payload) => handleValueChange(payload?.value ?? null)}
                >
                    <div ref={comboboxAnchorRef} className="relative w-full">
                        <ComboboxTrigger
                            aria-label={placeholder}
                            aria-invalid={error ? true : undefined}
                            aria-describedby={error?.message ? errorMessageId : undefined}
                            className={cn(
                                'flex h-10 min-h-10 w-full cursor-pointer items-center justify-between rounded-lg border-none bg-white px-3 text-left text-sm text-black shadow-sm transition-colors hover:bg-zinc-50',
                                'focus-visible:outline-none focus-visible:ring-0',
                                classNames?.trigger
                            )}
                        >
                            <span className="flex min-w-0 flex-1 items-center gap-2">
                                {isIconTrigger && (
                                    <MapPin
                                        className={cn(
                                            'text-primary size-5',
                                            classNames?.iconClassName
                                        )}
                                    />
                                )}
                                <span
                                    className={cn(
                                        'min-w-0 flex-1 truncate',
                                        !value && 'text-muted-foreground',
                                        isClearable && value && 'pr-8'
                                    )}
                                >
                                    <ComboboxValue placeholder={placeholder} />
                                </span>
                            </span>
                            <ChevronDown className="ml-2 size-4 shrink-0 text-gray-400" />
                        </ComboboxTrigger>
                        {isClearable && value ? (
                            <button
                                type="button"
                                aria-label="Clear country selection"
                                onPointerDown={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onChange?.(null);
                                }}
                                className="absolute top-1/2 right-8 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition-colors hover:text-black"
                            >
                                <X className="size-4" />
                            </button>
                        ) : null}
                    </div>

                    <ComboboxContent
                        className="w-(--anchor-width)! min-w-(--anchor-width)! animate-none! transition-none! duration-0! data-open:animate-none! data-closed:animate-none! data-open:fade-in-0! data-closed:fade-out-0! data-open:zoom-in-100! data-closed:zoom-out-100! **:animate-none! **:transition-none! **:duration-0! pt-2 pb-0 px-0"
                        anchor={comboboxAnchorRef}
                    >
                        {isUseMyLocation &&
                        typeof navigator !== 'undefined' &&
                        navigator.geolocation ? (
                            <div className="p-1 border-gray-200 border-b">
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        event.preventDefault();
                                        handleLocationClick();
                                    }}
                                    className={cn(
                                        'flex items-center gap-2 hover:bg-zinc-100 px-3 py-2 rounded-md w-full transition-colors cursor-pointer font-medium text-gray-800 text-sm text-left',
                                        { 'pointer-events-none opacity-60': isLoading }
                                    )}
                                >
                                    <span className="relative flex justify-center items-center size-5">
                                        <Navigation className="text-primary" size={16} />
                                        {isLoading && (
                                            <span className="inline-flex absolute bg-primary opacity-50 rounded-full size-full animate-ping" />
                                        )}
                                    </span>
                                    {isLoading ? t('fetching_location') : t('use_my_location')}
                                </button>
                            </div>
                        ) : null}

                        <div className="px-3 py-1">
                            <ComboboxInput
                                autoFocus
                                placeholder={placeholder}
                                showTrigger={false}
                                showClear={false}
                                onFocus={(event) => event.currentTarget.select()}
                                classNames={{
                                    wrapper:
                                        'h-10 min-h-10 w-full border-gray-300 bg-white focus-within:border-[#022D5F]! focus-within:border-[2px]! focus-within:ring-0!',
                                }}
                                prefixIcon={<Search />}
                            />
                        </div>

                        <ComboboxList
                            ref={setComboboxListElement}
                            style={{
                                height: listHeight,
                                maxHeight: SELECT_RECORD_LIST_MAX_HEIGHT,
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
                                            className={cn(
                                                'absolute left-0 top-0 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 pr-8 text-sm text-black outline-none transition-colors',
                                                'data-highlighted:bg-zinc-100! data-highlighted:**:text-black! aria-highlighted:bg-zinc-100! aria-highlighted:**:text-black!',
                                                'aria-selected:bg-gray-300! aria-selected:**:text-black! data-selected:bg-gray-300! data-selected:**:text-black!'
                                            )}
                                            style={{
                                                height: virtualItem.size,
                                                transform: `translateY(${virtualItem.start}px)`,
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
            )}
            {error?.message && (
                <p id={errorMessageId} className="mt-1 text-danger text-xs">
                    {error.message}
                </p>
            )}
        </div>
    );
}
