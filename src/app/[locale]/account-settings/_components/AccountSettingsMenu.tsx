'use client';

import { usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import ACCOUNT_SETTINGS, { ALLOWED_WEBSITE_IDS } from '@/constants/routes/account-settings';

import { useSite } from '@/providers/SiteProvider';
import { useUser } from '@/providers/UserProvider';

import Link from '@/components/Link';

const AccountSettingsMenu = () => {
    const t = useTranslations();
    const pathname = usePathname();
    const domainInfo = useSite().domainInfo;

    const user = useUser();

    const sellerOfWebsites = user?.primary_seller_websites ?? [];

    const isPro = user?.is_pro;

    return (
        <div className="max-h-fit space-y-6 border border-gray-200 bg-white shadow-lg lg:col-span-3">
            <ul className="grid grid-cols-1 gap-2 p-2">
                {ACCOUNT_SETTINGS.map(({ key, url, scope }) => {
                    // Optout the summary path
                    if (
                        key === 'summary' &&
                        !sellerOfWebsites.some((item) => ALLOWED_WEBSITE_IDS.includes(item.id))
                    )
                        return null;

                    if (key === 'api' && !isPro) return null;

                    if (scope === 'seller' && domainInfo?.config.features?.disableTicketSelling) {
                        return null;
                    }

                    return (
                        <Link prefetch={false} key={key} href={url}>
                            <li
                                className={cn(
                                    'flex cursor-pointer items-center rounded-lg p-2 transition',
                                    {
                                        'bg-gradient text-on-main': pathname === url,
                                        'hover:text-primary': pathname !== url,
                                    }
                                )}
                            >
                                {t(key)}
                            </li>
                        </Link>
                    );
                })}
            </ul>
        </div>
    );
};

export default AccountSettingsMenu;
