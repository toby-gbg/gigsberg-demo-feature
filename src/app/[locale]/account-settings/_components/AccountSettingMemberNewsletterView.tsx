'use client';

import { Loader } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useUpdateUserMutation } from '@/swr/features/user';

import { useUser } from '@/providers/UserProvider';

import AccountSettingsCard from '@/components/account-settings/AccountSettingsSection';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import { toast } from '@/components/ui/Toast';

const AccountSettingMemberNewsletterView = () => {
    const user = useUser();

    const t = useTranslations();
    const { trigger: updateUser, isMutating } = useUpdateUserMutation({
        onSuccess: () => toast.add({ title: t('done'), type: 'success' }),
        onError: (error) => toast.add({ title: t(error.data.errorKey), type: 'error' }),
    });

    const onSubmit = (is_update_news: boolean) => {
        return updateUser({ is_update_news });
    };

    return (
        <AccountSettingsCard title={t('members_newsletter')} asForm>
            <div className="col-span-12 flex flex-wrap items-center">
                <Checkbox
                    id="news"
                    defaultChecked={Boolean(user?.is_update_news)}
                    disabled={isMutating}
                    onCheckedChange={onSubmit}
                    className="ltr:mr-2 rtl:ml-2"
                />
                <Label htmlFor="news" className="text-xs opacity-70">
                    {t('update_latest_news')}
                </Label>
                {isMutating ? <Loader className="animate-spin ms-2" /> : null}
            </div>
        </AccountSettingsCard>
    );
};

export default AccountSettingMemberNewsletterView;
