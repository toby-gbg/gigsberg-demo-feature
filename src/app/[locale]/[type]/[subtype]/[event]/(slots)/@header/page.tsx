import { WebsiteFonts } from '@/interfaces/Website';
import Headers from '@/lib/headers';
import getFonts from '@/utils/getFonts';
import { headingMapper } from '@/utils/mappers/seo/heading.mapper';
import { getCurrencyFromCookies } from '@/services/server/currencies';
import { entityApi } from '@/services/server/entity';
import { seoApi } from '@/services/server/seo';
import { websiteApi } from '@/services/server/website';

import EventHeader from './_components/EventHeader';

export default async function EventHeaderSlot({
    params,
}: PageProps<'/[locale]/[type]/[subtype]/[event]'>) {
    const { type, subtype, event } = await params;

    const [entityMetadata, seoMetadata, website, domainInfo, currencyCode] = await Promise.all([
        entityApi.getEntityMetadata({
            url: event,
            type,
            subtype,

            debug: { callPoint: '@header slot' },
        }),
        seoApi.getSeoMetadata({
            params: { type, subtype, event },
            debug: { callPoint: '@header slot' },
        }),
        websiteApi.getWebsite(),
        Headers.getDomainInfo(),
        getCurrencyFromCookies(),
    ]);

    const useBrandStyling = domainInfo?.config?.features?.useBrandStyling || false;
    const { subtypeDisplayRules = [] } = domainInfo.config.seo || {};
    const sectionTitleFontClassName = getFonts(
        website?.section_title_font || WebsiteFonts.Poppins
    ).className;

    return (
        <EventHeader
            type={type}
            subtype={subtype}
            currencyCode={currencyCode}
            entityMetadata={entityMetadata}
            headings={seoMetadata ? headingMapper(seoMetadata) : null}
            useBrandStyling={useBrandStyling}
            subtypeDisplayRules={subtypeDisplayRules}
            sectionTitleFontClassName={sectionTitleFontClassName}
            introText={seoMetadata?.seo_item.intro_text}
        />
    );
}
