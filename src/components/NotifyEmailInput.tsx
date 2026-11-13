'use client';

import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Control, Controller } from 'react-hook-form';
import { isEmail } from 'validator';

import { NewsletterForm } from '@/interfaces/Newsletter';
import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';

import { Input } from './ui/Input';
import { InputGroup } from './ui/InputGroup';

interface NotifyEmailInputProps {
    control: Control<NewsletterForm>;
    inputWrapperClassName?: string;
    id?: string;
    className?: string;
}

const NotifyEmailInput = ({
    control,
    inputWrapperClassName,
    id = 'email',
    className,
}: NotifyEmailInputProps) => {
    const t = useTranslations();

    return (
        <Controller
            control={control}
            name="email"
            rules={{
                required: t('email_required'),
                validate: (email) =>
                    isEmail(email) ||
                    fallbackTranslation(
                        t('invalid_email_message'),
                        'invalid_email_message',
                        'Invalid email. Please try again.'
                    ),
            }}
            render={({ field, fieldState: { error } }) => (
                <div className={cn('flex w-full flex-col gap-1.5', className)}>
                    <InputGroup
                        className={cn(
                            'group relative flex w-full items-center overflow-hidden rounded-lg border border-[#9E9E9E] bg-white p-0 text-left ring-0 outline-none transition-colors has-[input:focus]:border-primary min-h-10',
                            inputWrapperClassName,
                            error && 'border-[#D92D20] has-[input:focus]:border-[#D92D20]'
                        )}
                    >
                        <div className="pointer-events-none z-1 absolute left-3 top-1/2 -translate-y-1/2">
                            <Mail width={20} height={20} />
                        </div>
                        <Input
                            id={id}
                            type="email"
                            autoComplete="email"
                            inputMode="email"
                            maxLength={45}
                            placeholder="Sample@email.com"
                            aria-invalid={!!error}
                            className="min-h-10 h-10 min-w-0 flex-1 bg-transparent py-0 text-sm text-black caret-black outline-none placeholder:text-[#616161] pl-11"
                            {...field}
                            value={field?.value || ''}
                        />
                    </InputGroup>
                    {error?.message ? (
                        <span className="text-danger text-xs">{error.message}</span>
                    ) : null}
                </div>
            )}
        />
    );
};

export default NotifyEmailInput;
