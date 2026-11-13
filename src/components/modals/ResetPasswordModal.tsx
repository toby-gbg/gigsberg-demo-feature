'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { isEmail } from 'validator';

import { LostPassword } from '@/interfaces/Auth';
import { cn } from '@/lib/cn';
import { navigateAuthExit, publicLocaleHome } from '@/utils/authNavigation';
import { useResetPasswordMutation, useSendOtpMutation } from '@/swr/features/auth';
import { PASSWORD_REGEX } from '@/constants/regexs';

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

export default function ResetPasswordModal() {
    const [isOpen, setIsOpen] = useState(true);
    const modalRef = useRef<HTMLDivElement>(null);

    const t = useTranslations();
    const locale = useLocale();
    const searchParams = useSearchParams();

    const { control, reset, handleSubmit, setValue, getValues } = useForm<LostPassword>();

    const { trigger: triggerResetPassword, isMutating: isLoading } = useResetPasswordMutation({
        onSuccess: () => {
            toast.add({ title: t('reset_password_success'), type: 'success' });
            startCooldown(60);

            reset();
            sessionStorage.removeItem('reset-password-opt-email');
            if (isOpen || modalRef.current) setIsOpen(false);

            // go(-2) / history.back() can land on an external site.
            navigateAuthExit(locale, searchParams);
        },
        onError: (error) => toast.add({ title: t(error.data.errorKey), type: 'error' }),
    });

    const { trigger: triggerSendOtp, isMutating: isResending } = useSendOtpMutation({});

    const [initialEmail, setInitialEmail] = useState('');
    const [cooldown, setCooldown] = useState(0);

    const startCooldown = (coolDown: number) => setCooldown(coolDown);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => startCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    useEffect(() => {
        if (!initialEmail) return;
        setValue('email', initialEmail);
        startCooldown(60);
    }, [initialEmail, setValue]);

    useEffect(() => {
        const resettingEmail = sessionStorage.getItem('storage-email');
        if (!resettingEmail) window.location.replace(publicLocaleHome(locale));
        setInitialEmail(resettingEmail || '');
    }, [locale]);

    const resendCode = async () => {
        const email = getValues('email');

        await toast.promise(triggerSendOtp({ email }), {
            loading: { title: t('loading'), type: 'loading' },
            success: { title: t('otp_resent_successfully'), type: 'success' },
            error: { title: t('error_sending_otp'), type: 'error' },
        });

        startCooldown(60);
    };

    const onSubmit = handleSubmit((data) => triggerResetPassword(data));

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
                    <form
                        className="gap-4 grid grid-cols-1 sm:grid-cols-12"
                        onSubmit={onSubmit}
                        noValidate
                    >
                        <Controller
                            name="email"
                            control={control}
                            rules={{
                                required: t('field_required'),
                                validate: (email) => isEmail(email) ?? t('invalid_email'),
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <FloatingInput
                                    label={t('email')}
                                    type="email"
                                    errorMessage={error?.message}
                                    required
                                    readOnly
                                    aria-readonly
                                    autoComplete="email"
                                    spellCheck={false}
                                    autoCapitalize="none"
                                    classNames={{ wrapper: 'col-span-12 sm:col-span-6' }}
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="otp"
                            rules={{
                                required: t('field_required'),
                                minLength: {
                                    value: 6,
                                    message: t('otp_code_invalid_length'),
                                },
                                maxLength: {
                                    value: 6,
                                    message: t('otp_code_invalid_length'),
                                },
                            }}
                            render={({ field, fieldState: { error } }) => {
                                const { onChange, ...restField } = field;
                                return (
                                    <div className="col-span-12 sm:col-span-6">
                                        <FloatingInput
                                            label="OTP"
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            autoComplete="one-time-code"
                                            spellCheck={false}
                                            autoCapitalize="none"
                                            errorMessage={error?.message}
                                            required
                                            {...restField}
                                            onChange={(event) =>
                                                onChange(event.target.value.replace(/\D/g, ''))
                                            }
                                        />
                                        <div className="mt-1">
                                            <button
                                                type="button"
                                                onClick={resendCode}
                                                disabled={isResending || cooldown > 0}
                                                className={cn(
                                                    'w-full text-s my-2 md:my-0 md:text-start text-primary underline-offset-4',
                                                    'hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
                                                    cooldown > 0 && 'cursor-not-allowed'
                                                )}
                                            >
                                                {isResending
                                                    ? t('loading')
                                                    : cooldown > 0
                                                      ? `${t('didnt_receive_code')} ${t('resend')} (${cooldown}s)`
                                                      : `${t('didnt_receive_code')} ${t('resend')}`}
                                            </button>
                                        </div>
                                    </div>
                                );
                            }}
                        />

                        <Controller
                            control={control}
                            name="password"
                            rules={{
                                required: t('field_required'),
                                pattern: {
                                    value: PASSWORD_REGEX,
                                    message: t('password_invalid_format'),
                                },
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <FloatingInput
                                    label={t('new_password')}
                                    type="password"
                                    errorMessage={error?.message}
                                    required
                                    autoComplete="new-password"
                                    // description={t('password_invalid_format')}
                                    classNames={{ wrapper: 'col-span-12 sm:col-span-6' }}
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="confirmPassword"
                            rules={{
                                required: t('field_required'),
                                validate: (value) =>
                                    value === getValues('password') || t('passwords_mismatch'),
                                pattern: {
                                    value: PASSWORD_REGEX,
                                    message: t('password_invalid_format'),
                                },
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <FloatingInput
                                    label={t('confirm_new_password')}
                                    type="password"
                                    errorMessage={error?.message}
                                    required
                                    autoComplete="current-password"
                                    classNames={{ wrapper: 'col-span-12 sm:col-span-6' }}
                                    {...field}
                                />
                            )}
                        />

                        <Button
                            type="submit"
                            className="col-span-12 w-full"
                            disabled={isLoading}
                            isLoading={isLoading}
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
