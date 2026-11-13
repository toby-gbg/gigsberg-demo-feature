'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

import { CreativeNameEnum, CreativeSlotEnum } from '@/utils/GoogleEventMapper';
import { FrontSubtypeData } from '@/services/server/subtype';
import { useGetSubtypeEvents } from '@/swr/features/subtypes';
import { DEFAULT_HOME_LIMIT } from '@/constants/pagination';

import { CarouselItem } from '@/components/carousel/CarouselItem';
import { CarouselSection } from '@/components/carousel/CarouselSection';
import EventCardSkeleton from '@/components/event-card/EventCardSkeleton';
import EventCardsView from '@/components/event-card/EventCardsView';
import ImageTile from '@/components/ImageTile';
import SubTitle from '@/components/SubTitle';

interface Props {
    subTypeData?: FrontSubtypeData | null;
}
const Suggestion = ({ subTypeData }: Props) => {
    const t = useTranslations();

    const { events, tours = [], entity } = subTypeData ?? {};
    const entityIsType = entity?.type === 'type';

    const { isLoading, data: extraEvents } = useGetSubtypeEvents({
        ...(entityIsType ? { typeId: entity?.id } : { subtypeId: entity?.id }),
        excludeEventIds: (events?.items ?? []).map((event) => event?.id),
        nameUrl: subTypeData?.entity.name_url || '',
        skip: !events || !events.nextPage || events.items.length > 3,
    });

    const suggestionEvents = events ? [...events.items, ...extraEvents].slice(0, 4) : [];
    return (
        <>
            {entity && tours.length > 0 && (
                <div className="py-8 xl:py-12">
                    <SubTitle level="h2" title={t('explore_other_subtypes')} className="mb-6" />
                    <CarouselSection>
                        {tours.slice(0, DEFAULT_HOME_LIMIT).map((tour) => (
                            <CarouselItem key={tour.id}>
                                <Link href={tour.url ?? '/'}>
                                    <ImageTile
                                        content={tour.name}
                                        imageSrc={`${process.env.NEXT_PUBLIC_IMAGE_URL}/tours/${tour.image}`}
                                        fallbackType={tour.type_name ?? tour.type_name_url}
                                        imageAlt={tour.name}
                                    />
                                </Link>
                            </CarouselItem>
                        ))}
                    </CarouselSection>
                </div>
            )}
            {isLoading ? (
                <EventCardSkeleton className="mb-8 xl:mb-12" />
            ) : (
                suggestionEvents.length > 0 && (
                    <div className="py-8 xl:py-12">
                        <SubTitle level="h3" title={t('you_may_also_like')} className="mb-6" />

                        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                            <EventCardsView
                                events={suggestionEvents}
                                creativeName={CreativeNameEnum.MOST_WANTED_EVENTS}
                                creativeSlot={CreativeSlotEnum.CATEGORY_PAGE}
                            />
                        </div>
                    </div>
                )
            )}
        </>
    );
};

export default Suggestion;
