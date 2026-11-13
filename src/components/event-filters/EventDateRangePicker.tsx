'use client';

import { memo, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import type { DateRange } from 'react-day-picker';

import DateRangePicker from '@/components/ui/DateRangePicker';

interface EventDateRangePickerProps {
    fromDate: string | null;
    toDate: string | null;
    onChange: (dates: { fromDate?: string; toDate?: string }) => void;
}

const EventDateRangePicker = ({ fromDate, toDate, onChange }: EventDateRangePickerProps) => {
    const value = useMemo(() => {
        if (!fromDate) return undefined;

        try {
            return { from: parseISO(fromDate), to: toDate ? parseISO(toDate) : undefined };
        } catch {
            return undefined;
        }
    }, [fromDate, toDate]);

    const handleChange = (dates: DateRange | undefined) => {
        onChange({
            fromDate: dates?.from ? format(dates.from, 'yyyy-MM-dd') : undefined,
            toDate: dates?.to ? format(dates.to, 'yyyy-MM-dd') : undefined,
        });
    };

    return (
        <DateRangePicker
            onChange={handleChange}
            value={value}
            classNames={{
                wrapper: 'border border-neutral-300 rounded-md',
                trigger: 'h-10',
            }}
        />
    );
};

export default memo(EventDateRangePicker);
