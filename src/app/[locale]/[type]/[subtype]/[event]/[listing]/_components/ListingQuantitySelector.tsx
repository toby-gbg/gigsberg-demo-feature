'use client';

import { useMemo } from 'react';

import {
    Combobox,
    ComboboxCollection,
    ComboboxContent,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
    ComboboxValue,
} from '@/components/ui/Combobox';

interface QuantitySelectProps {
    quantityOptions?: number[];
    value?: number | null;
    disabled?: boolean;
    onChange?: (value: number) => void;
}

export default function ListingQuantitySelector({
    quantityOptions,
    value,
    disabled,
    onChange,
}: QuantitySelectProps) {
    const options = useMemo(
        () =>
            quantityOptions?.map((option) => ({
                value: option,
                label: option.toString(),
            })) ?? [],
        [quantityOptions]
    );
    const selectedOption = options.find((option) => option.value === value) ?? options[0] ?? null;

    return (
        <div className="w-1/3">
            <Combobox
                items={options}
                value={selectedOption}
                disabled={disabled}
                filter={() => true}
                isItemEqualToValue={(option, selected) => option.value === selected.value}
                onValueChange={(option) => option && onChange?.(option.value)}
            >
                <ComboboxTrigger
                    aria-label="Select quantity"
                    className="h-10 justify-between rounded-lg border-zinc-300 border"
                >
                    <ComboboxValue placeholder="Select quantity" />
                </ComboboxTrigger>
                <ComboboxContent sideOffset={4} className="py-0">
                    {/* WLB-3263: This menu has no search field; only reserve the popup's p-2 padding. */}
                    <ComboboxList className="max-h-[min(252px,calc(var(--available-height)-16px))]">
                        <ComboboxCollection>
                            {(option: (typeof options)[number]) => (
                                <ComboboxItem key={option.value} value={option}>
                                    {option.label}
                                </ComboboxItem>
                            )}
                        </ComboboxCollection>
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </div>
    );
}
