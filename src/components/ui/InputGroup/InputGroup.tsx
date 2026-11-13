'use client';

import { ComponentProps, ReactNode, type LabelHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface InputGroupLabelProps extends Omit<ComponentProps<'label'>, 'children'> {
    children: ReactNode;
    isInvalid?: boolean;
    isValue?: boolean;
    required?: boolean;
}

function InputGroup({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            data-slot="input-group"
            role="group"
            className={cn(
                /* === COMMON === */
                'group/input-group relative flex w-full min-w-0 items-center rounded-lg transition-all outline-none overflow-hidden shadow-field',
                /* === FOCUS === */
                'has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:border-none has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot=input-group-control]:focus-visible]:outline-none',
                /* === DISABLED === */
                'data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none',
                /* === INVALID === */
                'aria-invalid:bg-red-100 aria-invalid:ring-red-300!',
                className
            )}
            {...props}
        />
    );
}

const inputGroupAddonVariants = cva(
    "flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
    {
        variants: {
            align: {
                'inline-start':
                    'order-first ps-2 has-[>button]:ms-[-0.3rem] has-[>kbd]:ms-[-0.15rem]',
                'inline-end': 'order-last pe-2 has-[>button]:me-[-0.3rem] has-[>kbd]:me-[-0.15rem]',
                'block-start':
                    'order-first w-full justify-start px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2',
                'block-end':
                    'order-last w-full justify-start px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2',
            },
        },
        defaultVariants: {
            align: 'inline-start',
        },
    }
);

function InputGroupAddon({
    className,
    align = 'inline-start',
    ...props
}: ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
    return (
        <div
            role="group"
            data-slot="input-group-addon"
            data-align={align}
            className={cn(inputGroupAddonVariants({ align }), className)}
            onClick={(e) => {
                if ((e.target as HTMLElement).closest('button')) {
                    return;
                }
                e.currentTarget.parentElement?.querySelector('input')?.focus();
            }}
            {...props}
        />
    );
}

function InputGroupLabel({
    className,
    children,
    isInvalid,
    isValue,
    required,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & InputGroupLabelProps) {
    return (
        <label
            aria-invalid={isInvalid}
            data-slot="input-group-label"
            data-has-value={isValue}
            className={cn(
                'pointer-events-none absolute inset-s-3 z-10 font-normal transition-all duration-75 ease-out text-default-600',
                /* === FOCUS === */
                'group-has-[[data-slot=input-group-control]:focus]/input-group:text-black group-has-[[data-slot=input-group-control]:focus]/input-group:top-1 group-has-[[data-slot=input-group-control]:focus]/input-group:translate-y-0 group-has-[[data-slot=input-group-control]:focus]/input-group:text-xs',
                /* === INVALID === */
                'aria-invalid:text-danger group-has-[[data-slot=input-group-control][aria-invalid=true]:focus]/input-group:text-danger',
                /* === FLOATING LABEL === */
                'data-[has-value=true]:top-1 data-[has-value=true]:text-xs',
                'data-[has-value=false]:top-1/2 data-[has-value=false]:text-sm data-[has-value=false]:-translate-y-1/2',
                className
            )}
            {...props}
        >
            {children}
            {required && <span className="ms-0.5 text-danger">*</span>}
        </label>
    );
}

function InputGroupButton({ className, children, ...props }: ComponentProps<'button'>) {
    return (
        <button
            type="button"
            data-slot="input-group-button"
            className={cn(
                'inline-flex size-4 shrink-0 items-center justify-center rounded-full text-gray-500 transition-all [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 border border-transparent',
                /* === FOCUS === */
                'focus-visible:ring-1 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-none',
                /* === HOVER === */
                'hover:text-black',
                /* === DISABLED === */
                'disabled:opacity-50 disabled:pointer-events-none',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

function InputGroupText({ className, ...props }: ComponentProps<'span'>) {
    return (
        <span
            className={cn(
                "flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
                className
            )}
            {...props}
        />
    );
}

function InputGroupInput({ className, ...props }: ComponentProps<'input'>) {
    return (
        <Input
            data-slot="input-group-control"
            className={cn(
                'min-h-9 h-10 group-has-data-[slot=input-group-label]/input-group:h-13.5 flex-1 rounded-none border-0 shadow-none ring-0 text-black',
                /* === INVALID === */
                'aria-invalid:ring-red-300 aria-invalid:text-danger aria-invalid:placeholder:text-danger',
                /* === FOCUS === */
                'group-has-data-[slot=input-group-label]/input-group:focus-visible:pt-5 group-has-data-[slot=input-group-label]/input-group:focus-visible:pb-1',
                /* === HAS VALUE === */
                'group-has-data-[slot=input-group-label]/input-group:pt-5 group-has-data-[slot=input-group-label]/input-group:pb-1',
                className
            )}
            {...props}
        />
    );
}

function InputGroupTextarea({ className, ...props }: ComponentProps<'textarea'>) {
    return (
        <Textarea
            data-slot="input-group-control"
            className={cn(
                'flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none ring-0',
                /* === FOCUS === */
                'focus-visible:ring-0',
                /* === INVALID === */
                'aria-invalid:ring-0',
                className
            )}
            {...props}
        />
    );
}

export {
    InputGroup,
    InputGroupAddon,
    InputGroupLabel,
    InputGroupButton,
    InputGroupText,
    InputGroupInput,
    InputGroupTextarea,
};
