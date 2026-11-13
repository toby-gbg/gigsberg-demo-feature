'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { UserDelete } from '@/interfaces/User';
import { useDeleteUserMutation } from '@/swr/features/user';

import { useUserActions } from '@/providers/UserProvider';
import useIntlRouter from '@/hooks/useIntlRouter';

import AccountSettingsCard from '@/components/account-settings/AccountSettingsSection';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import { toast } from '@/components/ui/Toast';

export default function AccountSettingDeleteAccountView() {
    const t = useTranslations();
    const router = useIntlRouter();
    const { resetCredentials } = useUserActions();

    const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<UserDelete>();

    const { trigger: deleteUser, isMutating: isLoading } = useDeleteUserMutation({
        onSuccess: () => {
            toast.add({ title: t('user_account_deleted'), type: 'success' });
            resetCredentials();
            router.push('/');
        },
        onError: (error) => toast.add({ title: t(error.data.errorKey), type: 'error' }),
    });

    const onSubmit: SubmitHandler<UserDelete> = () => setIsOpenDeleteModal(true);

    return (
        <AccountSettingsCard title={t('delete_account')} onSubmit={handleSubmit(onSubmit)} asForm>
            <ConfirmDeleteModal
                isOpen={isOpenDeleteModal}
                onConfirm={deleteUser}
                onOpenChange={setIsOpenDeleteModal}
                onCancel={() => setIsOpenDeleteModal(false)}
            />
            <div className="col-span-12">
                <div className="flex flex-wrap">
                    <Controller
                        control={control}
                        name="agree"
                        rules={{ required: t('field_accepted') }}
                        render={({ field: { value, onChange } }) => (
                            <Checkbox
                                id="delete-account"
                                checked={Boolean(value)}
                                onCheckedChange={onChange}
                                aria-invalid={Boolean(errors.agree)}
                                className="mt-1 ltr:mr-2 rtl:ml-2"
                            />
                        )}
                    />
                    <Label htmlFor="delete-account" className="text-xs opacity-70">
                        <p className="mb-1">{t('delete_account')}</p>
                        <p>
                            <span className="text-red-500">*</span> {t('delete_user_prevent')}
                        </p>
                    </Label>
                </div>
                {errors.agree && (
                    <p className="mt-2 text-sm text-pink-600">{errors.agree.message}</p>
                )}
            </div>
            <Button
                variant="destructive"
                type="submit"
                className="col-span-12 ms-auto min-w-24"
                disabled={isLoading}
                isLoading={isLoading}
            >
                {t('delete_account_button')}
            </Button>
        </AccountSettingsCard>
    );
}
