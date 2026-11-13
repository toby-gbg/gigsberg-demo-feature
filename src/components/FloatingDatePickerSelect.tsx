import { useState } from 'react';
import { ClassValue } from 'clsx';
import { format } from 'date-fns';
import { ar, de, enGB, enUS, es, fr, he, hr, hu, it, nl, pl, pt, ru, sv } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from 'react-day-picker';
import { FieldError } from 'react-hook-form';

import { cn } from '@/lib/cn';
import { isRTL } from '@/utils/common';
import { formatDateToISODate, isoDateToDate } from '@/utils/date';

import { useWrappedLabel } from '@/hooks/useWrappedLabel';

import { Calendar, type CalendarProps } from '@/components/ui/Calendar';
import {
    Popover,
    PopoverClearTrigger,
    PopoverContent,
    PopoverGroupIcon,
    PopoverLabel,
    PopoverTrigger,
    PopoverValue,
} from '@/components/ui/Popover';

const DATE_PICKER_LOCALES: Record<string, Locale> = {
    ar,
    de,
    'en-GB': enGB,
    'en-US': enUS,
    us: enUS,
    'es-ES': es,
    'es-AR': es,
    fr,
    he,
    hr,
    hu,
    it,
    nl,
    pl,
    pt,
    ru,
    sv,
};

// Disable any date before the start of the current day.
const getDisabledPastDays = () => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return {
        before: today,
    };
};

// Limit calendar navigation to the current month or later.
const getCurrentMonthStart = () => {
    const today = new Date();

    return new Date(today.getFullYear(), today.getMonth(), 1);
};

const getDisabledFutureDays = () => {
    const today = new Date();

    today.setHours(23, 59, 59, 999);

    return {
        after: today,
    };
};

type Props = {
    classNames?: {
        wrapper?: ClassValue;
        trigger?: ClassValue;
        label?: ClassValue;
    };
    value?: string;
    label?: string;
    error?: FieldError;
    isRequired?: boolean;
    isDisabled?: boolean;
    hideErrorMessage?: boolean;
    onChange?: (value: string | undefined) => void;
    onBlur?: () => void;
    disablePastDays?: boolean;
    disableFutureDays?: boolean;
    isClearable?: boolean;
} & Omit<CalendarProps, 'classNames' | 'defaultMonth' | 'mode' | 'onSelect' | 'selected'>;

export default function FloatingDatePickerSelect({
    classNames,
    label,
    value,
    error,
    isRequired,
    isDisabled,
    hideErrorMessage,
    onChange,
    onBlur,
    disablePastDays = true,
    disableFutureDays = false,
    isClearable = false,
    ...calendarProps
}: Props) {
    const t = useTranslations();
    const { labelRef, isWrapped } = useWrappedLabel();

    const [open, setOpen] = useState(false);

    const date = isoDateToDate(value);
    const activeLocale = useLocale();
    const locale = DATE_PICKER_LOCALES[activeLocale] ?? enGB;
    const direction = isRTL(activeLocale) ? 'rtl' : 'ltr';

    const handleSelect = (selectedDate: Date | undefined) => {
        onChange?.(formatDateToISODate(selectedDate));

        if (selectedDate) {
            setOpen(false);
        }
    };

    return (
        <div className={cn('flex flex-col gap-1.5', classNames?.wrapper)}>
            <Popover
                open={open}
                onOpenChange={(nextOpen) => {
                    setOpen(nextOpen);
                    if (!nextOpen) onBlur?.();
                }}
            >
                <PopoverTrigger
                    disabled={isDisabled}
                    aria-invalid={Boolean(error)}
                    onBlur={() => {
                        if (!open) onBlur?.();
                    }}
                    className={cn(
                        'bg-zinc-100 block aria-invalid:bg-red-100 aria-invalid:text-danger aria-invalid:ring-red-300!',
                        classNames?.trigger
                    )}
                >
                    {label && (
                        <PopoverLabel
                            ref={labelRef}
                            error={error}
                            hasValue={Boolean(date)}
                            isRequired={isRequired}
                            className={cn(
                                'inset-e-8 data-[has-value=false]:text-[13px]/5',
                                isWrapped
                                    ? 'data-[has-value=true]:text-[11px]/3'
                                    : 'data-[has-value=true]:text-[11px]/4',
                                date && isClearable && 'inset-e-16',
                                classNames?.label
                            )}
                        >
                            {label}
                        </PopoverLabel>
                    )}
                    <PopoverValue
                        hasValue={Boolean(date)}
                        hasClearTrigger={Boolean(date) && isClearable}
                    >
                        {date ? format(date, 'dd / MM / yyyy') : null}
                    </PopoverValue>
                </PopoverTrigger>
                <PopoverGroupIcon hasValue={Boolean(date)}>
                    {date && isClearable && (
                        <PopoverClearTrigger
                            disabled={isDisabled}
                            className="pointer-events-auto static translate-y-0"
                            onClick={() => onChange?.(undefined)}
                        />
                    )}
                    <CalendarIcon className="size-4 shrink-0" />
                </PopoverGroupIcon>
                <PopoverContent className="w-72 p-0 shadow-xl">
                    <Calendar
                        mode="single"
                        defaultMonth={date}
                        selected={date}
                        onSelect={handleSelect}
                        startMonth={disablePastDays ? getCurrentMonthStart() : undefined}
                        endMonth={disableFutureDays ? getCurrentMonthStart() : undefined}
                        disabled={
                            disablePastDays
                                ? getDisabledPastDays()
                                : disableFutureDays
                                  ? getDisabledFutureDays()
                                  : undefined
                        }
                        locale={locale}
                        dir={direction}
                        formatters={{
                            formatWeekdayName: (weekday, options, dateLib) =>
                                dateLib?.format(weekday, 'ccc', options) ?? format(weekday, 'ccc'),
                        }}
                        aria-label={t('select_date')}
                        {...calendarProps}
                    />
                </PopoverContent>
            </Popover>

            {!hideErrorMessage && error?.message && (
                <p className="mt-1 text-danger text-xs">{error.message}</p>
            )}
        </div>
    );
}
