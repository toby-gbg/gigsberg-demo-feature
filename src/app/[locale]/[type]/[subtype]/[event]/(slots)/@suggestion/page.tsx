import { getTranslations } from 'next-intl/server';

import { fallbackTranslation, generateBreadcrumbs } from '@/utils/common';
import { entityApi } from '@/services/server/entity';
import { ipApi } from '@/services/server/ip';
import { performerApi } from '@/services/server/performers';

import Link from '@/components/Link';
import SubTitle from '@/components/SubTitle';

import { MAX_PERFORMER_CARDS } from '../../_constants';
import PerformerSuggestion from './_components/PerformerSuggestion';

export default async function EventSuggestionSlot({
    params,
}: PageProps<'/[locale]/[type]/[subtype]/[event]'>) {
    const { type, subtype, event } = await params;
    const entityMetadata = await entityApi.getEntityMetadata({
        url: event,
        type,
        subtype,

        debug: { callPoint: '@suggestion slot' },
    });

    if (entityMetadata?.type !== 'performer') return null;

    const [fansAlsoLikeData, t] = await Promise.all([
        performerApi.getFansAlsoLike({
            performerId: entityMetadata.entity.id,
            limit: MAX_PERFORMER_CARDS,
        }),
        getTranslations(),
    ]);

    const breadcrumbs = generateBreadcrumbs(t, { type, subtype });
    const viewMoreUrl = breadcrumbs[breadcrumbs.length - 1]?.href;

    if (!fansAlsoLikeData.recommendations?.length) return null;

    const ipCountry = await ipApi.getCountryIp();

    return (
        <div className="space-y-4 md:space-y-5 lg:col-span-12 mt-12">
            <div className="flex justify-between items-center gap-2">
                <SubTitle
                    title={fallbackTranslation(
                        t('fans_also_like'),
                        'fans_also_like',
                        'Fans also like'
                    )}
                />
                {viewMoreUrl && (
                    <Link
                        href={viewMoreUrl}
                        className="px-4 py-2 font-medium text-black hover:underline"
                    >
                        {`${fallbackTranslation(t('view_more'), 'view_more', 'View more')} >>`}
                    </Link>
                )}
            </div>

            <PerformerSuggestion ipCountry={ipCountry} fansAlsoLikeData={fansAlsoLikeData} />
        </div>
    );
}
