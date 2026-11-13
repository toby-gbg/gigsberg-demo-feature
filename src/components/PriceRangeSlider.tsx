'use client';

import { FC, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { isRTL } from '@/utils/common';
import { customCurrencySymbol } from '@/utils/currency.util';
import { getIsGradient } from '@/utils/website';

import { useSite } from '@/providers/SiteProvider';

import { Range } from '@/components/ui/Range';

interface PriceRangeSliderProps {
    priceRange: [number, number];
    onChange: (value: number | number[]) => void;
    currentValue: [number, number];
    currencyCode: string;
}

const PriceRangeSlider: FC<PriceRangeSliderProps> = ({
    priceRange,
    onChange,
    currentValue,
    currencyCode = 'USD',
}) => {
    const t = useTranslations();
    const locale = useLocale();

    const [value, setValue] = useState<[number, number]>([
        Math.floor(currentValue[0]),
        Math.round(currentValue[1]),
    ]);

    useEffect(() => {
        setValue([Math.floor(currentValue[0]), Math.round(currentValue[1])]);
    }, [currentValue]);

    const min = Math.floor(priceRange[0]);
    const max = Math.round(priceRange[1]);

    const ensureMinimumOffset = (next: readonly number[]): [number, number] => {
        let [low, high] = next;

        if (high - low < 1) {
            if (high >= max) {
                low = Math.max(min, high - 1);
            } else {
                high = Math.min(max, low + 1);
            }
        }

        return [low, high];
    };

    const handleValueChange = (next: number | readonly number[]) => {
        if (!Array.isArray(next) || next.length !== 2) return;
        setValue(ensureMinimumOffset(next));
    };

    const handleValueCommit = (next: number | readonly number[]) => {
        if (!Array.isArray(next) || next.length !== 2) return;

        const adjustedValue = ensureMinimumOffset(next);
        setValue(adjustedValue);
        onChange(adjustedValue);
    };

    const formatCurrency = (amount: number) => {
        const formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
            maximumFractionDigits: 0,
        });
        const symbol = customCurrencySymbol[currencyCode];

        if (!symbol) return formatter.format(amount);

        return formatter
            .formatToParts(amount)
            .map((part) => (part.type === 'currency' ? symbol : part.value))
            .join('');
    };

    return (
        <div className="space-y-4 w-full md:max-w-md">
            <div className="flex justify-between items-center gap-3">
                <span className="font-medium text-default-700 text-sm">{t('price_range')}</span>
                <span className="font-medium tabular-nums text-default-500 text-sm">
                    {formatCurrency(value[0])} – {formatCurrency(value[1])}
                </span>
            </div>
            <Range
                dir={isRTL(locale) ? 'rtl' : 'ltr'}
                min={min}
                max={max}
                minStepsBetweenValues={1}
                value={value}
                onValueChange={handleValueChange}
                onValueCommitted={handleValueCommit}
                formatValue={formatCurrency}
                isGradient={getIsGradient(useSite().website)}
            />
        </div>
    );
};

export default PriceRangeSlider;
