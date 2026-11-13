'use client';

import { useTranslations } from 'next-intl';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { isEmail } from 'validator';

import { UpdateUser } from '@/interfaces/User';
import UserMapper from '@/utils/mappers/user/user.mapper';
import { useUpdateUserMutation } from '@/swr/features/user';
import { FIRST_NAME_REGEX, LAST_NAME_REGEX, LATIN_REGEX } from '@/constants/regexs';

import { useUser } from '@/providers/UserProvider';

import AccountSettingsCard from '@/components/account-settings/AccountSettingsSection';
import FloatingInput from '@/components/FloatingInput';
import PhoneSelectInput from '@/components/PhoneSelectInput';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

const AccountSettingPersonalDetailsView = () => {
    const t = useTranslations();
    const user = useUser();

    const { trigger: updateUser, isMutating: isLoading } = useUpdateUserMutation({
        onSuccess: () => {
            // useUpdateUserMutation already updates the user in UserProvider before this callback.
            toast.add({ title: t('personal_details_updated'), type: 'success' });
            window.location.reload();
        },
        onError: (error) => toast.add({ title: t(error.data.errorKey), type: 'error' }),
    });

    const { control, handleSubmit } = useForm<UpdateUser>({
        mode: 'onChange',
        defaultValues: {
            ...(user && UserMapper.toAccountDetails(user)),
        },
    });

    const onSubmit: SubmitHandler<UpdateUser> = (data) => {
        if (!user) return;
        return updateUser(data);
    };

    return (
        <AccountSettingsCard
            title={t('personal_details')}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            isRequired
            asForm
        >
            <Controller
                control={control}
                name="first_name"
                rules={{
                    required: t('firstname_required'),
                    minLength: { value: 3, message: t('field_min_length', { length: 3 }) },
                    maxLength: { value: 195, message: t('field_max_length', { length: 195 }) },
                    pattern: {
                        value: FIRST_NAME_REGEX,
                        message: t('name_invalid_format'),
                    },
                }}
                render={({ field, fieldState: { error } }) => (
                    <FloatingInput
                        {...field}
                        label={t('firstname')}
                        required
                        disabled={!user}
                        isLoading={!user}
                        errorMessage={error?.message}
                        classNames={{ wrapper: 'col-span-12 md:col-span-6' }}
                    />
                )}
            />

            <Controller
                control={control}
                name="last_name"
                rules={{
                    required: t('lastname_required'),
                    minLength: { value: 3, message: t('field_min_length', { length: 3 }) },
                    maxLength: { value: 195, message: t('field_max_length', { length: 195 }) },
                    pattern: {
                        value: LAST_NAME_REGEX,
                        message: t('name_invalid_format'),
                    },
                }}
                render={({ field, fieldState: { error } }) => (
                    <FloatingInput
                        {...field}
                        label={t('lastname')}
                        required
                        disabled={!user}
                        isLoading={!user}
                        errorMessage={error?.message}
                        classNames={{ wrapper: 'col-span-12 md:col-span-6' }}
                    />
                )}
            />

            <Controller
                control={control}
                name="email"
                rules={{
                    required: t('field_required'),
                    validate: (email) => isEmail(email ?? '') || t('invalid_email'),
                }}
                render={({ field, fieldState: { error } }) => (
                    <FloatingInput
                        {...field}
                        label={t('email_address')}
                        type="email"
                        required
                        disabled={!user}
                        isLoading={!user}
                        errorMessage={error?.message}
                        classNames={{ wrapper: 'col-span-12 md:col-span-6' }}
                    />
                )}
            />

            <Controller
                control={control}
                name="company_name"
                rules={{
                    maxLength: 50,
                    pattern: {
                        value: LATIN_REGEX,
                        message: t('latin_characters'),
                    },
                }}
                render={({ field, fieldState: { error } }) => (
                    <FloatingInput
                        {...field}
                        label={t('company_name')}
                        disabled={!user}
                        isLoading={!user}
                        errorMessage={error?.message}
                        classNames={{ wrapper: 'col-span-12 md:col-span-6' }}
                    />
                )}
            />

            <Controller
                control={control}
                name="phone"
                rules={{
                    required: t('field_required'),
                    validate: (value) => {
                        if (!value?.isValid) return t('invalid_phone');
                    },
                }}
                render={({ field, fieldState }) => (
                    <PhoneSelectInput
                        containerClassName="col-span-12"
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        value={field.value}
                        error={fieldState.error}
                    />
                )}
            />

            <Button
                type="submit"
                className="col-span-12 ms-auto min-w-24"
                disabled={isLoading}
                isLoading={isLoading}
            >
                {t('save')}
            </Button>
        </AccountSettingsCard>
    );
};

export default AccountSettingPersonalDetailsView;
