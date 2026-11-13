import { useState, type ComponentProps, type ReactNode } from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

import { cn } from '@/lib/cn';

import { Label } from '@/components/ui/Label';

export const inputVariants = cva(
    'flex bg-transparent aria-invalid:bg-red-100 disabled:opacity-50 shadow-field px-3 py-1 aria-invalid:border-red-500 data-[slot=input]:focus-visible:border-none rounded-md outline-none data-[slot=input]:focus-visible:outline-none data-[slot=input]:focus-visible:ring-2 data-[slot=input]:focus-visible:ring-ring/50 aria-invalid:ring-none w-full min-w-0 h-13.5 min-h-9 text-black placeholder:text-[#636367] text-sm transition-[color,box-shadow] transition-all disabled:pointer-events-none'
);

export interface InputClassNames {
    wrapper?: ClassValue;
    input?: ClassValue;
    prefixIcon?: ClassValue;
    suffixIcon?: ClassValue;
}

export type InputProps = ComponentProps<'input'> & {
    prefixIcon?: ReactNode;
    suffixIcon?: ReactNode;
    classNames?: InputClassNames;
};

type LabelInputProps = ComponentProps<'label'> & { required?: boolean };

export function LabelInput({ children, className, required }: LabelInputProps) {
    return (
        <Label className={cn('text-xs', className)}>
            {children}
            {required && (
                <span aria-hidden="true" className="ms-0.5 text-danger">
                    *
                </span>
            )}
        </Label>
    );
}

export function Input({
    prefixIcon,
    suffixIcon,
    type,
    disabled,
    className,
    classNames,
    ...props
}: InputProps) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className={cn('relative w-full', classNames?.wrapper)}>
            {prefixIcon && (
                <span
                    className={cn(
                        'top-1/2 z-10 absolute inset-s-2 flex items-center text-neutral-400 -translate-y-1/2 pointer-events-none',
                        classNames?.prefixIcon
                    )}
                >
                    {prefixIcon}
                </span>
            )}
            <InputPrimitive
                data-slot="input"
                className={cn(
                    inputVariants(),
                    prefixIcon && 'ps-8',
                    (suffixIcon || isPassword) && 'pe-10',
                    className,
                    classNames?.input
                )}
                type={isPassword && isPasswordVisible ? 'text' : type}
                disabled={disabled}
                {...props}
            />
            {isPassword ? (
                <button
                    type="button"
                    disabled={disabled}
                    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                    aria-pressed={isPasswordVisible}
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => setIsPasswordVisible((visible) => !visible)}
                    className={cn(
                        'top-1/2 z-10 absolute inset-e-3 flex items-center rounded-full outline-none text-neutral-400 hover:text-neutral-700 focus-visible:text-neutral-700 disabled:text-neutral-300 transition-all -translate-y-1/2 disabled:pointer-events-none',
                        classNames?.suffixIcon
                    )}
                >
                    {isPasswordVisible ? (
                        <EyeOff className="size-5" aria-hidden="true" />
                    ) : (
                        <Eye className="size-5" aria-hidden="true" />
                    )}
                </button>
            ) : suffixIcon ? (
                <span
                    className={cn(
                        'top-1/2 z-10 absolute inset-e-4 flex items-center text-neutral-400 -translate-y-1/2 pointer-events-none',
                        classNames?.suffixIcon
                    )}
                >
                    {suffixIcon}
                </span>
            ) : null}
        </div>
    );
}

Input.displayName = 'Input';
