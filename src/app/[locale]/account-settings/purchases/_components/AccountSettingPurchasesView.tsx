'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import AccountSettingOrder, {
    AccountSettingOrderFilters,
} from '@/interfaces/account-settings/AccountSettingOrder';
import Country from '@/interfaces/Country';
import User from '@/interfaces/User';
import OrderMapper from '@/utils/mappers/order/order.mapper';
import { useAccountOrders } from '@/swr/features/orders';

import AccountSettingsFilter from '@/components/account-settings/AccountSettingsFilter';
import AccountSettingsSection from '@/components/account-settings/AccountSettingsSection';
import DropdownPurchase from '@/components/account-settings/dropdown-content/DropdownPurchase';
import TicketCard from '@/components/account-settings/TicketCard';
import TicketCardSkeleton from '@/components/account-settings/TicketCardSkeleton';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

import NoPurchasesFoundFallback from './NoPurchasesFoundFallback';

const defaultFilters: AccountSettingOrderFilters = {
    type: 'purchases',
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'purchase_date',
    sortDirection: 'DESC',
};

interface Props {
    currentUser: User | null;
    ipCountry: Country;
}

export default function AccountSettingPurchasesView({ currentUser, ipCountry }: Props) {
    const t = useTranslations();
    const [filters, setFilters] = useState<AccountSettingOrderFilters>(defaultFilters);
    const {
        data,
        isValidating: isFetching,
        hasMore,
        loadMore,
    } = useAccountOrders(filters, currentUser?.id);
    const noData = !data || data.length === 0;

    return (
        <AccountSettingsSection title={t('purchases')}>
            <AccountSettingsFilter
                filters={filters}
                defaultFilters={defaultFilters}
                setFilters={setFilters}
            />
            {isFetching && <TicketCardSkeleton />}
            {!isFetching && noData && <NoPurchasesFoundFallback ipCountry={ipCountry} />}
            {!noData && (
                <div className="flex flex-col gap-y-5 col-span-12">
                    {data.map((purchase, index) => {
                        return (
                            <TicketCard<AccountSettingOrder>
                                key={`${purchase.id}-${index}`}
                                item={purchase}
                                fields={OrderMapper.toPurchasesTable(purchase)}
                                isDisplayDropdown={!!purchase.allow_downloaded}
                                dropdownContent={<DropdownPurchase item={purchase} />}
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
