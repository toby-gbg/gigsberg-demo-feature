import { notFound } from 'next/navigation';
import { all } from 'better-all';

import Headers from '@/lib/headers';
import { userApi } from '@/services/server/users';

import AccountSettingSalesView from './_components/AccountSettingSalesView';

const AccountSettingSalesPage = async () => {
    const { currentUser, domainInfo } = await all({
        async currentUser() {
            return userApi.getCurrentUser();
        },
        async domainInfo() {
            return Headers.getDomainInfo();
        },
    });

    if (domainInfo?.config.features?.disableTicketSelling) {
        return notFound();
    }

    return <AccountSettingSalesView currentUser={currentUser} />;
};

export default AccountSettingSalesPage;
