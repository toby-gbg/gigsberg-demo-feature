'use client';

import { ComponentPropsWithRef, ReactNode } from 'react';
import { ClassValue } from 'clsx';

import { C } from '@/interfaces/Currency';
import { cn } from '@/lib/cn';

import { useWrappedLabel } from '@/hooks/useWrappedLabel';

import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupLabel,
} from '@/components/ui/InputGroup';

import { Spinner } from './ui/Spinner';

type InputProps = Omit<ComponentPropsWithRef<typeof InputGroupInput>, 'className'>;

interface Props extends InputProps {
    label?: ReactNode;
    errorMessage?: string;
    hideErrorMessage?: boolean;
    description?: ReactNode;
    currency?: string;
    onCurrencyChange?: (currency: string) => void;
    disabledCurrency?: boolean;
    classNames?: {
        wrapper?: ClassValue;
        inputGroup?: ClassValue;
        input?: ClassValue;
        label?: ClassValue;
    };
    isLoading?: boolean;
    currencies?: C;
}

export default function FloatingInput({
    label,
    errorMessage,
    hideErrorMessage = false,
    description,
    currency,
    onCurrencyChange,
    disabledCurrency,
    disabled,
    classNames,
    placeholder,
    required,
    value,
    isLoading,
    currencies,
    ...restInputProps
}: Props) {
    const isValue = (value != null && String(value) !== '') || !!currency;
    const isInvalid = !!errorMessage;
    const { labelRef, isWrapped } = useWrappedLabel();

    return (
        <div className={cn('flex flex-col gap-1.5', classNames?.wrapper)}>
            <InputGroup
                aria-invalid={isInvalid}
                data-disabled={disabled || undefined}
                className={cn('bg-zinc-100', classNames?.inputGroup)}
            >
                {label && (
                    <InputGroupLabel
                        ref={labelRef}
                        required={required}
                        className={cn(
                            'inset-e-3 data-[has-value=false]:text-[13px]/5',
                            isWrapped
                                ? 'data-[has-value=true]:text-[11px]/3 group-has-[[data-slot=input-group-control]:focus]/input-group:text-[11px]/3'
                                : 'data-[has-value=true]:text-[11px]/4 group-has-[[data-slot=input-group-control]:focus]/input-group:text-[11px]/4',
                            classNames?.label
                        )}
                        isInvalid={isInvalid}
                        isValue={isValue}
                    >
                        {label}
                    </InputGroupLabel>
                )}

                {currency && (
                    <InputGroupAddon
                        align="inline-start"
                        className={cn('ps-3 shrink-0', label ? 'pt-5' : 'py-0')}
                    >
                        <span className="text-back text-sm">{currencies?.[currency]?.symbol}</span>
                    </InputGroupAddon>
                )}

                <InputGroupInput
                    aria-invalid={isInvalid}
                    disabled={disabled}
                    placeholder={placeholder}
                    required={required}
                    value={value ?? ''}
                    className={cn('', classNames?.input)}
                    {...restInputProps}
                />

                {isLoading && (
                    <InputGroupAddon align="inline-end" className="pr-3 shrink-0">
                        <Spinner className="size-5 text-accent" />
                    </InputGroupAddon>
                )}

                {currency && (
                    <InputGroupAddon align="inline-end" className="pr-3 shrink-0">
                        <select
                            aria-label="Select currency"
                            className="bg-transparent border-0 outline-none font-normal! text-default-400 focus-visible:text-neutral-900 text-sm cursor-pointer disabled:pointer-events-none"
                            disabled={disabledCurrency}
                            name="currency"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            onChange={(e) => onCurrencyChange?.(e.target.value)}
                            value={currency}
                        >
                            {Object.keys(currencies ?? {}).map((code) => (
                                <option key={code} value={code}>
                                    {code}
                                </option>
                            ))}
                        </select>
                    </InputGroupAddon>
                )}
            </InputGroup>

            {!hideErrorMessage && errorMessage ? (
                <span className="text-danger text-xs">{errorMessage}</span>
            ) : description ? (
                <span className="text-muted text-xs wrap-break-word text-wrap">{description}</span>
            ) : null}
        </div>
    );
}
