'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Controller, useFormContext } from 'react-hook-form';
import { isEmail } from 'validator';

import { NewsletterForm } from '@/interfaces/Newsletter';
import { fallbackTranslation } from '@/utils/common';

import FloatingInput from '@/components/FloatingInput';
import { Button } from '@/components/ui/Button';

interface StoreNewsletterFormProps {
    isLoading?: boolean;
}

const StoreNewsletterForm = ({ isLoading }: StoreNewsletterFormProps) => {
    const t = useTranslations();

    const { control } = useFormContext<NewsletterForm>();

    return (
        <div className="flex flex-col relative">
            <Controller
                control={control}
                name="email"
                rules={{
                    required: t('email_required'),
                    validate: (email) => isEmail(email) || t('invalid_email_format'),
                }}
                render={({ field, fieldState: { error } }) => (
                    <FloatingInput
                        classNames={{
                            inputGroup: 'h-11! min-h-11! rounded-md bg-white pr-12 bg-[#e4e4e7]',
                        }}
                        type="email"
                        placeholder={fallbackTranslation(
                            t('email_address'),
                            'email_address',
                            'Email address'
                        )}
                        errorMessage={error?.message}
                        autoComplete="off"
                        {...field}
                    />
                )}
            />

            <Button
                type="submit"
                className="absolute top-2 right-3 z-10 h-7 w-7 bg-transparent p-0 hover:bg-zinc-100 rounded-full"
                isLoading={isLoading}
                aria-label={t('subscribe')}
            >
                <ArrowRight size={18} className="text-black! text-xs font-semibold" />
            </Button>
        </div>
    );
};

export default StoreNewsletterForm;
