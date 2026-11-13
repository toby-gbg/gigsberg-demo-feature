import { notFound } from 'next/navigation';

import Headers from '@/lib/headers';

import AccountSettingListingsFetcher from './_components/AccountSettingListingsFetcher';

const AccountSettingListingsPage = async () => {
    const domainInfo = await Headers.getDomainInfo();

    if (domainInfo?.config.features?.disableTicketSelling) {
        return notFound();
    }

    return <AccountSettingListingsFetcher />;
};

export default AccountSettingListingsPage;
