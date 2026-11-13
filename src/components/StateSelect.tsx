'use client';

import { useMemo } from 'react';
import { ClassValue } from 'clsx';
import { Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import State from '@/interfaces/State';
import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';
import { useGetStatesQuery } from '@/swr/features/states';

import {
    Combobox,
    ComboboxClearTrigger,
    ComboboxCollection,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
    ComboboxValue,
} from '@/components/ui/Combobox';
import { Skeleton } from '@/components/ui/Skeleton';

interface Props {
    classNames?: {
        wrapper?: ClassValue;
        skeleton?: ClassValue;
        trigger?: ClassValue;
    };
    value: number | undefined | string;
    countryId?: number;
    availableStates?: State[];
    isDisabled?: boolean;
    errorMessage?: string;
    hideErrorMessage?: boolean;
    isRequired?: boolean;
    onChange?: (state: State | null) => void;
    onData?: (states: State[]) => void;
}

export default function StateSelect({
    classNames,
    value,
    countryId,
    availableStates,
    hideErrorMessage = false,
    errorMessage,
    isDisabled = false,
    isRequired = false,
    onChange,
    onData,
}: Props) {
    const t = useTranslations();
    const locale = useLocale();

    const { data: defaultStates, isLoading: isLoadingState } = useGetStatesQuery(
        {},
        {
            skip: !!availableStates,
            onSuccess: (states) => {
                const countryStates = states.filter((state) => state.country_id === countryId);
                onData?.(countryStates);
            },
            onError: () => onData?.([]),
        }
    );

    const states = useMemo(
        () => (availableStates || defaultStates || []).filter((s) => s.country_id === countryId),
        [availableStates, defaultStates, countryId]
    );

    const options: { label: string; value: number }[] = useMemo(
        () =>
            states.map((state) => ({
                value: state.id,
                label: state.name === 'no_state' ? t(state.name) : state.name,
            })),
        [states]
    );

    const selectedOption = useMemo(
        () => options.find((option) => option.value === value) ?? null,
        [options, value]
    );

    const handleValueChange = (payload: number | null) => {
        const state = states.find((item) => item.id === payload) ?? null;

        if (!state || !payload) return;

        onChange?.(state);
    };

    if (isLoadingState) {
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
                items={options}
                disabled={isDisabled}
                value={selectedOption}
                onValueChange={(payload) => handleValueChange(payload?.value ?? null)}
            >
                <ComboboxTrigger
                    aria-required={isRequired}
                    aria-invalid={Boolean(errorMessage)}
                    aria-label={t('select_your_state')}
                    className={cn(
                        'group bg-zinc-100 flex justify-between items-center',
                        classNames?.trigger
                    )}
                >
                    <span className="flex items-center gap-0.5 group-aria-invalid:text-danger">
                        <ComboboxValue placeholder={t('select_your_state')} />
                        {isRequired && (
                            <span aria-hidden="true" className="text-danger">
                                *
                            </span>
                        )}
                    </span>
                </ComboboxTrigger>

                {value && <ComboboxClearTrigger onClick={() => onChange?.(null)} />}

                <ComboboxContent>
                    <ComboboxInput
                        placeholder={t('select_your_state')}
                        showTrigger={false}
                        showClear={false}
                        prefixIcon={<Search />}
                    />

                    <ComboboxList>
                        <ComboboxCollection>
                            {(option) => (
                                <ComboboxItem key={option.value} value={option}>
                                    <span className="block min-w-0 truncate">{option.label}</span>
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
