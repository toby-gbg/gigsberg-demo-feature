import { currencyApi } from '@/services/server/currencies';
import { userApi } from '@/services/server/users';

import AccountSettingPaymentAccountView from './_components/AccountSettingPaymentAccountView';

const AccountSettingPaymentAccountsPage = async () => {
    const [currentUser, currencies] = await Promise.all([
        userApi.getCurrentUser(),
        currencyApi.getCurrencies(),
    ]);
    return (
        <AccountSettingPaymentAccountView currentUser={currentUser} currencies={currencies ?? {}} />
    );
};

export default AccountSettingPaymentAccountsPage;
