'use client';

import { useState, type ButtonHTMLAttributes } from 'react';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { CalendarDays } from 'lucide-react';
import { useLocale } from 'next-intl';

import { cn } from '@/lib/cn';
import { formatDate } from '@/utils/date';
import { DATE_LOCALES } from '@/constants/locales';

import { Calendar } from '../Calendar';

export interface DatePickerProps extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'defaultValue' | 'onChange' | 'value'
> {
    value?: Date;
    defaultValue?: Date;
    onChange?: (date: Date | undefined) => void;
    placeholder?: string;
}

const DatePicker = (componentProps: DatePickerProps) => {
    const {
        value,
        defaultValue,
        onChange,
        placeholder = 'Pick a date',
        className,
        disabled,
        ...triggerProps
    } = componentProps;
    const activeLocale = useLocale();
    const locale = DATE_LOCALES[activeLocale] ?? DATE_LOCALES['en-GB'];
    const [internalDate, setInternalDate] = useState<Date | undefined>(defaultValue);
    const isControlled = 'value' in componentProps;
    const date = isControlled ? value : internalDate;

    const handleSelect = (selectedDate: Date | undefined) => {
        if (!isControlled) setInternalDate(selectedDate);
        onChange?.(selectedDate);
    };

    return (
        <PopoverPrimitive.Root>
            <PopoverPrimitive.Trigger
                render={
                    <button
                        type="button"
                        disabled={disabled}
                        className={cn(
                            'flex min-h-12 min-w-65 items-center justify-between gap-3 rounded-lg border border-neutral-300 bg-white px-3 text-left text-sm text-neutral-900 shadow-sm outline-none transition-colors',
                            'hover:border-neutral-300 focus-visible:border-neutral-300 focus-visible:ring-0! aria-invalid:border-error-state-default aria-invalid:ring-0!',
                            'disabled:pointer-events-none disabled:bg-neutral-100-bg disabled:text-neutral-400 disabled:opacity-80',
                            className
                        )}
                        {...triggerProps}
                    />
                }
            >
                <span className={cn('truncate', !date && 'text-neutral-600')}>
                    {date
                        ? formatDate({
                              date,
                              locale: activeLocale,
                          })
                        : placeholder}
                </span>
                <CalendarDays className="size-5 shrink-0 text-neutral-600" aria-hidden="true" />
            </PopoverPrimitive.Trigger>
            <PopoverPrimitive.Portal>
                <PopoverPrimitive.Positioner sideOffset={4} align="start" className="z-50">
                    <PopoverPrimitive.Popup
                        data-slot="date-picker-content"
                        className="origin-(--transform-origin) overflow-hidden rounded-xl border border-neutral-300 bg-popover text-popover-foreground shadow-lg outline-none"
                    >
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleSelect}
                            locale={locale}
                            defaultMonth={date}
                        />
                    </PopoverPrimitive.Popup>
                </PopoverPrimitive.Positioner>
            </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
    );
};

export { DatePicker };
