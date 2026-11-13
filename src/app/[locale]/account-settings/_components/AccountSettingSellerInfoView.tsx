'use client';

import { Loader } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useUpdateUserMutation } from '@/swr/features/user';

import { useSite } from '@/providers/SiteProvider';
import { useUser } from '@/providers/UserProvider';

import AccountSettingsCard from '@/components/account-settings/AccountSettingsSection';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import { toast } from '@/components/ui/Toast';

const AccountSettingSellerInfoView = () => {
    const t = useTranslations();
    const { domainInfo } = useSite();

    const user = useUser();

    const { trigger: updateUser, isMutating: isLoading } = useUpdateUserMutation({
        onSuccess: () => toast.add({ title: t('done'), type: 'success' }),
        onError: (error) => toast.add({ title: t(error.data.errorKey), type: 'error' }),
    });

    const onSubmit = (is_uk_seller: boolean) => {
        return updateUser({ is_uk_seller });
    };

    if (domainInfo?.config.features?.disableTicketSelling) return null;

    return (
        <AccountSettingsCard title={t('seller_info')} asForm>
            <div className="col-span-12 flex flex-wrap">
                <Checkbox
                    id="uk-seller"
                    defaultChecked={Boolean(user?.is_uk_seller)}
                    disabled={isLoading}
                    onCheckedChange={onSubmit}
                    className="mt-1 ltr:mr-2 rtl:ml-2"
                />
                <Label htmlFor="uk-seller" className="text-xs opacity-70">
                    <p className="mb-1">{t('publish_on_gigsberg_uk')}</p>
                    <p>
                        <span className="me-1 text-red-500">*</span>
                        {t('exclude_gigsberg_uk_if_unchecked')}
                    </p>
                </Label>
                {isLoading ? <Loader className="animate-spin" /> : null}
            </div>
        </AccountSettingsCard>
    );
};

export default AccountSettingSellerInfoView;
