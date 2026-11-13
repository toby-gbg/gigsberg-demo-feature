import { useState } from 'react';
import { ClassValue } from 'clsx';
import { format } from 'date-fns';
import { ar, de, enGB, enUS, es, fr, he, hr, hu, it, nl, pl, pt, ru, sv } from 'date-fns/locale';
import { CalendarIcon, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { DateRange, Locale } from 'react-day-picker';

import { cn } from '@/lib/cn';
import { fallbackTranslation, isRTL } from '@/utils/common';

import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';

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

interface DateRangePickerProps {
    errorMessage?: string;
    value?: DateRange | undefined;
    classNames?: {
        wrapper?: ClassValue;
        trigger?: ClassValue;
    };
    onChange: (payload: DateRange | undefined) => void;
    disablePastDays?: boolean;
}

export default function DateRangePicker({
    errorMessage,
    value,
    classNames,
    onChange,
    disablePastDays = true,
}: DateRangePickerProps) {
    const t = useTranslations();

    const [open, setOpen] = useState(false);

    const activeLocale = useLocale();
    const locale = DATE_PICKER_LOCALES[activeLocale] ?? enGB;
    const direction = isRTL(activeLocale) ? 'rtl' : 'ltr';

    const handleSelect = (payload: DateRange | undefined) => {
        onChange?.(payload);

        if (payload?.from && payload.to) {
            setOpen(false);
        }
    };

    return (
        <div className={cn('w-full min-w-0', classNames?.wrapper)}>
            <div className="relative">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger
                        className={cn(
                            'w-full bg-white border-none text-black',
                            classNames?.trigger
                        )}
                        render={
                            <Button
                                suffixIcon={
                                    <div className="flex items-center gap-2">
                                        {value?.from && (
                                            <button
                                                type="button"
                                                className="z-10 flex size-4 [&_svg:not([class*=size-])]:size-4 items-center justify-center rounded-full text-gray-500 transition-colors hover:text-black focus-visible:ring-1 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-none border border-transparent"
                                                aria-label="Clear date range"
                                                onClick={() => onChange?.(undefined)}
                                            >
                                                <X />
                                            </button>
                                        )}
                                        <CalendarIcon data-icon="inline-start" />
                                    </div>
                                }
                                variant="outline"
                                id="date-picker-range"
                                className={cn(
                                    'px-2.5 font-normal flex justify-between items-center hover:text-text-primary text-sm',
                                    value?.from && 'pr-16'
                                )}
                            >
                                {value?.from ? (
                                    value.to ? (
                                        <>
                                            {format(value.from, 'dd / MM / yyyy')} -{' '}
                                            {format(value.to, 'dd / MM / yyyy')}
                                        </>
                                    ) : (
                                        format(value.from, 'dd / MM / yyyy')
                                    )
                                ) : (
                                    <span className="text-sm text-muted">
                                        {fallbackTranslation(
                                            t('all_dates'),
                                            'all_dates',
                                            'dd / mm / yyyy - dd / mm / yyyy'
                                        )}
                                    </span>
                                )}
                            </Button>
                        }
                    />

                    <PopoverContent
                        className="rounded-2xl p-0 shadow-xl max-w-69!"
                        align="center"
                        sideOffset={12}
                    >
                        <Calendar
                            resetOnSelect
                            min={1}
                            numberOfMonths={1}
                            mode="range"
                            className="rounded-2xl w-full max-h-85"
                            defaultMonth={value?.from}
                            selected={value}
                            onSelect={handleSelect}
                            startMonth={disablePastDays ? getCurrentMonthStart() : undefined}
                            disabled={disablePastDays && getDisabledPastDays()}
                            locale={locale}
                            dir={direction}
                            formatters={{
                                formatWeekdayName: (weekday, options, dateLib) =>
                                    dateLib?.format(weekday, 'ccc', options) ??
                                    format(weekday, 'ccc'),
                            }}
                            aria-label={t('select_date')}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            {errorMessage && <p className="mt-1 text-xs text-red-500">{errorMessage}</p>}
        </div>
    );
}
