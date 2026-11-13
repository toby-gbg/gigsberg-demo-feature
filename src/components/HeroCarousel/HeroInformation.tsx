import { DateTime } from 'luxon';
import { useLocale, useTranslations } from 'next-intl';

import HpSlide from '@/interfaces/HpSlide';
import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';
import { formatPrice } from '@/utils/currency.util';

import useFont from '@/hooks/useFont';

const formatDate = (date: string, localeCode: string) => {
    if (!date) return '---';

    const parsedDate = DateTime.fromISO(date);

    if (!parsedDate.isValid) return '---';

    return parsedDate.setLocale(localeCode).toLocaleString({
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

export default function HeroInformation({
    translationKey,
    text,
    event_date,
    venue_name,
    city_name,
    lowest_price,
    lowest_price_currency,
    has_tickets,
}: HpSlide) {
    const t = useTranslations();
    const locale = useLocale();
    const { sectionTitleFont } = useFont();
    const venueLocation = [venue_name, city_name].filter(Boolean).join(', ');
    const price =
        lowest_price && lowest_price_currency && has_tickets
            ? fallbackTranslation(
                  t('hero_from_money', {
                      money: formatPrice(lowest_price, locale, lowest_price_currency),
                  }),
                  'hero_from_money',
                  `from ${formatPrice(lowest_price, locale, lowest_price_currency)}`
              )
            : '';
    const metadataText = [event_date ? formatDate(event_date, locale) : '', venueLocation, price]
        .filter(Boolean)
        .join(' · ');

    return (
        <div className="space-y-2 w-full">
            <h2 className={`text-4xl font-bold md:text-6xl ${sectionTitleFont.className}`}>
                {translationKey ? t(translationKey) : text}
            </h2>
            <p className={cn('text-sm text-white xl:text-lg', sectionTitleFont.className)}>
                <span className="capitalize">{metadataText}</span>
            </p>
        </div>
    );
}
