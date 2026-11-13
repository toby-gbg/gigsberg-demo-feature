'use server';

import { AccountSettingsProvider } from '@/providers/AccountSettingsProvider';

import MainContainer from '@/components/MainContainer';

import AccountSettingsMenu from './_components/AccountSettingsMenu';

const AccountSettingsLayout = async ({ children }: LayoutProps<'/[locale]/account-settings'>) => {
    return (
        <AccountSettingsProvider>
            <MainContainer className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-12">
                <AccountSettingsMenu />
                <div className="flex flex-col gap-6 lg:col-span-9">{children}</div>
            </MainContainer>
        </AccountSettingsProvider>
    );
};

export default AccountSettingsLayout;
