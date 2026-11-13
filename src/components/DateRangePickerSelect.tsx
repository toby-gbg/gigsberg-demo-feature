import { useState } from 'react';
import { ClassValue } from 'clsx';
import { format } from 'date-fns';
import { ar, de, enGB, enUS, es, fr, he, hr, hu, it, nl, pl, pt, ru, sv } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { DateRange, Locale } from 'react-day-picker';

import { cn } from '@/lib/cn';
import { fallbackTranslation, isRTL } from '@/utils/common';

import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/Calendar';
import {
    Popover,
    PopoverClearTrigger,
    PopoverContent,
    PopoverTrigger,
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
    errorMessage?: string;
    value?: DateRange | undefined;
    disablePastDays?: boolean;
    classNames?: {
        wrapper?: ClassValue;
        trigger?: ClassValue;
        clearBtn?: ClassValue;
    };
    onChange: (payload: DateRange | undefined) => void;
}

export default function DateRangePickerSelect({
    errorMessage,
    value,
    disablePastDays = true,
    classNames,
    onChange,
}: Props) {
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
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                    className={cn('', classNames?.trigger)}
                    render={
                        <Button
                            suffixIcon={<CalendarIcon data-icon="inline-end" />}
                            variant="outline"
                            id="date-picker-range"
                            className="flex w-full min-w-0 items-center justify-between border-none px-2.5 font-normal hover:text-text-primary"
                        >
                            <span
                                className={cn(
                                    'min-w-0 flex-1 truncate text-left',
                                    value?.from && 'mr-8'
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
                                    fallbackTranslation(
                                        t('all_dates'),
                                        'all_dates',
                                        'dd / mm / yyyy - dd / mm / yyyy'
                                    )
                                )}
                            </span>
                        </Button>
                    }
                />
                {value?.from && (
                    <PopoverClearTrigger
                        className={cn('inset-s-auto! inset-e-10!', classNames?.clearBtn)}
                        onClick={() => onChange?.(undefined)}
                    />
                )}
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
            {errorMessage && <p className="mt-1 text-xs text-red-500">{errorMessage}</p>}
        </div>
    );
}
