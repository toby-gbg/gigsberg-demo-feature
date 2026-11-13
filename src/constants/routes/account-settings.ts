type AccountSetting = {
    key: string;
    url: string;
    scope?: 'seller' | 'buyer';
};

export const ALLOWED_WEBSITE_IDS = [2];

const ACCOUNT_SETTINGS: AccountSetting[] = [
    {
        key: 'account_settings',
        url: '/account-settings',
    },
    {
        key: 'purchases',
        url: '/account-settings/purchases',
        scope: 'buyer',
    },
    {
        key: 'listings',
        url: '/account-settings/listings',
        scope: 'seller',
    },
    {
        key: 'sales',
        url: '/account-settings/sales',
        scope: 'seller',
    },
    {
        key: 'addresses',
        url: '/account-settings/addresses',
    },
    {
        key: 'payment_account',
        url: '/account-settings/payment-accounts',
    },
    {
        key: 'api',
        url: '/account-settings/api',
    },
];

export default ACCOUNT_SETTINGS;
