'use client';

import { Fragment } from 'react';
import { useTranslations } from 'next-intl';
import { Controller, useFormContext } from 'react-hook-form';

import { CheckoutStep1Form } from '@/interfaces/Checkout';
import { getInternationalNumber } from '@/lib/phone';
import { FIRST_NAME_REGEX, LAST_NAME_REGEX, PASSWORD_REGEX } from '@/constants/regexs';

import { useUser } from '@/providers/UserProvider';
import useIntlRouter from '@/hooks/useIntlRouter';

import FloatingInput from '@/components/FloatingInput';
import PhoneSelectInput from '@/components/PhoneSelectInput';
import { toast } from '@/components/ui/Toast';

import CheckEmailInput, { CheckEmailValue } from './CheckEmailInput';

export default function CheckoutContactInformations() {
    const t = useTranslations();
    const router = useIntlRouter();

    const user = useUser();

    // Form
    const { control, trigger } = useFormContext<CheckoutStep1Form>();

    const openLoginModal = (email?: string) => {
        if (email) sessionStorage.setItem('storage-email', email);
        // WLB-3503: login falls back to the homepage when this page is not passed along.
        const returnPath = `${window.location.pathname}${window.location.search}`;
        router.push(`/login?redirectUrl=${encodeURIComponent(returnPath)}`);
    };

    const handleEmailStatusChange = (
        nextValue: CheckEmailValue,
        onChange: (v: CheckEmailValue | undefined) => void
    ) => {
        if (nextValue.value === '' && nextValue.status === 'idle') {
            onChange(undefined);
            return;
        }
        onChange(nextValue);

        if (nextValue.status === 'already_registered') {
            openLoginModal(nextValue.value);
            toast.add({
                type: 'warning',
                title: t('account_already_exists'),
                description: t('login_with_password_instead'),
            });
        }
    };

    // Render user's info only
    if (user) {
        return (
            <div className="col-span-12">
                <p className="font-bold text-xl capitalize">{t('your_account')}</p>
                <p className="text-foreground-600 text-sm md:text-base">
                    {t('we_will_send_ticket_update')}
                </p>

                {user.phone ? (
                    <div className="space-y-2 md:space-y-4 bg-default-100 mt-4 p-3 md:p-4 rounded-xl text-sm md:text-base">
                        <div>
                            <p className="text-foreground-500 capitalize">{t('phone_number')}</p>
                            <p className="font-semibold">
                                {user.phone &&
                                    getInternationalNumber(user.phone, user.phone_prefix)}
                            </p>
                        </div>

                        <div>
                            <p className="text-foreground-500 capitalize">{t('email_address')}</p>
                            <p className="font-semibold wrap-break-word">{user.email}</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 mt-4">
                        <FloatingInput
                            label={t('email')}
                            type="email"
                            value={user.email}
                            disabled
                            classNames={{ inputGroup: 'data-[disabled=true]:opacity-100' }}
                        />

                        <Controller
                            control={control}
                            name="phone"
                            rules={{
                                required: t('phone_required'),
                                validate: ({ isValid }) => {
                                    if (!isValid) return t('invalid_phone');
                                },
                            }}
                            render={({ field, fieldState }) => (
                                <PhoneSelectInput
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={() => {
                                        field.onBlur();
                                        void trigger('phone');
                                    }}
                                    error={fieldState.error}
                                />
                            )}
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <Fragment>
            <div className="col-span-12">
                <p className="font-bold md:text-xl">{t('your_account')}</p>

                <p className="text-gray-600 text-sm md:text-base">
                    {t('already_registered')}?{' '}
                    <button
                        type="button"
                        className="font-semibold text-black hover:underline focus-visible:underline focus-visible:outline-none transition-all"
                        onClick={() => openLoginModal()}
                    >
                        {t('login')}
                    </button>
                </p>
            </div>

            <Controller
                control={control}
                name="first_name"
                rules={{
                    required: t('firstname_required'),
                    minLength: {
                        value: 3,
                        message: t('field_min_length', { length: 3 }),
                    },
                    maxLength: {
                        value: 50,
                        message: t('field_max_length', { length: 50 }),
                    },
                    pattern: {
                        value: FIRST_NAME_REGEX,
                        message: t('name_invalid_format'),
                    },
                }}
                render={({ field, fieldState: { error } }) => (
                    <div className="col-span-12 md:col-span-6">
                        <FloatingInput
                            label={t('firstname')}
                            required
                            errorMessage={error?.message}
                            {...field}
                        />
                    </div>
                )}
            />

            <Controller
                control={control}
                name="last_name"
                rules={{
                    required: t('lastname_required'),
                    minLength: {
                        value: 3,
                        message: t('field_min_length', { length: 3 }),
                    },
                    maxLength: {
                        value: 50,
                        message: t('field_max_length', { length: 50 }),
                    },
                    pattern: {
                        value: LAST_NAME_REGEX,
                        message: t('name_invalid_format'),
                    },
                }}
                render={({ field, fieldState: { error } }) => (
                    <div className="col-span-12 md:col-span-6">
                        <FloatingInput
                            label={t('lastname')}
                            required
                            errorMessage={error?.message}
                            {...field}
                        />
                    </div>
                )}
            />
            <Controller
                control={control}
                name="email"
                rules={{
                    required: t('email_required'),
                    validate: (value?: CheckEmailValue) => {
                        switch (value?.status) {
                            case 'invalid_format':
                                return t('invalid_email');
                            case 'already_registered':
                                return t('email_already_used', { email: value.value });
                            case 'check_failed':
                                return t('email_check_failed');
                        }
                    },
                }}
                render={({ field: { onChange, value } }) => (
                    <div className="col-span-12 md:col-span-6">
                        <CheckEmailInput
                            value={value}
                            onChange={(nextValue) => handleEmailStatusChange(nextValue, onChange)}
                        />
                    </div>
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
                    <div className="col-span-12 md:col-span-6">
                        <FloatingInput
                            required
                            label={t('password')}
                            type="password"
                            autoComplete="off"
                            errorMessage={error?.message}
                            {...field}
                        />
                    </div>
                )}
            />

            <Controller
                control={control}
                name="phone"
                rules={{
                    required: t('phone_required'),
                    validate: ({ isValid }) => {
                        if (!isValid) return t('invalid_phone');
                    },
                }}
                render={({ field, fieldState }) => (
                    <div className="col-span-12">
                        <PhoneSelectInput
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={() => {
                                field.onBlur();
                                void trigger('phone');
                            }}
                            error={fieldState.error}
                        />
                    </div>
                )}
            />
        </Fragment>
    );
}
