import { userApi } from '@/services/server/users';

import AccountSettingAddressesView from './_components/AccountSettingAddressesView';

const AccountSettingAddressesPage = async () => {
    const currentUser = await userApi.getCurrentUser();
    return <AccountSettingAddressesView currentUser={currentUser ?? null} />;
};

export default AccountSettingAddressesPage;
