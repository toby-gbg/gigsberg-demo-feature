'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { useTranslations } from 'next-intl';

import Address from '@/interfaces/Address';
import User from '@/interfaces/User';
import { $addresses, appendAddresses, setAddresses } from '@/stores/addresses';
import { $addAddressModal } from '@/stores/modal';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import {
    useAddFavoriteAddressMutation,
    useDeleteAddressMutation,
    useGetAddresses,
    useSetDefaultAddressMutation,
} from '@/swr/features/address';
import { DEFAULT_SIZE } from '@/constants/pagination';

import AccountSettingsItemSkeleton from '@/components/account-settings/AccountSettingsItemSkeleton';
import AccountSettingsSection from '@/components/account-settings/AccountSettingsSection';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import StoreAddressModal from '@/components/modals/StoreAddressModal';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

import AccountSettingsAddressCard from './AccountSettingsAddressCard';
import NoAddressesFoundFallback from './NoAddressesFoundFallback';

export default function AccountSettingAddressesView({
    currentUser,
}: {
    currentUser?: User | null;
}) {
    const t = useTranslations();

    const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [pageNumber, setPageNumber] = useState(1);

    const addresses = useStore($addresses);
    const { data, isFetching, isLoading } = useGetAddresses(
        {
            pageNumber,
            pageSize: DEFAULT_SIZE,
        },
        currentUser?.id
    );

    useEffect(() => {
        if (!data) return;
        if (pageNumber === 1) setAddresses(data.rows);
        else appendAddresses(data.rows);
    }, [data, pageNumber]);

    const { trigger: deleteAddress, isMutating: isDeletingAddress } = useDeleteAddressMutation({
        onSuccess: () => {
            toast.add({
                id: 'delete-address',
                title: t('address_delete_success'),
                type: 'success',
            });
            setSelectedAddress(null);
            setIsOpenDeleteModal(false);
        },
        onError: () =>
            toast.add({ id: 'delete-address', title: t('failed_delete_address'), type: 'error' }),
    });

    const { trigger: favoriteAddress } = useAddFavoriteAddressMutation({});

    const { trigger: setDefaultAddress } = useSetDefaultAddressMutation({
        onSuccess: (address) => {
            toast.add({
                id: 'set-default-address',
                title: t('default_address_updated'),
                type: 'success',
            });
            GoogleAnalyticsTracker.triggerEvent('default_address_changed', {
                entry_point: 'account',
                address_id: address.id,
            });
        },
        onError: () =>
            toast.add({
                id: 'set-default-address',
                title: t('failed_set_default_address'),
                type: 'error',
            }),
    });

    const onDelete = async () => {
        if (!selectedAddress) return;

        return deleteAddress(selectedAddress.id);
    };

    const handleDelete = (address: Address) => {
        if (address) setSelectedAddress(address);
        setIsOpenDeleteModal(true);
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        $addAddressModal.set(true);
    };

    return (
        <AccountSettingsSection
            title={t('addresses')}
            onAddClick={() => {
                setEditingAddress(null);
                $addAddressModal.set(true);
            }}
        >
            <StoreAddressModal
                entryPoint="account"
                hasExistingAddresses={addresses.length > 0}
                address={editingAddress}
            />
            <ConfirmDeleteModal
                isOpen={isOpenDeleteModal}
                title={t('delete_address')}
                description={t('delete_address_desc')}
                isMutating={isDeletingAddress}
                onConfirm={onDelete}
                onOpenChange={setIsOpenDeleteModal}
                onCancel={() => setIsOpenDeleteModal(false)}
            />
            {!isFetching && !isLoading && !addresses.length ? (
                <NoAddressesFoundFallback
                    onAddClick={() => {
                        setEditingAddress(null);
                        $addAddressModal.set(true);
                    }}
                />
            ) : (
                <div className="col-span-12 flex flex-col gap-y-5">
                    {addresses.map((address) => (
                        <AccountSettingsAddressCard
                            key={address.id}
                            item={address}
                            onFavorite={(item: Address) => {
                                const isFavorite = !item.is_favorite;
                                return favoriteAddress(
                                    { id: item.id, isFavorite },
                                    {
                                        onSuccess: () =>
                                            toast.add({
                                                id: isFavorite
                                                    ? 'favorite-address'
                                                    : 'remove-favorite-address',
                                                title: isFavorite
                                                    ? t('address_favorite_success')
                                                    : t('address_remove_favorite_success'),
                                                type: 'success',
                                            }),
                                        onError: () =>
                                            toast.add({
                                                id: isFavorite
                                                    ? 'favorite-address'
                                                    : 'remove-favorite-address',
                                                title: isFavorite
                                                    ? t('failed_favorite_address')
                                                    : t('failed_remove_favorite_address'),
                                                type: 'error',
                                            }),
                                    }
                                );
                            }}
                            onSetDefault={(item: Address) => setDefaultAddress(item.id)}
                            onEdit={handleEdit}
                            onDelete={() => handleDelete(address)}
                        />
                    ))}

                    {isLoading || isFetching ? <AccountSettingsItemSkeleton /> : null}

                    {data?.hasMore ? (
                        <Button
                            className="bg-gradient text-on-main mx-auto w-fit hover:opacity-90"
                            onClick={() => setPageNumber((page) => page + 1)}
                        >
                            {t('load_more')}
                        </Button>
                    ) : null}
                </div>
            )}
        </AccountSettingsSection>
    );
}
