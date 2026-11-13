'use client';

import Script from 'next/script';
import { useLocale, useTranslations } from 'next-intl';

import Country from '@/interfaces/Country';

interface Props {
    currencyCode?: string;
    currentCountry: Country;
}

const ThankYouMap = ({ currentCountry, currencyCode = 'USD' }: Props) => {
    const locale = useLocale();
    const t = useTranslations();

    return (
        <div>
            <p className="font-semibold">{t('find_your_way')}</p>
            <div
                id="kayak"
                data-affiliate-id="kan_317658_592850"
                data-language-code={locale}
                data-country-code={currentCountry?.code}
                data-currency-code={currencyCode}
                data-vertical="hotels"
                data-vertical-list="hotels"
                data-fill-trip-type="2"
                data-label=""
                data-disable-compare-to="true"
                data-auto-height="true"
                className="min-h-62.25"
            ></div>
            <Script src="https://www.kayak.com/search-widget/script/direct/kayak" />
        </div>
    );
};

export default ThankYouMap;
