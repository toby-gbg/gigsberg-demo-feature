'use client';

import {
    useRef,
    type ComponentPropsWithoutRef,
    type ComponentPropsWithRef,
    type ReactNode,
} from 'react';
import { Combobox as ComboboxPrimitive } from '@base-ui/react';
import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { ClassValue } from 'clsx';
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react';

import { cn } from '@/lib/cn';

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/InputGroup';

export type ComboboxOption<TValue extends string | number = number> = {
    value: TValue;
    label: string;
};

const embeddedComboboxActionClassName =
    'size-6 min-h-0 w-6 rounded-md border-0 bg-transparent p-0 text-muted-foreground shadow-none hover:bg-solid hover:text-white focus-visible:border-0 focus-visible:ring-0 data-disabled:opacity-50!';

const Combobox = <
    Option extends ComboboxOption<string | number>,
    Multiple extends boolean | undefined = false,
>({
    locale,
    children,
    ...props
}: ComboboxPrimitive.Root.Props<Option, Multiple> & {
    locale?: Intl.LocalesArgument;
}) => {
    const { contains } = useComboboxFilter(locale);

    const getLabel = (option: Option | null) => option?.label ?? '';

    return (
        <ComboboxPrimitive.Root
            itemToStringLabel={getLabel}
            filter={(option, query) => contains(getLabel(option), query)}
            {...props}
        >
            <div className="group/combobox relative w-full">{children}</div>
        </ComboboxPrimitive.Root>
    );
};

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
    return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />;
}

function ComboboxClearTrigger({
    className,
    children,
    icon,
    'aria-label': ariaLabel = 'Clear value',
    onPointerDown,
    onClick,
    ...props
}: ComponentPropsWithoutRef<'button'> & { icon?: ReactNode }) {
    return (
        <button
            type="button"
            aria-label={ariaLabel}
            data-slot="combobox-clear-value"
            onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onPointerDown?.(event);
            }}
            onClick={(event) => {
                event.stopPropagation();
                onClick?.(event);
            }}
            className={cn(
                'absolute top-1/2 inset-e-8 inline-flex size-4 [&_svg:not([class*=size-])]:size-4 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 transition-all border border-transparent',
                /* === HOVER === */
                'hover:text-black',
                /* === FOCUS === */
                'focus-visible:ring-1 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-none',
                className
            )}
            {...props}
        >
            {children ?? icon ?? <XIcon />}
        </button>
    );
}

function ComboboxTrigger({
    className,
    children,
    icon,
    'aria-label': ariaLabel = 'Open combobox',
    ...props
}: ComboboxPrimitive.Trigger.Props & { icon?: ReactNode }) {
    return (
        <ComboboxPrimitive.Trigger
            aria-label={ariaLabel}
            data-slot="combobox-trigger"
            className={cn(
                'min-h-9 h-10 group-has-data-[slot=combobox-floating-label]/combobox:h-13.5 transition-all text-start text-sm text-black bg-white px-3 w-full cursor-pointer rounded-lg flex justify-center items-center shrink-0 [&_svg:not([class*=size-])]:size-4 data-placeholder:text-[#636367] shadow-field',
                /* === HOVER === */
                'hover:bg-zinc-50',
                /* === INVALID === */
                'aria-invalid:ring-red-300 aria-invalid:bg-red-100 aria-invalid:text-danger',
                /* === DISABLED === */
                'data-disabled:opacity-50! data-disabled:pointer-events-none!',
                /* === FOCUS === */
                'focus-visible:ring-2 focus-visible:border-none focus-visible:ring-ring/50 focus-visible:outline-none',
                className
            )}
            {...props}
        >
            {children}
            {icon ?? (
                <ChevronDownIcon className="pointer-events-none text-gray-400 flex items-center" />
            )}
        </ComboboxPrimitive.Trigger>
    );
}

function ComboboxClear({
    className,
    children,
    icon,
    'aria-label': ariaLabel = 'Clear input',
    ...props
}: ComboboxPrimitive.Clear.Props & { icon?: ReactNode }) {
    return (
        <ComboboxPrimitive.Clear
            aria-label={ariaLabel}
            data-slot="combobox-clear"
            className={cn(
                'inline-flex size-6 shrink-0 items-center justify-center rounded-md transition-all [&_svg:not([class*=size-])]:size-4',
                className
            )}
            {...props}
        >
            {children ?? icon ?? <XIcon className="pointer-events-none" />}
        </ComboboxPrimitive.Clear>
    );
}

type ComboboxInputClassNames = {
    wrapper?: ClassValue;
    trigger?: ClassValue;
    clear?: ClassValue;
    inputGroupInput?: ClassValue;
};

function ComboboxInput({
    classNames,
    children,
    disabled = false,
    showTrigger = true,
    showClear = false,
    clearProps,
    clearIcon,
    prefixIcon,
    triggerProps,
    triggerIcon,
    ...props
}: Omit<ComboboxPrimitive.Input.Props, 'className'> & {
    showTrigger?: boolean;
    showClear?: boolean;
    classNames?: ComboboxInputClassNames;
    clearIcon?: ReactNode;
    clearProps?: Omit<ComboboxPrimitive.Clear.Props, 'children' | 'className'>;
    prefixIcon?: ReactNode;
    triggerIcon?: ReactNode;
    triggerProps?: Omit<ComboboxPrimitive.Trigger.Props, 'children' | 'className'>;
}) {
    return (
        <InputGroup
            className={cn('text-sm', classNames?.wrapper)}
            aria-invalid={Boolean(props['aria-invalid'])}
            data-disabled={Boolean(disabled)}
        >
            {prefixIcon && (
                <InputGroupAddon align="inline-start" className="pointer-events-none">
                    {prefixIcon}
                </InputGroupAddon>
            )}
            <ComboboxPrimitive.Input
                render={
                    <InputGroupInput
                        disabled={Boolean(disabled)}
                        className={cn('', classNames?.inputGroupInput)}
                    />
                }
                {...props}
            />
            <InputGroupAddon align="inline-end" className="py-0 pe-1 has-[>button]:me-0">
                {showClear && (
                    <ComboboxClear
                        disabled={disabled}
                        className={cn(embeddedComboboxActionClassName, classNames?.clear)}
                        icon={clearIcon}
                        {...clearProps}
                    />
                )}
                {showTrigger && (
                    <ComboboxTrigger
                        disabled={disabled}
                        className={cn(embeddedComboboxActionClassName, classNames?.trigger)}
                        icon={triggerIcon}
                        {...triggerProps}
                    />
                )}
            </InputGroupAddon>
            {children}
        </InputGroup>
    );
}

function ComboboxContent({
    className,
    side = 'bottom',
    sideOffset = 12,
    align = 'start',
    alignOffset = 0,
    anchor,
    ...props
}: ComboboxPrimitive.Popup.Props &
    Pick<
        ComboboxPrimitive.Positioner.Props,
        'side' | 'align' | 'sideOffset' | 'alignOffset' | 'anchor'
    >) {
    return (
        <ComboboxPrimitive.Portal>
            <ComboboxPrimitive.Positioner
                side={side}
                sideOffset={sideOffset}
                align={align}
                alignOffset={alignOffset}
                anchor={anchor}
                className="isolate z-2147483650"
            >
                <ComboboxPrimitive.Popup
                    data-slot="combobox-content"
                    data-chips={!!anchor}
                    className={cn(
                        'group/combobox-content relative max-h-(--available-height) max-w-(--available-width) origin-(--transform-origin) overflow-hidden rounded-md bg-popover text-popover-foreground ring-1 ring-foreground/10 shadow-xs',
                        /* === ANIMATION === */
                        'w-(--anchor-width)! min-w-(--anchor-width)! animate-none! transition-none! duration-0! data-open:animate-none! data-closed:animate-none! data-open:fade-in-0! data-closed:fade-out-0! data-open:zoom-in-100! data-closed:zoom-out-100! **:animate-none! **:transition-none! **:duration-0!',
                        className
                    )}
                    render={(popupProps) => {
                        const { children, className, ...restProps } = popupProps;

                        return (
                            <div {...restProps} className={className}>
                                <div className="p-2 space-y-2">{children}</div>
                            </div>
                        );
                    }}
                    {...props}
                />
            </ComboboxPrimitive.Positioner>
        </ComboboxPrimitive.Portal>
    );
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
    return (
        <ComboboxPrimitive.List
            data-slot="combobox-list"
            className={cn(
                'no-scrollbar max-h-[min(calc(--spacing(72)-(--spacing(9))),calc(var(--available-height)-(--spacing(9))))] scroll-py-1 overflow-y-auto overscroll-contain space-y-1 [&>[role=option]:nth-last-child(2)]:mb-0',
                className
            )}
            {...props}
        />
    );
}

function ComboboxItem({ className, children, ...props }: ComboboxPrimitive.Item.Props) {
    return (
        <ComboboxPrimitive.Item
            data-slot="combobox-item"
            className={cn(
                "relative w-full gap-2 select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 flex cursor-pointer items-center justify-between rounded-md ps-3 py-2 text-sm text-black outline-none transition-all pe-8",
                /* === HIGHLIGHTED === */
                'data-highlighted:bg-zinc-100! data-highlighted:**:text-black! aria-highlighted:bg-zinc-100! aria-highlighted:**:text-black!',
                /* === SELECTED === */
                'aria-selected:bg-gray-300! aria-selected:**:text-black! data-selected:bg-gray-300! data-selected:**:text-black!',
                /* === DISABLED === */
                'data-disabled:pointer-events-none data-disabled:opacity-50',
                className
            )}
            {...props}
        >
            {children}
            <ComboboxPrimitive.ItemIndicator
                render={
                    <span className="pointer-events-none absolute inset-e-2 flex size-4 items-center justify-center">
                        <CheckIcon className="pointer-events-none" />
                    </span>
                }
            />
        </ComboboxPrimitive.Item>
    );
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
    return (
        <ComboboxPrimitive.Group data-slot="combobox-group" className={cn(className)} {...props} />
    );
}

function ComboboxLabel({ className, ...props }: ComboboxPrimitive.GroupLabel.Props) {
    return (
        <ComboboxPrimitive.GroupLabel
            data-slot="combobox-group-label"
            className={cn('px-2 py-1.5 text-xs text-muted-foreground', className)}
            {...props}
        />
    );
}

function ComboboxFloatingLabel({
    className,
    children,
    isInvalid,
    isRequired,
    isValue,
    ...props
}: ComponentPropsWithRef<'label'> & {
    isInvalid?: boolean;
    isRequired?: boolean;
    isValue?: boolean;
}) {
    return (
        <label
            aria-invalid={isInvalid}
            data-has-value={isValue}
            data-slot="combobox-floating-label"
            className={cn(
                'pointer-events-none absolute inset-s-3 z-10 text-default-600',
                'aria-invalid:text-danger',
                'data-[has-value=true]:top-1 data-[has-value=true]:text-xs',
                'data-[has-value=false]:top-1/2 data-[has-value=false]:text-sm data-[has-value=false]:-translate-y-1/2',
                'group-has-[[data-slot=input-group-control]:focus-visible]/combobox:text-black group-has-[[data-slot=input-group-control]:focus-visible]/combobox:top-1 group-has-[[data-slot=input-group-control]:focus-visible]/combobox:translate-y-0 group-has-[[data-slot=input-group-control]:focus-visible]/combobox:text-xs group-has-[[data-slot=input-group-control][aria-invalid=true]:focus-visible]/combobox:text-danger',
                className
            )}
            {...props}
        >
            {children}
            {isRequired && <span className="ms-0.5 text-danger">*</span>}
        </label>
    );
}

function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
    return <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />;
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
    return (
        <ComboboxPrimitive.Empty
            data-slot="combobox-empty"
            className={cn(
                'hidden w-full justify-center py-2 text-center text-sm text-muted-foreground group-data-empty/combobox-content:flex',
                className
            )}
            {...props}
        />
    );
}

function ComboboxSeparator({ className, ...props }: ComboboxPrimitive.Separator.Props) {
    return (
        <ComboboxPrimitive.Separator
            data-slot="combobox-separator"
            className={cn('-mx-1 my-1 h-px bg-border', className)}
            {...props}
        />
    );
}

function ComboboxChips({
    className,
    ...props
}: ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> & ComboboxPrimitive.Chips.Props) {
    return (
        <ComboboxPrimitive.Chips
            data-slot="combobox-chips"
            className={cn(
                'flex min-h-8 flex-wrap items-center gap-1 rounded-lg bg-transparent bg-clip-padding px-2.5 py-1 text-sm transition-all has-data-[slot=combobox-chip]:px-1 shadow-xs cursor-pointer',
                /* === HOVER === */
                'hover:border-neutral-300',
                /* === FOCUS === */
                'focus-within:border-neutral-300 focus-within:ring-0',
                /* === INVALID === */
                'has-aria-invalid:border-red-500 has-aria-invalid:ring-red-300',
                className
            )}
            {...props}
        />
    );
}

function ComboboxChip({
    className,
    children,
    showRemove = true,
    ...props
}: ComboboxPrimitive.Chip.Props & {
    showRemove?: boolean;
}) {
    return (
        <ComboboxPrimitive.Chip
            data-slot="combobox-chip"
            className={cn(
                'flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground has-data-[slot=combobox-chip-remove]:pe-0',
                /* === DISABLED === */
                'has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50',
                className
            )}
            {...props}
        >
            {children}
            {showRemove && (
                <ComboboxPrimitive.ChipRemove
                    aria-label="Remove selected item"
                    className="-ms-1 inline-flex size-5 shrink-0 items-center justify-center rounded-sm opacity-50 transition-opacity hover:opacity-100 [&_svg:not([class*=size-])]:size-3.5"
                    data-slot="combobox-chip-remove"
                >
                    <XIcon className="pointer-events-none" />
                </ComboboxPrimitive.ChipRemove>
            )}
        </ComboboxPrimitive.Chip>
    );
}

function ComboboxChipsInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
    return (
        <ComboboxPrimitive.Input
            data-slot="combobox-chip-input"
            className={cn('min-w-16 flex-1 outline-none', className)}
            {...props}
        />
    );
}

function useComboboxAnchor() {
    return useRef<HTMLDivElement | null>(null);
}

function useComboboxFilter(locale?: Intl.LocalesArgument) {
    return BaseCombobox.useFilter({ sensitivity: 'base', locale });
}

export {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxClearTrigger,
    ComboboxCollection,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxFloatingLabel,
    ComboboxGroup,
    ComboboxLabel,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxSeparator,
    ComboboxTrigger,
    ComboboxValue,
    useComboboxAnchor,
    useComboboxFilter,
};
