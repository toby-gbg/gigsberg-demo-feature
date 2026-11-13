import { all } from 'better-all';

import { Type } from '@/interfaces/Subtype';
import { headingMapper } from '@/utils/mappers/seo/heading.mapper';
import { getCurrencyFromCookies } from '@/services/server/currencies';
import { seoApi } from '@/services/server/seo';
import { typeApi } from '@/services/server/type';

import TypePageSlider from './_components/TypePageSlider';

export default async function TypeSliderRoute({ params }: PageProps<'/[locale]/[type]'>) {
    const { slides, seoData, currencyCode } = await all({
        async params() {
            return params;
        },
        async currencyCode() {
            return getCurrencyFromCookies();
        },
        async slides() {
            const { type } = await this.$.params;
            return typeApi.getSlides({ type });
        },
        async seoData() {
            const { type } = await this.$.params;
            return seoApi.getSeoMetadata({ params: { type } });
        },
    });

    const headingsData = seoData ? headingMapper(seoData) : null;

    return (
        <TypePageSlider
            h1={headingsData?.h1}
            type={headingsData?.entity as Type}
            slides={slides}
            currencyCode={currencyCode}
        />
    );
}
