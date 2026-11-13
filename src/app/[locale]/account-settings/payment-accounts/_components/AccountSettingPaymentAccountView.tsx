'use client';

import { Fragment } from 'react';
import { useStore } from '@nanostores/react';
import { useTranslations } from 'next-intl';
import { useUnmount } from 'react-use';

import { C } from '@/interfaces/Currency';
import PaymentMethod from '@/interfaces/PaymentMethod';
import User from '@/interfaces/User';
import { mapPaymentMethodForm } from '@/utils/paymentAccount';
import {
    useDeletePaymentMethodMutation,
    useGetPaymentMethodQuery,
    useUpdatePaymentMethodMutation,
} from '@/swr/features/paymentMethod';

import AccountSettingsCard from '@/components/account-settings/AccountSettingsSection';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import StorePaymentAccountModal from '@/components/modals/StorePaymentAccountModal';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toast';

import {
    $deletePaymentAccount,
    $deletePaymentAccountModal,
    $paymentAccount,
    $paymentAccountModal,
} from '../_stores';
import PaymentAccountNullState from './NullState';
import PaymentAccountItem from './PaymentAccountItem';

interface Props {
    currentUser: User | null;
    currencies: C;
}

export default function AccountSettingPaymentAccountView({ currentUser, currencies }: Props) {
    const t = useTranslations();

    const isOpenDeleteModal = useStore($deletePaymentAccountModal);
    const selectedPaymentAccountDelete = useStore($deletePaymentAccount);

    const userId = currentUser?.id;

    const { data, isLoading, mutate } = useGetPaymentMethodQuery(userId);

    const { trigger: deletePaymentMethod, isMutating: isDeleting } = useDeletePaymentMethodMutation(
        {
            userId,
            onSuccess: () => {
                toast.add({
                    title: t('payment_account_has_been_deleted_successfully'),
                    type: 'success',
                });
                mutate();
            },
            onError: (error) => toast.add({ title: t(error.data.errorKey), type: 'error' }),
        }
    );
    const { trigger: updatePaymentMethod } = useUpdatePaymentMethodMutation({
        userId,
        onSuccess: () => {
            toast.add({ title: t('update_payment_method_success'), type: 'success' });
        },
        onError: () => toast.add({ title: t('submit_form_error'), type: 'error' }),
    });

    const onDelete = async () => {
        if (!selectedPaymentAccountDelete) return;

        await deletePaymentMethod(selectedPaymentAccountDelete.id).finally(() => {
            $deletePaymentAccount.set(null);
            $deletePaymentAccountModal.set(false);
        });
    };

    const onMarkDefault = (id: number, body: PaymentMethod) => {
        const payload = mapPaymentMethodForm(body);
        updatePaymentMethod<PaymentMethod[]>(
            {
                id,
                body: {
                    ...payload,
                    bankType: body.bank_type ?? 1,
                    isDefault: 1,
                    methodType: 'bank',
                },
            },
            {
                optimisticData: (paymentAccounts = []) =>
                    paymentAccounts.map((item) => ({
                        ...item,
                        is_default: item.id === id ? 1 : 0,
                    })),
                revalidate: false,
                rollbackOnError: true,
                throwOnError: false,
            }
        );
    };

    const handleEdit = (paymentAccount: PaymentMethod) => {
        if (paymentAccount) $paymentAccount.set(paymentAccount);
        $paymentAccountModal.set(true);
    };

    const handleDelete = (paymentAccount: PaymentMethod) => {
        if (paymentAccount) $deletePaymentAccount.set(paymentAccount);
        $deletePaymentAccountModal.set(true);
    };

    useUnmount(() => {
        $paymentAccount.set(null);
        $paymentAccountModal.set(false);
        $deletePaymentAccount.set(null);
        $deletePaymentAccountModal.set(false);
    });

    return (
        <Fragment>
            <StorePaymentAccountModal
                userId={userId}
                hasExistingPaymentAccounts={Boolean(data?.some((item) => !item.deleted_at))}
                currencies={currencies}
            />
            <ConfirmDeleteModal
                title={t('delete_payment_method_title')}
                description={t('delete_payment_method_description')}
                isMutating={isDeleting}
                isOpen={isOpenDeleteModal}
                onConfirm={onDelete}
                onOpenChange={(value) => $deletePaymentAccountModal.set(value)}
                onCancel={() => $deletePaymentAccountModal.set(false)}
            />
            <AccountSettingsCard
                title={t('payment_account')}
                onAddClick={() => {
                    $paymentAccount.set(null);
                    $paymentAccountModal.set(true);
                }}
            >
                <div className="gap-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 col-span-12">
                    {isLoading || !data ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <Card
                                key={index}
                                className="gap-0 space-y-5 shadow-none p-4 border border-gray-200 rounded-lg"
                            >
                                <Skeleton className="rounded-lg w-full h-12" />
                                <div className="space-y-3">
                                    <Skeleton className="rounded-lg w-3/5 h-3" />
                                    <Skeleton className="rounded-lg w-4/5 h-3" />
                                    <Skeleton className="rounded-lg w-2/5 h-3" />
                                </div>
                            </Card>
                        ))
                    ) : data.length > 0 ? (
                        data.map((item) => (
                            <PaymentAccountItem
                                data={item}
                                key={item.id}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onMarkDefault={onMarkDefault}
                            />
                        ))
                    ) : (
                        <PaymentAccountNullState />
                    )}
                </div>
            </AccountSettingsCard>
        </Fragment>
    );
}
