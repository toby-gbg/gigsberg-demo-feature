import { Fragment, Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { EntityMetadataPerformer } from '@/interfaces/entity/EntityMetadata';
import PopularPerformer from '@/interfaces/Performer';
import { SeoHeadings } from '@/interfaces/SEO';
import { cn } from '@/lib/cn';
import { isUrl, removeTicketsSuffix } from '@/utils/common';
import { findAndApplyStringRule } from '@/utils/seo';
import { getTypeSubtypeTranslations } from '@/utils/translation/getTypeSubtypeTranslations';
import { entityApi } from '@/services/server/entity';

import EventShareButton from '@/components/EventShareButton';
import FallbackImage from '@/components/FallbackImage';
import ShareTo from '@/components/ShareTo';
import SubtypePopularPerformers from '@/components/SubtypePopularPerformers';

import { isEntityMetadata, isPerformerMetadata } from '../../../_utils';
import EventIntroText from './EventIntroText';
import PerformerMainTitle from './PerformerMainTitle';

type EntityMetadata = Awaited<ReturnType<typeof entityApi.getEntityMetadata>>;

export interface EventHeaderProps {
    type: string;
    subtype: string;
    currencyCode: string;
    entityMetadata: EntityMetadata;
    headings?: SeoHeadings | null;
    useBrandStyling?: boolean;
    subtypeDisplayRules?: Parameters<typeof findAndApplyStringRule>[1];
    sectionTitleFontClassName?: string;
    introText?: string | null;
}

const mapTourPerformers = (performers: EntityMetadataPerformer[]): PopularPerformer[] => {
    return performers.map((p) => {
        const fallbackUrl = `/${p.type_name_url}-tickets/${p.subtype_name_url}/${p.name_url}-tickets`;

        return {
            id: p.id,
            name: p.name,
            image: p.image,
            imageSource: p.image_source,
            imageCredits: p.image_credits,
            nameUrl: p.name_url,
            typeNameUrl: p.type_name_url,
            typeNameEs: p.type_name_es ?? p.type_name_url,
            subtypeNameUrl: p.subtype_name_url,
            subtypeNameEs: p.subtype_name_es ?? p.subtype_name_url,
            subtypeImage: p.subtype_image ?? undefined,
            url: p.url ?? fallbackUrl,
            urlEs: p.url_es ?? p.url ?? fallbackUrl,
            eventCount: p.eventCount,
            earliestEventDate: p.earliestEventDate,
            latestEventDate: p.latestEventDate,
            earliestEventIanaZone: p.earliestEventIanaZone,
            imagesMetadata: p.images_metadata,
        };
    });
};

const isDisplayImageOfficialSportTeam = ['fc-barcelona', 'atletico-madrid', 'rcd-espanyol'];

const renderImageSportTeam = (nameUrl: string) => {
    if (!nameUrl) return undefined;
    if (!isDisplayImageOfficialSportTeam.includes(nameUrl)) return undefined;

    switch (nameUrl) {
        case 'fc-barcelona':
            return 'fc_barcelona_2627.webp';
        case 'atletico-madrid':
            return 'atletico_madrid_2627.png';
        case 'rcd-espanyol':
            return 'espanyol_2627.webp';
        default:
            return undefined;
    }
};

const EventHeader = async ({
    type,
    subtype,
    currencyCode,
    entityMetadata,
    headings,
    useBrandStyling = false,
    subtypeDisplayRules = [],
    sectionTitleFontClassName = '',
    introText = '',
}: EventHeaderProps) => {
    if (!entityMetadata) {
        return (
            <div className="items-center gap-4 grid grid-cols-12">
                <div className="hidden md:block md:col-span-4 md:col-start-9">
                    <ShareTo />
                </div>
            </div>
        );
    }

    const t = await getTranslations();

    const isPerformer = isEntityMetadata(entityMetadata) && entityMetadata.type === 'performer';
    const isTour = isEntityMetadata(entityMetadata) && entityMetadata.type === 'tour';

    const titleBase = isPerformerMetadata(entityMetadata)
        ? entityMetadata.performerName
        : isEntityMetadata(entityMetadata)
          ? entityMetadata.entity.name
          : '';

    const ticketsLabel = t('event_page_h1_suffix', {
        type: removeTicketsSuffix(type),
        subtype: getTypeSubtypeTranslations(t, subtype, '', '', false),
    });

    const title = findAndApplyStringRule(
        headings?.h1 || `${titleBase} ${ticketsLabel}`,
        subtypeDisplayRules
    );

    const titleElement = (
        <div>
            <PerformerMainTitle
                title={title}
                useBrandStyling={useBrandStyling}
                sectionTitleFontClassName={sectionTitleFontClassName}
            />
            <EventIntroText initialText={introText ?? ''} currencyCode={currencyCode} />
        </div>
    );

    const tourPerformers = (() => {
        if (!isEntityMetadata(entityMetadata) || entityMetadata.type !== 'tour') return [];
        return mapTourPerformers(entityMetadata.performers ?? []);
    })();

    const image = isPerformerMetadata(entityMetadata)
        ? entityMetadata.performerImage
        : isEntityMetadata(entityMetadata)
          ? entityMetadata.entity.image
          : null;

    const subtypeImage = isPerformerMetadata(entityMetadata)
        ? entityMetadata.subtypeImage
        : isEntityMetadata(entityMetadata)
          ? entityMetadata.entity.subtypeImage
          : null;

    const imageFolder = isTour ? 'tours' : 'performers';

    const imageSrc = image
        ? isUrl(image)
            ? image
            : `${process.env.NEXT_PUBLIC_IMAGE_URL}/${imageFolder}/${image}`
        : subtypeImage && isUrl(subtypeImage)
          ? subtypeImage
          : `${process.env.NEXT_PUBLIC_IMAGE_URL}/subtypes/${subtypeImage}`;

    const imageOfficialAgencySrc = isEntityMetadata(entityMetadata)
        ? (entityMetadata.entity.imageOfficialAgency ?? undefined)
        : undefined;

    const fallbackImage = subtypeImage
        ? isUrl(subtypeImage)
            ? subtypeImage
            : `${process.env.NEXT_PUBLIC_IMAGE_URL}/subtypes/${subtypeImage}`
        : undefined;

    return (
        <Fragment>
            {isPerformer ? (
                <div className="flex flex-col">
                    <div className="flex justify-between items-center gap-4">
                        <div className="overflow-hidden">{titleElement}</div>

                        <div className="flex items-center gap-4 shrink-0">
                            {isDisplayImageOfficialSportTeam.includes(
                                entityMetadata.entity.nameUrl
                            ) && (
                                <FallbackImage
                                    src={`/official-agency/${renderImageSportTeam(entityMetadata.entity.nameUrl)}`}
                                    fallbackImage={fallbackImage}
                                    alt={`${entityMetadata.entity.nameUrl}-official-agency`}
                                    width={
                                        entityMetadata.entity.nameUrl === 'fc-barcelona' ? 150 : 70
                                    }
                                    height={70}
                                    className={cn(
                                        'hidden md:block rounded-lg object-contain',
                                        entityMetadata.entity.nameUrl === 'fc-barcelona'
                                            ? 'aspect-150/70'
                                            : 'aspect-square'
                                    )}
                                />
                            )}
                            <div className="hidden xl:block ml-auto">
                                <EventShareButton />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Need this div for css purposes
                <div>
                    <div className="flex items-center gap-4">
                        <div className="relative rounded-full min-w-16 h-16 overflow-hidden">
                            <FallbackImage
                                src={imageSrc}
                                fallbackImage={fallbackImage}
                                alt={titleBase}
                                fill
                                sizes="256px"
                                className="object-cover"
                            />
                        </div>
                        {titleElement}
                    </div>
                    <div className="hidden md:flex md:flex-row md:justify-start md:items-center md:gap-4 md:col-span-4">
                        {!isTour && (
                            <div className="relative rounded-full min-w-16 h-16 overflow-hidden">
                                <FallbackImage
                                    src={imageOfficialAgencySrc}
                                    fallbackImage={fallbackImage}
                                    alt={titleBase}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {tourPerformers.length > 0 && (
                <Suspense fallback={null}>
                    <SubtypePopularPerformers
                        tourId={entityMetadata?.entity.id}
                        performers={tourPerformers}
                        type={removeTicketsSuffix(type)}
                    />
                </Suspense>
            )}
        </Fragment>
    );
};

export default EventHeader;
