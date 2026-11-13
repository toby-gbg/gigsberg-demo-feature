'use client';

import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { useTranslations } from 'next-intl';
import { useUnmount } from 'react-use';

import AccountSettingOrder, {
    AccountSettingOrderFilters,
} from '@/interfaces/account-settings/AccountSettingOrder';
import User from '@/interfaces/User';
import OrderMapper from '@/utils/mappers/order/order.mapper';
import { useAccountOrders } from '@/swr/features/orders';

import AccountSettingsFilter from '@/components/account-settings/AccountSettingsFilter';
import AccountSettingsSection from '@/components/account-settings/AccountSettingsSection';
import DropdownSale from '@/components/account-settings/dropdown-content/DropdownSale';
import TicketCard from '@/components/account-settings/TicketCard';
import TicketCardSkeleton from '@/components/account-settings/TicketCardSkeleton';
import StoreUploadTicketModal from '@/components/modals/StoreUploadTicketModal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

import { $selectedTicket, $uploadTicketModal } from '../_stores';
import NoSalesFoundFallback from './NoSalesFoundFallback';

const defaultFilters: AccountSettingOrderFilters = {
    type: 'sales',
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'purchase_date',
    sortDirection: 'DESC',
};

interface Props {
    currentUser: User | null;
}

export default function AccountSettingSalesView({ currentUser }: Props) {
    const t = useTranslations();
    const selectedTicket = useStore($selectedTicket);
    const isOpenUploadTicketModal = useStore($uploadTicketModal);
    const [filters, setFilters] = useState<AccountSettingOrderFilters>(defaultFilters);

    const {
        data,
        isValidating: isFetching,
        hasMore,
        loadMore,
    } = useAccountOrders(filters, currentUser?.id);
    const noData = !data || data.length === 0;

    useUnmount(() => {
        $selectedTicket.set(null);
        $uploadTicketModal.set(false);
    });

    return (
        <AccountSettingsSection title={t('sales')}>
            <StoreUploadTicketModal
                isOpen={isOpenUploadTicketModal}
                selectedTicket={selectedTicket}
            />

            <AccountSettingsFilter
                filters={filters}
                defaultFilters={defaultFilters}
                setFilters={setFilters}
            />

            {isFetching && <TicketCardSkeleton />}
            {!isFetching && noData && <NoSalesFoundFallback />}
            {!noData && (
                <div className="flex flex-col gap-y-5 col-span-12">
                    {data.map((sale, index) => {
                        return (
                            <TicketCard<AccountSettingOrder>
                                key={`${sale.id}-${index}`}
                                item={sale}
                                fields={OrderMapper.toSalesTable(sale)}
                                dropdownContent={<DropdownSale item={sale} />}
                            />
                        );
                    })}

                    {isFetching && <TicketCardSkeleton />}
                    {hasMore && (
                        <Button
                            className="bg-gradient hover:opacity-90 mx-auto text-on-main"
                            onClick={() => loadMore()}
                            disabled={isFetching}
                        >
                            {isFetching ? <Spinner className="size-5" /> : t('load_more')}
                        </Button>
                    )}
                </div>
            )}
        </AccountSettingsSection>
    );
}
