'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { useLocale, useTranslations } from 'next-intl';

import { fallbackTranslation, isRTL } from '@/utils/common';

import { useSlide } from '@/hooks/useSlide';

import StarRating from '@/components/StarRating';
import { Separator } from '@/components/ui/Separator';

const REVIEW_DATA = {
    count: '14,918',
    rating: 4.6,
    reviews: [
        {
            name: 'Toscu O.',
            rating: 5,
            comment: 'Best shopping experience ever',
        },
        {
            name: 'Marco G.',
            rating: 5,
            comment: 'ok, tutto seguito con attenzione e ricevuto regolarmente',
        },
        {
            name: 'Paige N.',
            rating: 5,
            comment:
                'Best website going on for tickets, brought in January and received end of February so I was pretty shocked to see how fast everything turned out :) will be using them again',
        },
        {
            name: 'Poppy',
            rating: 5,
            comment:
                'Customer service are very easy to contact and as soon as I had placed my order I received a call the following day to confirm my purchase.',
        },
        {
            name: 'James B.',
            rating: 4,
            comment:
                'All good in the end their was a problem on the debit card i used initially but changed card and it went through.',
        },
        {
            name: 'Alexandros S.',
            rating: 4,
            comment:
                'well this was my first time using a secondary site to get tickets and i booked them a year before the event to make sure id get them. Im still a little anxious to see how it all plays out but so far so good. If this works in the end ill be using ur site again for sure',
        },
        {
            name: 'Agata B.',
            rating: 5,
            comment:
                'Super good customer service, answering immediately a live agent who is gonna make you feel secure with the use of their service :)',
        },
        {
            name: 'Brian M.',
            rating: 5,
            comment:
                'We ordered two tickets to the Robbie Williams Concert back in July. Traveling from Toronto to Budapest for the concert we were very happy when we entered the MVM Dome without any problems. Thanks Gigsberg. The Concert was amazing!',
        },
        {
            name: 'ALVARO A.',
            rating: 4,
            comment: 'Tout parfait !',
        },
    ],
};

function getRandomItems<T>(items: T[], count: number): T[] {
    return items.sort(() => Math.random() - 0.5).slice(0, count);
}

const HomeReviewsSection = () => {
    const pathname = usePathname();
    const t = useTranslations();
    const locale = useLocale();
    const [reviews, setReviews] = useState(() => REVIEW_DATA.reviews.slice(0, 3));

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            align: 'start',
            direction: isRTL(locale) ? 'rtl' : 'ltr',
            watchDrag: (emblaApi) => emblaApi.scrollSnapList().length > 1,
        },
        [Autoplay({ delay: 3000 })]
    );

    const { selectedIndex, scrollSnaps, onDotClick } = useSlide(emblaApi);

    useEffect(() => {
        setReviews(getRandomItems(REVIEW_DATA.reviews, 3));
    }, [pathname]);

    return (
        <div className="space-y-3 bg-gradient px-4 lg:px-8 pt-12 pb-4 rounded-2xl">
            <div className="relative pb-8 overflow-hidden" ref={emblaRef}>
                <div className="flex -ml-5">
                    {reviews.map((review, index) => (
                        <div
                            key={index}
                            className="relative flex-[0_0_100%] md:flex-[0_0_50%] xl:flex-[0_0_33.333%] pl-5 min-w-0 min-h-60"
                        >
                            <div className="flex flex-col justify-between gap-2 bg-white shadow-lg p-6 rounded-2xl h-full">
                                <div>
                                    <StarRating count={review.rating} />
                                    <p className="mt-2 text-gray-700 text-sm">{review.comment}</p>
                                </div>

                                <Separator className="bg-gray-200 mt-auto w-full h-px" />

                                <div className="md:flex items-center w-full">
                                    <h3 className="font-semibold text-lg">{review.name}</h3>
                                    <div className="flex justify-end md:justify-normal items-center gap-2 ms-auto text-gray-500 text-sm">
                                        {fallbackTranslation(
                                            t('verified_by'),
                                            'verified_by',
                                            'Verified by'
                                        )}
                                        <Image
                                            alt="Logo of Shopper Approved"
                                            src="/logo/shopper_approved.avif"
                                            width={120}
                                            height={20}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:hidden bottom-2 left-1/2 absolute flex items-center -translate-x-1/2">
                    {scrollSnaps.map((_, index) => (
                        <button
                            key={index}
                            data-active={index === selectedIndex}
                            className="bg-gray-200 data-[active=true]:bg-main-end mx-1 rounded-full size-2 transition-colors"
                            onClick={() => onDotClick(index)}
                        ></button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeReviewsSection;
