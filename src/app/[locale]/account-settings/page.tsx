'use server';

import { Fragment } from 'react';

import AccountSettingChangePasswordView from './_components/AccountSettingChangePasswordView';
import AccountSettingDeleteAccountView from './_components/AccountSettingDeleteAccountView';
import AccountSettingMemberNewsletterView from './_components/AccountSettingMemberNewsletterView';
import AccountSettingPersonalDetailsView from './_components/AccountSettingPersonalDetailsView';
import AccountSettingSellerInfoView from './_components/AccountSettingSellerInfoView';

const AccountSettingsPage = async () => {
    return (
        <Fragment>
            <AccountSettingPersonalDetailsView />
            <AccountSettingChangePasswordView />
            <AccountSettingMemberNewsletterView />
            <AccountSettingSellerInfoView />
            <AccountSettingDeleteAccountView />
        </Fragment>
    );
};

export default AccountSettingsPage;
