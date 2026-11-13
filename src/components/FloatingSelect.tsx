'use client';

import { ComponentProps, ReactNode, useMemo } from 'react';
import { ClassValue } from 'clsx';
import { Search, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';

import { useWrappedLabel } from '@/hooks/useWrappedLabel';

import {
    Combobox,
    ComboboxCollection,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxFloatingLabel,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
    ComboboxValue,
} from '@/components/ui/Combobox';
import { Skeleton } from '@/components/ui/Skeleton';

import { Button } from './ui/Button';

export interface FloatingSelectOption {
    label: string;
    value: string | number;
}

interface Props {
    label?: string;
    placeholder?: string;
    searchPlaceholder?: string;
    value?: string | number;
    options: FloatingSelectOption[];
    onChange?: (value: string | number | undefined) => void;
    onBlur?: () => void;
    errorMessage?: string;
    isRequired?: boolean;
    isLoading?: boolean;
    isDisabled?: boolean;
    isClearable?: boolean;
    isHideSearchInput?: boolean;
    formatOptionLabel?: (option: FloatingSelectOption) => ReactNode;
    classNames?: {
        wrapper?: ClassValue;
        trigger?: ClassValue;
        label?: ClassValue;
        optionItem?: ClassValue;
        searchInput?: ClassValue;
        clearTrigger?: ClassValue;
        spinner?: ClassValue;
    };
    hideErrorMessage?: boolean;
}

type FloatingSelectComboboxProps = Pick<
    ComponentProps<typeof Combobox<FloatingSelectOption, false>>,
    'filter' | 'open' | 'onOpenChange' | 'defaultOpen'
>;

export default function FloatingSelect({
    label,
    placeholder,
    searchPlaceholder = 'Search...',
    value,
    options,
    onChange,
    onBlur,
    errorMessage,
    isRequired,
    isLoading,
    isDisabled,
    isClearable,
    isHideSearchInput,
    formatOptionLabel,
    classNames,
    hideErrorMessage = false,
    ...rest
}: Props & FloatingSelectComboboxProps) {
    const t = useTranslations();
    const locale = useLocale();
    const { labelRef, isWrapped } = useWrappedLabel();

    const selectedOption = useMemo(
        () =>
            value != null && value !== ''
                ? (options.find((option) => String(option.value) === String(value)) ?? null)
                : null,
        [options, value]
    );
    const isInvalid = !!errorMessage;
    const isInactive = isDisabled || isLoading;
    const isValue = !!selectedOption;
    const renderOptionLabel = (option: FloatingSelectOption) =>
        formatOptionLabel ? formatOptionLabel(option) : option.label;

    return (
        <div className={cn('w-full', classNames?.wrapper)}>
            <Combobox<FloatingSelectOption>
                locale={locale}
                items={options}
                {...(isHideSearchInput && { filter: null })}
                value={selectedOption}
                onValueChange={(payload) => onChange?.(payload?.value ?? '')}
                disabled={isInactive}
                {...rest}
            >
                {label && (
                    <ComboboxFloatingLabel
                        ref={labelRef}
                        isInvalid={isInvalid}
                        isRequired={isRequired}
                        isValue={isValue}
                        className={cn(
                            'inset-e-8 data-[has-value=false]:text-[13px]/5',
                            isWrapped
                                ? 'data-[has-value=true]:text-[11px]/3'
                                : 'data-[has-value=true]:text-[11px]/4',
                            classNames?.label
                        )}
                    >
                        {label}
                    </ComboboxFloatingLabel>
                )}

                {isLoading ? (
                    <Skeleton
                        className={cn(
                            'min-h-9 h-10 group-has-data-[slot=combobox-floating-label]/combobox:h-13.5 bg-zinc-100 w-full rounded-lg',
                            classNames?.spinner
                        )}
                    />
                ) : (
                    <ComboboxTrigger
                        aria-label={label}
                        aria-invalid={isInvalid}
                        onBlur={(event) => {
                            if (event.currentTarget.getAttribute('aria-expanded') !== 'true') {
                                onBlur?.();
                            }
                        }}
                        data-disabled={isInactive}
                        className={cn(
                            'bg-zinc-100 aria-invalid:bg-red-100!',
                            {
                                'pt-5': isValue && label,
                            },
                            classNames?.trigger
                        )}
                    >
                        <span
                            className={cn(
                                'min-w-0 flex-1 truncate text-sm text-black flex justify-between items-center',
                                !selectedOption && 'text-[#636367]',
                                isInvalid && 'text-danger',
                                selectedOption && formatOptionLabel && 'pe-2'
                            )}
                        >
                            {selectedOption && formatOptionLabel ? (
                                renderOptionLabel(selectedOption)
                            ) : (
                                <ComboboxValue placeholder={placeholder} />
                            )}
                            {isClearable && selectedOption && (
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        'text-zinc-400 hover:text-zinc-600',
                                        classNames?.clearTrigger
                                    )}
                                    onClick={() => onChange?.(undefined)}
                                >
                                    <X />
                                </Button>
                            )}
                        </span>
                    </ComboboxTrigger>
                )}

                <ComboboxContent>
                    {!isHideSearchInput && (
                        <ComboboxInput
                            autoFocus
                            placeholder={fallbackTranslation(
                                t('search'),
                                'search',
                                searchPlaceholder
                            )}
                            showTrigger={false}
                            showClear={false}
                            prefixIcon={<Search />}
                        />
                    )}

                    <ComboboxList>
                        <ComboboxCollection>
                            {(option) => (
                                <ComboboxItem
                                    key={option.value}
                                    value={option}
                                    className={cn('', classNames?.optionItem)}
                                >
                                    {formatOptionLabel ? renderOptionLabel(option) : option.label}
                                </ComboboxItem>
                            )}
                        </ComboboxCollection>
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
