'use client';

import { useSearchParams } from 'next/navigation';
import { usePathname } from '@/i18n/routing';
import { DateTime } from 'luxon';
import { useLocale, useTranslations } from 'next-intl';

import { useSite } from '@/providers/SiteProvider';
import useCookie from '@/hooks/useCookie';

export default function HeaderTopBanner() {
    const locale = useLocale();
    const t = useTranslations();
    // Nano stores
    const domainInfo = useSite().domainInfo;
    const { config } = domainInfo ?? {};
    const { existsCookie } = useCookie('gc');
    const isAffiliate = Boolean(useSearchParams().get('aff'));

    const pathname = usePathname();
    const topBannerConfig = config?.features?.topBanner;
    const isHome = pathname === '/';
    const isCheckout = pathname.startsWith('/checkout/');

    const isNotShowTopBanner =
        !topBannerConfig?.enable || isAffiliate || existsCookie() || isHome || isCheckout;

    if (isNotShowTopBanner) return null;

    const validUntilDate = topBannerConfig.validUntil
        ? DateTime.fromISO(topBannerConfig.validUntil)
        : null;

    return (
        <div className="text-white p-4 text-center text-[14px] leading-[1.3] bg-linear-to-b from-[#8760f6] to-[#3e31fa]">
            <span>
                {t('get_discount_with_code', {
                    discount: topBannerConfig.discountPercentage ?? '10%',
                    code: topBannerConfig.discountCode ?? 'GIGSBERG',
                })}{' '}
                -{' '}
                {validUntilDate &&
                    t('valid_until', {
                        date: validUntilDate.setLocale(locale).toLocaleString(DateTime.DATE_FULL),
                    })}
            </span>
        </div>
    );
}
