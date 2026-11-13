'use client';

import { CSSProperties, useEffect, useRef, type ChangeEvent, type ComponentProps } from 'react';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    DayPicker,
    getDefaultClassNames,
    type DayButton,
    type DropdownProps,
    type Locale,
} from 'react-day-picker';

import { cn } from '@/lib/cn';

import {
    Combobox,
    ComboboxContent,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
    ComboboxValue,
} from '@/components/ui/Combobox';

const calendarButtonVariants = cva(
    'inline-flex shrink-0 items-center justify-center border border-transparent text-sm font-medium transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                ghost: 'hover:bg-solid/10 hover:text-solid',
            },
        },
        defaultVariants: {
            variant: 'ghost',
        },
    }
);

type CalendarButtonProps = ButtonPrimitive.Props & VariantProps<typeof calendarButtonVariants>;

const CalendarButton = ({ className, variant, ...props }: CalendarButtonProps) => (
    <ButtonPrimitive
        data-slot="calendar-button"
        className={cn(calendarButtonVariants({ variant, className }))}
        {...props}
    />
);

export type CalendarProps = ComponentProps<typeof DayPicker> & {
    buttonVariant?: CalendarButtonProps['variant'];
};

const Calendar = ({
    className,
    classNames,
    showOutsideDays = true,
    captionLayout = 'label',
    buttonVariant = 'ghost',
    locale,
    formatters,
    components,
    ...props
}: CalendarProps) => {
    const defaultClassNames = getDefaultClassNames();

    return (
        <DayPicker
            style={
                {
                    '--cell-size': 24,
                } as CSSProperties
            }
            showOutsideDays={showOutsideDays}
            className={cn(
                'group/calendar bg-popover p-3 text-popover-foreground [--cell-radius:1.5rem] [--cell-size:--spacing(9)] rounded-lg',
                String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
                String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
                className
            )}
            captionLayout={captionLayout}
            locale={locale}
            formatters={{
                formatMonthDropdown: (date) =>
                    date.toLocaleString(locale?.code, { month: 'short' }),
                ...formatters,
            }}
            classNames={{
                root: cn('w-full', defaultClassNames.root),
                months: cn('relative flex flex-col gap-4 md:flex-row', defaultClassNames.months),
                month: cn('flex w-full flex-col gap-2.5', defaultClassNames.month),
                nav: cn(
                    'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1',
                    defaultClassNames.nav
                ),
                button_previous: cn(
                    calendarButtonVariants({ variant: buttonVariant }),
                    'size-6 flex flex-col justify-center items-center hover:bg-default hover:text-accent-soft-foreground transition-colors rounded-full aria-disabled:pointer-events-none aria-disabled:opacity-50',
                    defaultClassNames.button_previous
                ),
                button_next: cn(
                    calendarButtonVariants({ variant: buttonVariant }),
                    'size-6 flex flex-col justify-center items-center hover:bg-default hover:text-accent-soft-foreground transition-colors rounded-full aria-disabled:pointer-events-none aria-disabled:opacity-50',
                    defaultClassNames.button_next
                ),
                month_caption: cn(
                    'flex h-6 w-full items-center justify-center px-(--cell-size)',
                    defaultClassNames.month_caption
                ),
                dropdowns: cn(
                    'flex h-(--cell-size) w-full items-center justify-center gap-1 text-sm font-medium',
                    defaultClassNames.dropdowns
                ),
                dropdown_root: cn(
                    'relative rounded-(--cell-radius)',
                    defaultClassNames.dropdown_root
                ),
                dropdown: cn('absolute inset-0 bg-popover opacity-0', defaultClassNames.dropdown),
                caption_label: cn(
                    'text-black text-sm font-medium select-none',
                    captionLayout === 'label'
                        ? 'text-sm'
                        : 'flex items-center gap-1 rounded-(--cell-radius) text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground',
                    defaultClassNames.caption_label
                ),
                month_grid: cn('w-full border-collapse', defaultClassNames.month_grid),
                weekdays: cn('flex', defaultClassNames.weekdays),
                weekday: cn(
                    'flex-1 rounded-(--cell-radius) text-muted text-xs font-medium select-none',
                    defaultClassNames.weekday
                ),
                week: cn('mt-2 flex w-full', defaultClassNames.week),
                week_number_header: cn(
                    'w-(--cell-size) select-none',
                    defaultClassNames.week_number_header
                ),
                week_number: cn(
                    'text-xs text-muted-foreground select-none',
                    defaultClassNames.week_number
                ),
                day: cn(
                    'group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]]:rounded-e-(--cell-radius)',
                    props.showWeekNumber
                        ? '[&:nth-child(2)[data-selected=true]]:rounded-s-(--cell-radius)'
                        : '[&:first-child[data-selected=true]]:rounded-s-(--cell-radius)',
                    defaultClassNames.day
                ),
                range_start: cn(
                    'relative isolate rounded-s-(--cell-radius) bg-accent-soft/15 after:absolute after:inset-y-0 after:start-1/2 after:w-1/2 after:bg-accent-soft/15 [&:has([data-range-end=true])]:bg-transparent! [&:has([data-range-end=true])]:after:hidden!',
                    defaultClassNames.range_start
                ),
                range_middle: cn(
                    'overflow-hidden rounded-none bg-accent-soft/15 [&_[data-range-middle=true]]:text-foreground',
                    defaultClassNames.range_middle
                ),
                range_end: cn(
                    'relative isolate rounded-e-(--cell-radius) bg-accent-soft/15 after:absolute after:inset-y-0 after:end-1/2 after:w-1/2 after:bg-accent-soft/15',
                    defaultClassNames.range_end
                ),
                today: cn(
                    'text-foreground [&:not([data-selected=true])]:rounded-(--cell-radius) [&:not([data-selected=true])]:bg-neutral-100-surf',
                    defaultClassNames.today
                ),
                outside: cn(
                    'text-muted-foreground aria-selected:text-muted-foreground',
                    defaultClassNames.outside
                ),
                disabled: cn('text-gray-400 line-through', defaultClassNames.disabled),
                hidden: cn('invisible', defaultClassNames.hidden),
                day_button: 'text-sm font-medium',
                ...classNames,
            }}
            components={{
                Root: ({ className: rootClassName, rootRef, ...rootProps }) => (
                    <div
                        data-slot="calendar"
                        ref={rootRef}
                        className={cn(rootClassName)}
                        {...rootProps}
                    />
                ),
                Chevron: ({ className: chevronClassName, orientation, ...chevronProps }) => {
                    if (orientation === 'left') {
                        return (
                            <ChevronLeft
                                className={cn('size-4', chevronClassName)}
                                {...chevronProps}
                            />
                        );
                    }

                    if (orientation === 'right') {
                        return (
                            <ChevronRight
                                className={cn('size-4', chevronClassName)}
                                {...chevronProps}
                            />
                        );
                    }

                    return (
                        <ChevronDown className={cn('size-4', chevronClassName)} {...chevronProps} />
                    );
                },
                DayButton: (dayButtonProps) => (
                    <CalendarDayButton locale={locale} {...dayButtonProps} />
                ),
                Dropdown: CalendarDropdown,
                WeekNumber: ({ children, ...weekNumberProps }) => (
                    <td {...weekNumberProps}>
                        <div className="flex size-(--cell-size) items-center justify-center text-center">
                            {children}
                        </div>
                    </td>
                ),
                ...components,
            }}
            {...props}
        />
    );
};

const CalendarDropdown = ({
    options = [],
    value,
    onChange,
    disabled,
    id,
    name,
    'aria-label': ariaLabel,
}: DropdownProps) => {
    const listRef = useRef<HTMLDivElement>(null);

    return (
        <span className="inline-flex">
            <Combobox
                items={options}
                value={options.find((option) => String(option.value) === String(value)) ?? null}
                disabled={disabled}
                onOpenChangeComplete={(open) => {
                    if (open) {
                        listRef.current
                            ?.querySelector<HTMLElement>('[data-selected]')
                            ?.scrollIntoView({ block: 'nearest' });
                    }
                }}
                onValueChange={(option) => {
                    if (option) {
                        onChange?.({
                            target: { value: String(option.value) },
                        } as ChangeEvent<HTMLSelectElement>);
                    }
                }}
            >
                <ComboboxTrigger
                    id={id}
                    name={name}
                    aria-label={ariaLabel}
                    className="h-6 min-h-0 gap-1 rounded-full bg-transparent px-1 text-sm font-medium shadow-none hover:bg-zinc-200 [&>svg]:size-3.5"
                >
                    <ComboboxValue />
                </ComboboxTrigger>
                <ComboboxContent sideOffset={4} className="min-w-24!" initialFocus={listRef}>
                    <ComboboxList ref={listRef}>
                        {options.map((option) => (
                            <ComboboxItem
                                key={option.value}
                                value={option}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </ComboboxItem>
                        ))}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </span>
    );
};

type CalendarDayButtonProps = ComponentProps<typeof DayButton> & {
    locale?: Partial<Locale>;
};

const CalendarDayButton = ({
    className,
    day,
    modifiers,
    locale,
    ...props
}: CalendarDayButtonProps) => {
    const defaultClassNames = getDefaultClassNames();
    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (modifiers.focused) ref.current?.focus();
    }, [modifiers.focused]);

    return (
        <CalendarButton
            ref={ref}
            variant="ghost"
            data-day={day.date.toLocaleDateString(locale?.code)}
            data-selected-single={
                modifiers.selected &&
                !modifiers.range_start &&
                !modifiers.range_end &&
                !modifiers.range_middle
            }
            data-range-start={modifiers.range_start}
            data-range-end={modifiers.range_end}
            data-range-middle={modifiers.range_middle}
            className={cn(
                'relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 rounded-(--cell-radius) border-0 leading-none font-normal',
                'group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-2 group-data-[focused=true]/day:ring-ring/50',
                // Range start
                'data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:bg-solid data-[range-start=true]:text-white',
                'data-[range-start=true]:after:absolute data-[range-start=true]:after:inset-y-0 data-[range-start=true]:after:start-1/2 data-[range-start=true]:after:-z-10 data-[range-start=true]:after:w-1/2 data-[range-start=true]:after:bg-solid/15',
                // Range end
                'data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:bg-solid data-[range-end=true]:text-white',
                'data-[range-end=true]:before:absolute data-[range-end=true]:before:inset-y-0 data-[range-end=true]:before:end-1/2 data-[range-end=true]:before:-z-10 data-[range-end=true]:before:w-1/2 data-[range-end=true]:before:bg-solid/15',
                // Range middle
                'data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-solid/15 data-[range-middle=true]:text-solid',
                // Single-day range (start === end): force full rounding, kill both connector overlays
                'data-[range-start=true]:data-[range-end=true]:rounded-(--cell-radius)',
                'data-[range-start=true]:data-[range-end=true]:after:hidden!',
                'data-[range-start=true]:data-[range-end=true]:before:hidden!',
                // Selected single day
                'data-[selected-single=true]:bg-solid data-[selected-single=true]:text-white',
                defaultClassNames.day,
                className
            )}
            {...props}
        />
    );
};

export { Calendar, CalendarDayButton };
