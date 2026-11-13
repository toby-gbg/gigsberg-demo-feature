'use client';

import { memo, useMemo, useState } from 'react';
import { ClassValue } from 'clsx';
import { addDays, endOfMonth, endOfWeek } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { DateRange } from 'react-day-picker';

import type { DateSelectOption } from '@/interfaces/DateSelect';
import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';
import { formatDateToISODate, isoDateToDate } from '@/utils/date';

import {
    Combobox,
    ComboboxCollection,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
    ComboboxValue,
} from '@/components/ui/Combobox';

import DateRangePickerSelect from './DateRangePickerSelect';

export type { DateSelectOption } from '@/interfaces/DateSelect';

interface Props {
    classNames?: {
        wrapper?: ClassValue;
        trigger?: ClassValue;
    };
    onChange: (
        date: DateSelectOption | undefined,
        error?: {
            message: string;
        }
    ) => void;
}

function DateSelect({ onChange, classNames }: Props) {
    const locale = useLocale();
    const t = useTranslations();

    const [selectedValue, setSelectedValue] = useState<string | null>('all');
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [date, setDate] = useState<DateRange | undefined>();

    const options = useMemo<{ label: string; value: string }[]>(
        () => [
            { label: t('all_dates'), value: 'all' },
            { label: t('today'), value: 'today' },
            { label: t('tomorrow'), value: 'tomorrow' },
            { label: t('this_week'), value: 'this_week' },
            { label: t('this_month'), value: 'this_month' },
            { label: t('custom_date_range'), value: 'custom' },
        ],
        []
    );

    const dateOptions = useMemo<Record<string, DateSelectOption | 'all' | 'custom'>>(() => {
        const today = new Date();
        const tomorrow = addDays(today, 1);

        return {
            all: 'all',
            today: {
                fromDate: formatDateToISODate(today),
                toDate: formatDateToISODate(today),
            },
            tomorrow: {
                fromDate: formatDateToISODate(tomorrow),
                toDate: formatDateToISODate(tomorrow),
            },
            this_week: {
                fromDate: formatDateToISODate(today),
                toDate: formatDateToISODate(endOfWeek(today, { weekStartsOn: 1 })),
            },
            this_month: {
                fromDate: formatDateToISODate(today),
                toDate: formatDateToISODate(endOfMonth(today)),
            },
            custom: 'custom',
        };
    }, []);

    const selectedOption = options.find((option) => option.value === selectedValue) ?? null;

    const handleSelectDateChange = (payload: { label: string; value: string } | null) => {
        if (!payload) return;

        const value = payload.value;

        if (!value) return;

        const dateOption = dateOptions[value];

        setSelectedValue(value);

        if (dateOption === 'custom') {
            setShowDatePicker(true);
            return;
        }

        if (dateOption === 'all') {
            setDate(undefined);
            onChange?.({ fromDate: undefined, toDate: undefined });
            return;
        }

        setDate({
            from: isoDateToDate(dateOption.fromDate),
            to: isoDateToDate(dateOption.toDate),
        });

        onChange?.({
            ...dateOption,
            proximity: value,
        });
    };

    const handleSelectDateRangeChange = (payload: DateRange | undefined) => {
        if (typeof payload === 'undefined' && payload === undefined) {
            setDate(undefined);
            onChange?.({
                fromDate: undefined,
                toDate: undefined,
            });
            return;
        }

        setDate(payload);

        if (payload.from && payload.to) {
            onChange?.({
                fromDate: formatDateToISODate(payload.from) || undefined,
                toDate: formatDateToISODate(payload.to) || undefined,
            });
        }
    };

    return (
        <div
            className={cn(
                'relative w-full transition-[max-width] duration-200',
                classNames?.wrapper
            )}
        >
            <div
                className={`transition-opacity duration-200 ${
                    showDatePicker
                        ? 'pointer-events-none invisible opacity-0'
                        : 'visible opacity-100'
                }`}
            >
                <Combobox<{ label: string; value: string }>
                    locale={locale}
                    items={options}
                    value={selectedOption}
                    onValueChange={handleSelectDateChange}
                    filter={null}
                >
                    <ComboboxTrigger
                        aria-label={t('select_your_country')}
                        className={cn('flex justify-between items-center', classNames?.trigger)}
                    >
                        <ComboboxValue placeholder={t('select_your_country')} />
                    </ComboboxTrigger>
                    <ComboboxContent>
                        <ComboboxList>
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
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </div>
            <div
                className={`absolute top-0 left-0 w-full transition-opacity duration-200 ${
                    showDatePicker
                        ? 'visible opacity-100'
                        : 'pointer-events-none invisible opacity-0'
                }`}
            >
                <div className="flex justify-start items-center gap-2">
                    <DateRangePickerSelect
                        value={date}
                        onChange={handleSelectDateRangeChange}
                        classNames={{ trigger: cn(classNames?.trigger) }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowDatePicker(false)}
                        className="flex justify-center items-center bg-white border border-gray-300 rounded-lg w-10 h-10 text-gray-600 hover:text-black transition-colors shrink-0"
                        aria-label={t('dates')}
                    >
                        <ArrowLeft size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(DateSelect);
