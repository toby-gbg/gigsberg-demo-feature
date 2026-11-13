'use client';

import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { isEmail } from 'validator';

import type { SendOtp } from '@/interfaces/Auth';
import { navigateAuthExit } from '@/utils/authNavigation';
import { useSendOtpMutation } from '@/swr/features/auth';

import useIntlRouter from '@/hooks/useIntlRouter';

import FloatingInput from '@/components/FloatingInput';
import { Button } from '@/components/ui/Button';
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Dialog';
import { toast } from '@/components/ui/Toast';

export default function ResetPasswordSendOTPModal() {
    const [isOpen, setIsOpen] = useState(true);
    const modalRef = useRef<HTMLDivElement>(null);

    const t = useTranslations();
    const locale = useLocale();
    const searchParams = useSearchParams();
    const router = useIntlRouter();

    const { control, reset, handleSubmit, getValues } = useForm<SendOtp>();

    const { trigger: triggerSendOtp, isMutating: isLoading } = useSendOtpMutation({
        onSuccess: () => {
            toast.add({
                title: t('unique_code_otp') + ' 🤩',
                type: 'success',
            });

            const email = getValues('email');
            sessionStorage.setItem('storage-email', email);

            reset();

            router.push('otp-password');

            if (isOpen || modalRef.current) setIsOpen(false);
        },
        onError: (error) => toast.add({ title: t(error.data.errorKey), type: 'error' }),
    });

    const onSubmit = handleSubmit(({ email }) => triggerSendOtp({ email }));

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (isLoading) return;
                if (!open) {
                    reset();
                    sessionStorage.removeItem('storage-email');
                    setIsOpen(false);
                    navigateAuthExit(locale, searchParams);
                }
            }}
        >
            {/* prevent Radix focus restoration from jumping down the page on close */}
            <DialogContent popupProps={{ finalFocus: false, ref: modalRef }}>
                <DialogHeader>
                    <DialogTitle>{t('reset_password')}</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <form className="gap-4 grid grid-cols-1" onSubmit={onSubmit} noValidate>
                        <Controller
                            control={control}
                            name="email"
                            rules={{
                                required: t('field_required'),
                                validate: (email) => isEmail(email) || t('invalid_email_format'),
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <FloatingInput
                                    label={t('email')}
                                    type="email"
                                    errorMessage={error?.message}
                                    required
                                    classNames={{ wrapper: 'col-span-12' }}
                                    value={field.value}
                                    onChange={field.onChange}
                                    autoComplete="email"
                                    spellCheck={false}
                                    autoCapitalize="none"
                                />
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={isLoading}
                            isLoading={isLoading}
                            className="col-span-12 w-full"
                        >
                            {t('continue')}
                        </Button>
                    </form>
                </DialogBody>
                <DialogFooter>
                    <p className="text-black text-right">
                        <span className="text-danger">*</span> {t('indicate_require_field')}
                    </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
