'use client';

import { FC, useMemo, useRef, useState } from 'react';
import debounce from 'lodash-es/debounce';
import { useLocale, useTranslations } from 'next-intl';
import { FieldError } from 'react-hook-form';
import { useEffectOnce, useUpdateEffect } from 'react-use';

import OpenStreetMap, { SuggestedLocationSearchRequest } from '@/interfaces/OpenStreetMap';
import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';
import { useLazyGetSuggestedLocationsQuery } from '@/swr/features/openStreetMap';

import {
    Combobox,
    ComboboxCollection,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxFloatingLabel,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/Combobox';

interface Props {
    value?: string;
    countryCode?: string;
    error?: FieldError;
    onChange?: (value: string) => void;
    onSuggestionSelect?: (suggestion: OpenStreetMap) => void;
}

type SuggestionAddressOption = {
    value: number;
    label: string;
    suggestion: OpenStreetMap;
};

// No heavy uses (an absolute maximum of 1 request per second).
// Nominatim Usage Policy (aka Geocoding Policy): https://operations.osmfoundation.org/policies/nominatim
const DEBOUNCE_TIME_MILISECONDS = 1000;
const DEBOUNCE_INPUT = 500;

// Normalize search text so equivalent inputs for cache key and API query.
// Example: "  queen   street " -> "queen street"
const formatSearchValue = (search: string) => search.trim().replace(/\s+/g, ' ');

const getQueryKey = (searchData: SuggestedLocationSearchRequest) => {
    return `${formatSearchValue(searchData.search).toLowerCase()}_${searchData?.locale?.toLowerCase() ?? ''}_${searchData?.countryCode?.toLowerCase() ?? ''}`;
};

const SuggestionAddressInput: FC<Props> = ({
    value = '',
    countryCode,
    error,
    onChange,
    onSuggestionSelect,
}) => {
    const locale = useLocale();
    const t = useTranslations();

    const [suggestions, setSuggestions] = useState<SuggestionAddressOption[]>([]);

    const activeSearchDataRef = useRef<SuggestedLocationSearchRequest | null>(null);
    const cacheRef = useRef(new Map<string, SuggestionAddressOption[]>());
    const lastRequestTimeRef = useRef(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearSuggestions = () => setSuggestions([]);

    const { trigger: getSuggestedLocations, isMutating: isLoading } =
        useLazyGetSuggestedLocationsQuery({
            onSuccess: (res) => {
                if (!activeSearchDataRef.current) return;

                const key = getQueryKey(activeSearchDataRef.current);
                const responseSuggestions = res.map((suggestion) => ({
                    value: suggestion.place_id,
                    label: suggestion.display_name,
                    suggestion,
                }));
                setSuggestions(responseSuggestions);

                cacheRef.current.set(key, responseSuggestions);
            },
            onError: () => clearSuggestions(),
        });

    const selectedOption = useMemo(
        () => suggestions.find((option) => option.label === value) ?? null,
        [suggestions, value]
    );

    const isValue = useMemo(
        () => Boolean(selectedOption) || Boolean(value),
        [selectedOption, value]
    );

    const fetchDebounceRef = useRef(
        debounce((searchData: SuggestedLocationSearchRequest) => {
            const fetchSuggestions = () => {
                activeSearchDataRef.current = searchData;
                lastRequestTimeRef.current = Date.now();
                getSuggestedLocations(searchData);
            };

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            // eslint-disable-next-line react-hooks/purity
            const now = Date.now();
            const diff = now - lastRequestTimeRef.current;
            const waitTime = Math.max(0, DEBOUNCE_TIME_MILISECONDS - diff);
            if (waitTime <= 0) {
                fetchSuggestions();
                return;
            }
            timeoutRef.current = setTimeout(() => {
                fetchSuggestions();
            }, waitTime);
        }, DEBOUNCE_INPUT)
    );

    useEffectOnce(() => {
        return () => {
            fetchDebounceRef.current.cancel();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    });

    useUpdateEffect(() => {
        clearSuggestions();
    }, [countryCode]);

    const triggerFetch = (searchParam: string) => {
        fetchDebounceRef.current.cancel();
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        const search = formatSearchValue(searchParam);
        const key = getQueryKey({ search, locale, countryCode });
        const cached = cacheRef.current.get(key);
        if (cached) {
            setSuggestions(cached);
            return;
        }

        fetchDebounceRef.current({ search, locale, countryCode });
    };

    const handleInputValueChange = (nextValue: string, eventDetails: { reason: string }) => {
        if (eventDetails.reason !== 'input-change') return;

        onChange?.(nextValue);
        // Clear stale suggestions when the query is too short or empty.
        if (!nextValue) {
            clearSuggestions();
            return;
        }
        triggerFetch(formatSearchValue(nextValue));
    };

    const handleSelect = (suggestion: OpenStreetMap) => {
        const newValue = suggestion.display_name;
        onChange?.(newValue);
        onSuggestionSelect?.(suggestion);
    };

    return (
        <div className="col-span-12">
            <Combobox<SuggestionAddressOption>
                locale={locale}
                items={suggestions}
                value={selectedOption}
                inputValue={value}
                filter={null}
                onInputValueChange={handleInputValueChange}
                onValueChange={(option) => option && handleSelect(option.suggestion)}
            >
                <ComboboxFloatingLabel isRequired isValue={isValue} isInvalid={Boolean(error)}>
                    {t('address')}
                </ComboboxFloatingLabel>

                <ComboboxInput
                    required
                    aria-invalid={Boolean(error)}
                    aria-busy={isLoading}
                    autoComplete="address-line1"
                    showTrigger={false}
                    showClear={false}
                    classNames={{
                        wrapper: 'bg-zinc-100',
                        inputGroupInput: cn(
                            'h-13.5',
                            'group-has-data-[slot=combobox-floating-label]/combobox:focus-visible:pt-5 group-has-data-[slot=combobox-floating-label]/combobox:focus-visible:pb-1',
                            'group-has-data-[slot=combobox-floating-label]/combobox:pt-5 group-has-data-[slot=combobox-floating-label]/combobox:pb-1'
                        ),
                    }}
                />

                {Boolean(value) && (
                    <ComboboxContent>
                        <ComboboxList>
                            {isLoading ? (
                                <div className="py-2 text-center text-sm text-muted-foreground">
                                    {t('loading')}
                                </div>
                            ) : (
                                <>
                                    <ComboboxCollection>
                                        {(option) => (
                                            <ComboboxItem key={option.value} value={option}>
                                                {option.label}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxCollection>
                                    <ComboboxEmpty>
                                        {fallbackTranslation(t('no_data'), 'no_data', 'No data')}
                                    </ComboboxEmpty>
                                </>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                )}
            </Combobox>

            {error?.message && (
                <span className="mt-1 block text-danger text-xs">{error.message}</span>
            )}
        </div>
    );
};

export default SuggestionAddressInput;
