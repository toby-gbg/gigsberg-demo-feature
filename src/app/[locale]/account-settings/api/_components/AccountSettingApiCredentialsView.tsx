'use client';

import { Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';

import User from '@/interfaces/User';

import AccountSettingsCard from '@/components/account-settings/AccountSettingsSection';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';

interface AccountSettingApiCredentialsViewProps {
    currentUser: User | null;
}

const AccountSettingApiCredentialsView = ({
    currentUser: user,
}: AccountSettingApiCredentialsViewProps) => {
    const t = useTranslations();

    const copyValue = async (value: string, notification: string) => {
        if (!value) return;

        await navigator.clipboard.writeText(value);

        toast.add({
            title: notification,
            type: 'success',
        });
    };

    return (
        <AccountSettingsCard title={t('api_credentials')}>
            <div className="col-span-12">
                <Label htmlFor="api-user-id" className="mb-1 block text-xs">
                    {t('user_id')}
                </Label>
                <Input
                    id="api-user-id"
                    type="number"
                    value={user?.id.toString() ?? ''}
                    placeholder={t('user_id')}
                    readOnly
                    disabled={!user}
                    className="h-12"
                    suffixIcon={
                        user ? (
                            <button
                                type="button"
                                onClick={() =>
                                    copyValue(
                                        user.id.toString(),
                                        t('copy_notification', { item: t('user_id') })
                                    )
                                }
                                aria-label={`Copy ${t('user_id')}`}
                            >
                                <Copy className="size-5" />
                            </button>
                        ) : (
                            <Spinner className="size-5" />
                        )
                    }
                    classNames={{ suffixIcon: 'pointer-events-auto' }}
                />
            </div>
            <div className="col-span-12">
                <Label htmlFor="api-secret-key" className="mb-1 block text-xs">
                    {t('secret_key')}
                </Label>
                <Input
                    id="api-secret-key"
                    value={user?.api_secret_key ?? ''}
                    placeholder={t('secret_key')}
                    readOnly
                    disabled={!user?.api_secret_key}
                    className="h-12"
                    suffixIcon={
                        user ? (
                            <button
                                type="button"
                                onClick={() =>
                                    copyValue(
                                        user.api_secret_key,
                                        t('copy_notification', { item: t('secret_key') })
                                    )
                                }
                                disabled={!user.api_secret_key}
                                aria-label={`Copy ${t('secret_key')}`}
                            >
                                <Copy className="size-5" />
                            </button>
                        ) : (
                            <Spinner className="size-5" />
                        )
                    }
                    classNames={{ suffixIcon: 'pointer-events-auto' }}
                />
            </div>
        </AccountSettingsCard>
    );
};

export default AccountSettingApiCredentialsView;
