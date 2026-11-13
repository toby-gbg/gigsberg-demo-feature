import { ipApi } from '@/services/server/ip';
import { userApi } from '@/services/server/users';

import AccountSettingPurchasesView from './_components/AccountSettingPurchasesView';

const AccountSettingPurchasesPage = async () => {
    const [currentUser, ipCountry] = await Promise.all([
        userApi.getCurrentUser(),
        ipApi.getCountryIp(),
    ]);

    return <AccountSettingPurchasesView currentUser={currentUser ?? null} ipCountry={ipCountry} />;
};

export default AccountSettingPurchasesPage;
