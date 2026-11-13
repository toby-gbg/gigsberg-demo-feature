'use client';

import { useTranslations } from 'next-intl';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { UpdateUserPassword } from '@/interfaces/User';
import { useUpdatePasswordMutation } from '@/swr/features/user';
import { PASSWORD_REGEX } from '@/constants/regexs';

import { useUser } from '@/providers/UserProvider';

import AccountSettingsCard from '@/components/account-settings/AccountSettingsSection';
import FloatingInput from '@/components/FloatingInput';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

const AccountSettingChangePasswordView = () => {
    const t = useTranslations();
    const { control, handleSubmit, getValues } = useForm<UpdateUserPassword>();

    const user = useUser();

    const { trigger: updatePassword, isMutating: isLoading } = useUpdatePasswordMutation({
        onSuccess: () => toast.add({ title: t('user_password_updated'), type: 'success' }),
        onError: (error) => toast.add({ title: t(error.data.errorKey), type: 'error' }),
    });

    const onSubmit: SubmitHandler<UpdateUserPassword> = (data) => {
        if (!user) return;
        return updatePassword(data);
    };

    return (
        <AccountSettingsCard
            title={t('change_password')}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            isRequired
            asForm
        >
            <Controller
                control={control}
                name="currentPassword"
                rules={{
                    required: t('field_required'),
                    minLength: { value: 8, message: t('field_min_length', { length: 8 }) },
                    pattern: {
                        value: PASSWORD_REGEX,
                        message: t('password_invalid_format'),
                    },
                }}
                render={({ field, fieldState: { error } }) => (
                    <FloatingInput
                        {...field}
                        type="password"
                        label={t('old_password')}
                        required
                        errorMessage={error?.message}
                        classNames={{ wrapper: 'col-span-12 md:col-span-6' }}
                    />
                )}
            />

            <Controller
                control={control}
                name="newPassword"
                rules={{
                    required: t('field_required'),
                    minLength: { value: 8, message: t('field_min_length', { length: 8 }) },
                    pattern: {
                        value: PASSWORD_REGEX,
                        message: t('password_invalid_format'),
                    },
                }}
                render={({ field, fieldState: { error } }) => (
                    <FloatingInput
                        {...field}
                        type="password"
                        label={t('new_password')}
                        required
                        errorMessage={error?.message}
                        classNames={{ wrapper: 'col-span-12 md:col-span-6' }}
                    />
                )}
            />

            <Controller
                control={control}
                name="confirmPassword"
                rules={{
                    required: t('field_required'),
                    minLength: { value: 8, message: t('field_min_length', { length: 8 }) },
                    validate: (value) =>
                        value === getValues('newPassword') || t('passwords_mismatch'),
                    pattern: {
                        value: PASSWORD_REGEX,
                        message: t('password_invalid_format'),
                    },
                }}
                render={({ field, fieldState: { error } }) => (
                    <FloatingInput
                        {...field}
                        type="password"
                        label={t('confirm_new_password')}
                        required
                        errorMessage={error?.message}
                        classNames={{ wrapper: 'col-span-12' }}
                    />
                )}
            />

            <Button
                type="submit"
                className="col-span-12 ms-auto min-w-24"
                disabled={isLoading}
                isLoading={isLoading}
            >
                {t('continue')}
            </Button>
        </AccountSettingsCard>
    );
};

export default AccountSettingChangePasswordView;
