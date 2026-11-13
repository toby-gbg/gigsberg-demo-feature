'use client';

import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { useTranslations } from 'next-intl';
import { useUnmount } from 'react-use';

import { AccountSettingOrderFilters } from '@/interfaces/account-settings/AccountSettingOrder';
import { C } from '@/interfaces/Currency';
import { AccountSettingListing } from '@/interfaces/Listing';
import MobileTicketApp from '@/interfaces/MobileTicketApp';
import ListingMapper from '@/utils/mappers/listing/listing.mapper';
import { useAccountListings, useDeleteListingMutation } from '@/swr/features/listings';

import AccountSettingsFilter from '@/components/account-settings/AccountSettingsFilter';
import AccountSettingsSection from '@/components/account-settings/AccountSettingsSection';
import DropdownListing from '@/components/account-settings/dropdown-content/DropdownListing';
import TicketCard from '@/components/account-settings/TicketCard';
import TicketCardSkeleton from '@/components/account-settings/TicketCardSkeleton';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

import { $deleteListing, $deleteListingModal, $editListing, $editListingModal } from '../_stores';
import AccountSettingsEditListingModal from './AccountSettingsEditListingModal';
import NoListingsFoundFallback from './NoListingsFoundFallback';

interface Props {
    mobileTicketApp: MobileTicketApp[];
    currencies: C;
}

const defaultFilters = {
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'created_at',
    sortDirection: 'DESC',
};

export default function AccountSettingListingsView({ mobileTicketApp, currencies }: Props) {
    const t = useTranslations();

    const [filters, setFilters] = useState<AccountSettingOrderFilters>(defaultFilters);
    const {
        data,
        isValidating: isFetching,
        isLoading,
        hasMore,
        mutate,
        loadMore,
    } = useAccountListings(filters);

    const deleteListing = useStore($deleteListing);
    const isOpenDeleteListingModal = useStore($deleteListingModal);

    const editListing = useStore($editListing);
    const isOpenEditListingModal = useStore($editListingModal);

    const closeDeleteModal = () => {
        $deleteListing.set(null);
        $deleteListingModal.set(false);
    };

    const { trigger: deleteTrigger, isMutating } = useDeleteListingMutation({
        onSuccess: () => {
            closeDeleteModal();
            mutate();
            toast.add({ title: t('success'), type: 'success' });
        },
        onError: (error) => {
            closeDeleteModal();
            toast.add({ title: t(error.data.errorKey), type: 'error' });
        },
    });

    const onDelete = () => {
        if (!deleteListing) return;
        deleteTrigger({ id: deleteListing.id });
    };

    useUnmount(() => {
        $editListing.set(null);
        $editListingModal.set(false);
        $deleteListing.set(null);
        $deleteListingModal.set(false);
    });

    return (
        <AccountSettingsSection title={t('listings')}>
            <AccountSettingsEditListingModal
                mobileTicketApp={mobileTicketApp}
                isOpen={isOpenEditListingModal}
                listing={editListing}
                mutate={mutate}
                currencies={currencies ?? {}}
            />
            <ConfirmDeleteModal
                isOpen={isOpenDeleteListingModal}
                onConfirm={onDelete}
                onOpenChange={(value) => $deleteListingModal.set(value)}
                onCancel={() => $deleteListingModal.set(false)}
                isMutating={isMutating}
                description={t('delete_listing_confirmation')}
            />
            <AccountSettingsFilter
                filters={filters}
                defaultFilters={defaultFilters}
                setFilters={setFilters}
                isListing
            />
            {isLoading ? (
                <TicketCardSkeleton />
            ) : !data || data.length === 0 ? (
                <NoListingsFoundFallback />
            ) : (
                <div className="flex flex-col gap-y-5 col-span-12">
                    {data.map((listing, index) => {
                        return (
                            <TicketCard<AccountSettingListing>
                                key={`${listing.id}-${index}`}
                                item={listing}
                                fields={ListingMapper.toTable(listing)}
                                dropdownContent={<DropdownListing item={listing} mutate={mutate} />}
                            />
                        );
                    })}
                    {filters.pageNumber !== 1 && isFetching && <TicketCardSkeleton />}
                    {hasMore && (
                        <Button
                            className="bg-gradient hover:opacity-90 mx-auto text-on-main"
                            onClick={loadMore}
                            disabled={isFetching}
                            isLoading={isFetching}
                        >
                            {t('load_more')}
                        </Button>
                    )}
                </div>
            )}
        </AccountSettingsSection>
    );
}
