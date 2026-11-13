'use client';

import { useId } from 'react';

import { cn } from '@/lib/cn';

import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';

interface FilterOptionProps {
    label: string;
    checked: boolean;
    onCheckedChange: () => void;
    onHoverHighlight?: () => void;
    onRestoreHighlight?: () => void;
}

export default function FilterOption({
    label,
    checked,
    onCheckedChange,
    onHoverHighlight,
    onRestoreHighlight,
}: FilterOptionProps) {
    const id = useId();

    return (
        <Label
            htmlFor={id}
            className={cn(
                'flex cursor-pointer items-center justify-between gap-2 p-3 transition-all',
                checked ? 'bg-primary-light' : 'hover:bg-primary-light'
            )}
            onMouseEnter={onHoverHighlight}
            onMouseLeave={onRestoreHighlight}
        >
            <span className="min-w-0 flex-1 capitalize text-gray-800">{label}</span>
            <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={onCheckedChange}
                className="size-6 rounded-md border-0 bg-gray-200 shadow-none data-checked:bg-primary data-checked:text-on-main [&_[data-slot=checkbox-indicator]>svg]:size-3"
            />
        </Label>
    );
}
