'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';

import City from '@/interfaces/City';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import defaultPopularCities from '@/constants/popular-cities';

import { CarouselItem } from '@/components/carousel/CarouselItem';
import { CarouselSection } from '@/components/carousel/CarouselSection';
import EventCard from '@/components/event-card/EventCard';
import Link from '@/components/Link';
import SubTitle from '@/components/SubTitle';

interface HomePopularCitiesProps {
    popularCities: City[];
    heading?: string;
}

const HomePopularCitiesView = ({ popularCities, heading }: HomePopularCitiesProps) => {
    const t = useTranslations();

    const cities = (popularCities?.length ?? 0) > 0 ? popularCities : defaultPopularCities;

    const handleClickArrow = useCallback((arrow: 'prev' | 'next') => {
        GoogleAnalyticsTracker.triggerCarouselArrowClick({
            arrow,
            list_type: 'city_list',
        });
    }, []);

    return (
        <div className="mb-10">
            <SubTitle title={heading || t('explore_locations')} className="mb-5" />
            <CarouselSection
                onArrowClick={handleClickArrow}
                initSnapCount={cities?.length <= 5 ? 0 : 4}
            >
                {cities.map((city) => {
                    const { id, name, image, name_url } = city || {};
                    const imageSrc = `${process.env.NEXT_PUBLIC_IMAGE_URL}/cities/${image}`;
                    const href = `/cities/${name_url.toLocaleLowerCase()}`;

                    return (
                        <CarouselItem key={id}>
                            <Link
                                prefetch={false}
                                href={href}
                                scroll
                                className="flex flex-col flex-1 w-full"
                            >
                                <EventCard title={name} imageSrc={imageSrc} imageAlt={name} />
                            </Link>
                        </CarouselItem>
                    );
                })}
            </CarouselSection>
        </div>
    );
};

export default HomePopularCitiesView;
