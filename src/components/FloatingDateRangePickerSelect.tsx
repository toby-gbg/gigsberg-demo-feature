import { useState } from 'react';
import { ClassValue } from 'clsx';
import { format } from 'date-fns';
import { ar, de, enGB, enUS, es, fr, he, hr, hu, it, nl, pl, pt, ru, sv } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { DateRange, Locale } from 'react-day-picker';
import { FieldError } from 'react-hook-form';

import { cn } from '@/lib/cn';

import { useWrappedLabel } from '@/hooks/useWrappedLabel';

import { Calendar } from '@/components/ui/Calendar';
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

interface Props {
    classNames?: {
        wrapper?: ClassValue;
        trigger?: ClassValue;
        label?: ClassValue;
    };
    value: DateRange | undefined;
    label?: string;
    error?: FieldError;
    isRequired?: boolean;
    isDisabled?: boolean;
    hideErrorMessage?: boolean;
    onChange: (value: DateRange | undefined) => void;
    disablePastDays?: boolean;
    isClearable?: boolean;
}

export default function FloatingDateRangePickerSelect({
    classNames,
    label,
    value,
    error,
    isRequired,
    isDisabled,
    hideErrorMessage,
    onChange,
    disablePastDays = true,
    isClearable = false,
}: Props) {
    const t = useTranslations();
    const { labelRef, isWrapped } = useWrappedLabel();

    const [open, setOpen] = useState(false);

    const activeLocale = useLocale();
    const locale = DATE_PICKER_LOCALES[activeLocale] ?? enGB;
    const direction = activeLocale === 'ar' || activeLocale === 'he' ? 'rtl' : 'ltr';

    const handleSelect = (payload: DateRange | undefined) => {
        onChange?.(payload);

        if (payload?.from && payload.to) {
            setOpen(false);
        }
    };

    return (
        <div className={cn('flex flex-col gap-1.5', classNames?.wrapper)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                    disabled={isDisabled}
                    className={cn('bg-zinc-100 block', classNames?.trigger)}
                >
                    {label && (
                        <PopoverLabel
                            ref={labelRef}
                            error={error}
                            hasValue={Boolean(value)}
                            isRequired={isRequired}
                            className={cn(
                                'inset-e-8 data-[has-value=false]:text-[13px]/5',
                                isWrapped
                                    ? 'data-[has-value=true]:text-[11px]/3'
                                    : 'data-[has-value=true]:text-[11px]/4',
                                value?.from && isClearable && 'inset-e-16',
                                classNames?.label
                            )}
                        >
                            {label}
                        </PopoverLabel>
                    )}
                    <PopoverValue
                        hasValue={Boolean(value)}
                        hasClearTrigger={Boolean(value?.from) && isClearable}
                    >
                        {value?.from ? format(value.from, 'dd / MM / yyyy') : 'dd / mm / yyyy'} -{' '}
                        {value?.to ? format(value.to, 'dd / MM / yyyy') : 'dd / mm / yyyy'}
                    </PopoverValue>
                </PopoverTrigger>
                <PopoverGroupIcon hasValue={Boolean(value)}>
                    {value?.from && isClearable && (
                        <PopoverClearTrigger
                            disabled={isDisabled}
                            className="pointer-events-auto static translate-y-0"
                            onClick={() => onChange?.(undefined)}
                        />
                    )}
                    <CalendarIcon className="size-4 shrink-0" />
                </PopoverGroupIcon>
                <PopoverContent className="p-0 shadow-xl w-72" align="center">
                    <Calendar
                        resetOnSelect
                        mode="range"
                        defaultMonth={value?.from}
                        selected={value}
                        onSelect={handleSelect}
                        startMonth={disablePastDays ? getCurrentMonthStart() : undefined}
                        disabled={disablePastDays ? getDisabledPastDays() : undefined}
                        locale={locale}
                        dir={direction}
                        formatters={{
                            formatWeekdayName: (weekday, options, dateLib) =>
                                dateLib?.format(weekday, 'ccc', options) ?? format(weekday, 'ccc'),
                        }}
                        aria-label={t('select_date')}
                    />
                </PopoverContent>
            </Popover>

            {!hideErrorMessage && error?.message && (
                <p className="mt-1 text-danger text-xs">{error.message}</p>
            )}
        </div>
    );
}
