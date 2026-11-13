import { userApi } from '@/services/server/users';

import AccountSettingApiCredentialsView from './_components/AccountSettingApiCredentialsView';

const AccountSettingApiPage = async () => {
    const currentUser = await userApi.getCurrentUser();

    return <AccountSettingApiCredentialsView currentUser={currentUser} />;
};

export default AccountSettingApiPage;
