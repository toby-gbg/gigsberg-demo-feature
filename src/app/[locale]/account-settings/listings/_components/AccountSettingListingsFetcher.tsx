import { FC } from 'react';
import { all } from 'better-all';

import { currencyApi } from '@/services/server/currencies';
import { mobileAppTicketApi } from '@/services/server/mobile-app-tickets';

import AccountSettingListingsView from './AccountSettingListingsView';

const AccountSettingListingsFetcher: FC = async () => {
    const { mobileTicketApp, currencies } = await all({
        async mobileTicketApp() {
            return mobileAppTicketApi.getMobileAppTickets();
        },
        async currencies() {
            return currencyApi.getCurrencies();
        },
    });

    return (
        <AccountSettingListingsView
            mobileTicketApp={mobileTicketApp}
            currencies={currencies ?? {}}
        />
    );
};

export default AccountSettingListingsFetcher;
