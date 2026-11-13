'use client';

import { useEffect, useState } from 'react';
import Image, { getImageProps } from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import useEmblaCarousel from 'embla-carousel-react';
import { useLocale } from 'next-intl';
import { useUpdateEffect } from 'react-use';

import HpSlide from '@/interfaces/HpSlide';
import { cn } from '@/lib/cn';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { isRTL, windowIdleCallback } from '@/utils/common';
import { useLazyGetSlidesQuery } from '@/swr/features/carousel';

import { useUser } from '@/providers/UserProvider';
import useFooterImages from '@/hooks/useFooterImages';
import { useSlide } from '@/hooks/useSlide';

import MainContainer from '@/components/MainContainer';

import SlideSkeleton from '../skeleton/SlideSkeleton';
import HeroCta from './HeroCta';
import HeroInformation from './HeroInformation';

interface Props {
    initialSlides: HpSlide[];
    currencyCode: string;
    type?: string;
    className?: string;
    mobileLcpImages?: (string | null)[];
}

export default function HeroCarousel({
    initialSlides,
    currencyCode,
    type,
    className,
    mobileLcpImages,
}: Props) {
    const locale = useLocale();
    const userId = useUser()?.id ?? -1;
    const [slides, setSlides] = useState(initialSlides);
    const { trigger: fetchSlides } = useLazyGetSlidesQuery();

    // Keep server data in sync after navigation or a currency change.
    useUpdateEffect(() => {
        setSlides(initialSlides);
    }, [initialSlides]);

    // Match the performer page: refetch prices when the user's VAT context changes.
    useUpdateEffect(() => {
        fetchSlides({ type, currencyCode })
            .then((data) => {
                setSlides(data);
            })
            .catch((error) => console.error('Error fetching slides:', error));
    }, [userId, currencyCode, type]);

    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, direction: isRTL(locale) ? 'rtl' : 'ltr' },
        [Fade(), Autoplay({ delay: 5000, stopOnInteraction: false, playOnInit: false })]
    );

    const { selectedIndex, scrollSnaps, onDotClick } = useSlide(emblaApi);

    useFooterImages({ slides });

    useEffect(() => {
        if (!emblaApi) return;
        return windowIdleCallback(() => emblaApi.plugins().autoplay?.play());
    }, [emblaApi]);

    useUpdateEffect(() => {
        if (!emblaApi) return;

        const selectedSlide = slides[selectedIndex];
        if (!selectedSlide) return;

        GoogleAnalyticsTracker.triggerEvent('hero_slide_view', {
            slide_id: selectedSlide.id,
            slide_position: selectedIndex + 1,
            event_id: selectedSlide.eventId,
            performer_id: selectedSlide.performerId,
        });
    }, [emblaApi, selectedIndex]);

    if (slides.length === 0) {
        return <SlideSkeleton className={className} />;
    }

    return (
        <div className={cn('relative overflow-hidden', className)} ref={emblaRef}>
            <div className="flex">
                {slides.map((slide, index) => {
                    const isLCP = index === 0;

                    return (
                        <div
                            key={slide.id}
                            className="relative flex items-center w-full h-120 md:h-150 text-white shrink-0"
                        >
                            {mobileLcpImages?.[index] ? (
                                <picture>
                                    <source
                                        media="(min-width: 768px)"
                                        sizes="100vw"
                                        srcSet={
                                            getImageProps({
                                                src: `${process.env.NEXT_PUBLIC_IMAGE_URL}/hp_slides/${slide.image}`,
                                                alt: slide.text,
                                                fill: true,
                                                sizes: '100vw',
                                            }).props.srcSet
                                        }
                                    />
                                    <img
                                        src={mobileLcpImages[index]!}
                                        alt={slide.text}
                                        loading={isLCP ? 'eager' : 'lazy'}
                                        fetchPriority={isLCP ? 'high' : 'low'}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        style={{ objectPosition: '80% center' }}
                                        onError={(event) => {
                                            event.currentTarget.onerror = null;
                                            event.currentTarget.src = `${process.env.NEXT_PUBLIC_IMAGE_URL}/hp_slides/${slide.image}`;
                                        }}
                                    />
                                </picture>
                            ) : (
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/hp_slides/${slide.image}`}
                                    alt={slide.text}
                                    fill
                                    priority={isLCP}
                                    style={{
                                        objectFit: 'cover',
                                        objectPosition: '80% center',
                                    }}
                                    sizes="100vw"
                                    loading={isLCP ? 'eager' : 'lazy'}
                                    fetchPriority={isLCP ? 'high' : 'low'}
                                />
                            )}
                            <div
                                aria-hidden
                                className={cn(
                                    'absolute inset-0 pointer-events-none',
                                    isRTL(locale)
                                        ? 'bg-[linear-gradient(to_left,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.35)_55%,transparent_95%)]'
                                        : 'bg-[linear-gradient(to_right,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.35)_55%,transparent_95%)]'
                                )}
                            />
                            <MainContainer className="z-10 relative space-y-10 py-0 w-full">
                                <HeroInformation {...slide} />
                                <HeroCta slide={slide} slidePosition={index + 1} />
                            </MainContainer>
                        </div>
                    );
                })}
            </div>

            <div className="bottom-4 left-1/2 absolute flex items-center -translate-x-1/2">
                {scrollSnaps.map((_, index) => (
                    <button
                        aria-label={`Go to hero carousel slide ${index + 1}`}
                        key={index}
                        data-active={index === selectedIndex}
                        className="bg-white opacity-20 data-[active=true]:opacity-100 mx-1 rounded-full size-2 transition-opacity"
                        onClick={() => onDotClick(index)}
                    />
                ))}
            </div>
        </div>
    );
}
