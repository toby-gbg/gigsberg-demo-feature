import { ClassValue } from 'clsx';

import { cn } from '@/lib/cn';

interface FieldTriggerOptions {
    hasLabel?: boolean;
    triggerClassName?: ClassValue;
    disableHoverEffect?: boolean;
}

/**
 * Returns the shared trigger/container styles used by field-like components:
 *
 * - Input (`InputGroup`)
 * - Select / MultiSelect (`Autocomplete.Trigger`)
 * - DateRangePicker (`DateField.Group`)
 *
 * State styling is driven by `data-*` attributes:
 * - `data-focused=true` → primary border
 * - `data-invalid=true` → danger border/background/text
 * - `data-disabled=true` → disabled appearance
 *
 * Components that do not emit these attributes (e.g. `InputGroup`) can
 * still use this class; the selectors simply remain inactive.
 *
 * @param hasLabel - Applies the floating-label layout when `true`.

 * @param triggerClassName - Additional classes merged into the trigger.
 */
export const getFieldTriggerClassName = ({
    hasLabel,
    triggerClassName,
    disableHoverEffect = false,
}: FieldTriggerOptions) =>
    cn(
        'group relative flex w-full items-center overflow-hidden ring-0 px-3 text-left transition-colors outline-none',
        'bg-white',
        !disableHoverEffect && 'not-data-[focused=true]:not-data-[invalid=true]:hover:bg-zinc-50',
        'border-none!',
        'data-[invalid=true]:bg-danger/10! data-[invalid=true]:text-danger',
        'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
        hasLabel ? 'min-h-16 rounded-lg pt-5 pb-1' : 'min-h-10 rounded-lg py-0',
        triggerClassName
    );

export const selectTriggerClassName =
    'bg-zinc-100! data-[invalid=true]:bg-danger/10! !ring-0 min-h-14';

export const selectPopoverClassName =
    'z-2147483649! mt-1 w-(--trigger-width) overflow-hidden rounded-lg border bg-white shadow-sm animate-none! transition-none! duration-0! [&_*]:animate-none! [&_*]:transition-none! [&_*]:duration-0!';

export const selectListBoxClassName =
    'max-h-72 overflow-auto py-1 outline-none animate-none! transition-none! duration-0! [&_*]:animate-none! [&_*]:transition-none! [&_*]:duration-0!';

export const selectOptionClassName =
    'flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-black outline-none animate-none! transition-none! duration-0! data-[focused=true]:bg-zinc-100 data-[selected=true]:bg-gray-300 data-[selected=true]:text-black [&_*]:animate-none! [&_*]:transition-none! [&_*]:duration-0!';

export const noSelectMotionClassName =
    'animate-none! transition-none! duration-0! [&_*]:animate-none! [&_*]:transition-none! [&_*]:duration-0!';

export const selectWrapperClassName = 'border border-[#E0E0E0] rounded-lg';
