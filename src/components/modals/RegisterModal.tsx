'use client';

import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { isEmail } from 'validator';

import type { RegisterWithoutAddress } from '@/interfaces/Auth';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { navigateAuthExit } from '@/utils/authNavigation';
import GoogleEventMapper from '@/utils/GoogleEventMapper';
import { useRegisterMutation } from '@/swr/features/auth';
import { PASSWORD_REGEX } from '@/constants/regexs';

import { useUserActions } from '@/providers/UserProvider';

import FloatingInput from '@/components/FloatingInput';
import Link from '@/components/Link';
import PhoneSelectInput from '@/components/PhoneSelectInput';
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

export default function RegisterModal() {
    const [isOpen, setIsOpen] = useState(true);
    const modalRef = useRef<HTMLDivElement>(null);

    const t = useTranslations();
    const locale = useLocale();
    const searchParams = useSearchParams();
    const { setCredentials } = useUserActions();
    const { control, handleSubmit } = useForm<RegisterWithoutAddress>();

    const { trigger: triggerRegister, isMutating: isLoading } = useRegisterMutation({
        onSuccess: (data) => {
            // Update credentials before navigating back.
            setCredentials(data);
            // activate GA
            const userProvidedData = GoogleEventMapper.mapUserProvidedData(data.user);
            GoogleAnalyticsTracker.triggerUPDSubmit(userProvidedData);

            // toast success message
            toast.add({ title: t('register_success'), type: 'success' });

            if (isOpen || modalRef.current) setIsOpen(false);

            // Never history.back() — previous entry may be an external site.
            navigateAuthExit(locale, searchParams);
        },
        onError: (error) => toast.add({ title: t(error.data.errorKey), type: 'error' }),
    });

    const onSubmit = handleSubmit((data) => {
        const { nationalNumber, prefix } = data.phone;

        if (!nationalNumber) return;

        triggerRegister({
            ...data,
            phone: nationalNumber,
            phone_prefix: prefix,
        });
    });

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (isLoading) return;
                if (!open) {
                    setIsOpen(false);
                    navigateAuthExit(locale, searchParams);
                }
            }}
        >
            {/* prevent Radix focus restoration from jumping down the page on close */}
            <DialogContent popupProps={{ finalFocus: false, ref: modalRef }}>
                <DialogHeader>
                    <DialogTitle>{t('signup_to_our_platform')}</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <form className="gap-4 grid grid-cols-12" onSubmit={onSubmit} noValidate>
                        <Controller
                            control={control}
                            name="first_name"
                            rules={{
                                required: t('firstname_required'),
                                maxLength: 195,
                                minLength: {
                                    value: 3,
                                    message: t('field_min_length', { length: 3 }),
                                },
                                pattern: {
                                    value: /^[A-Za-z]+(?:[ '.-][A-Za-z]+)*\.?$/,
                                    message: t('invalid_name_format'),
                                },
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <FloatingInput
                                    label={t('firstname')}
                                    type="text"
                                    required
                                    errorMessage={error?.message}
                                    classNames={{ wrapper: 'col-span-12 md:col-span-6' }}
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="last_name"
                            rules={{
                                required: t('lastname_required'),
                                maxLength: 195,
                                minLength: {
                                    value: 3,
                                    message: t('field_min_length', { length: 3 }),
                                },
                                pattern: {
                                    value: /^[A-Za-z]+(?:[ '.-][A-Za-z]+)*\.?$/,
                                    message: t('invalid_name_format'),
                                },
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <FloatingInput
                                    label={t('lastname')}
                                    type="text"
                                    required
                                    errorMessage={error?.message}
                                    classNames={{ wrapper: 'col-span-12 md:col-span-6' }}
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="email"
                            rules={{
                                required: t('email_required'),
                                validate: (email) => isEmail(email) || t('invalid_email_format'),
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <FloatingInput
                                    label={t('email')}
                                    type="email"
                                    required
                                    errorMessage={error?.message}
                                    classNames={{ wrapper: 'col-span-12 md:col-span-6' }}
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="password"
                            rules={{
                                required: t('password_required'),
                                pattern: {
                                    value: PASSWORD_REGEX,
                                    message: t('password_invalid_format'),
                                },
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <FloatingInput
                                    label={t('password')}
                                    type="password"
                                    required
                                    errorMessage={error?.message}
                                    classNames={{ wrapper: 'col-span-12 md:col-span-6' }}
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="phone"
                            rules={{
                                required: t('phone_required'),
                                validate: (value) => value?.isValid || t('invalid_phone_format'),
                            }}
                            render={({ field, fieldState }) => (
                                <div className="col-span-12">
                                    <PhoneSelectInput
                                        onChange={field.onChange}
                                        value={field.value}
                                        error={fieldState.error}
                                    />
                                </div>
                            )}
                        />

                        <div className="col-span-12 text-black text-center">
                            <small>
                                {t('by_clicking_continue')}{' '}
                                <Link
                                    prefetch={false}
                                    href="/terms-and-conditions"
                                    target="_blank"
                                    className="font-medium text-black hover:underline"
                                >
                                    {t('terms').toLowerCase()}
                                </Link>
                            </small>
                        </div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            isLoading={isLoading}
                            className="col-span-12 w-full"
                        >
                            {isLoading ? t('registering') : t('continue')}
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
