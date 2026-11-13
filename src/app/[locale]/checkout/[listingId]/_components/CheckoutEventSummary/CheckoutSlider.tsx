import useEmblaCarousel from 'embla-carousel-react';
import { useLocale } from 'next-intl';

import { isRTL } from '@/utils/common';

import { useSlide } from '@/hooks/useSlide';

import { useCheckoutData } from '../../_providers/CheckoutDataProvider';
import CheckoutDigitalVenueMap from './CheckoutDigitalVenueMap';
import CheckoutThumbnail from './CheckoutThumbnail';
import CheckoutVenueMap from './CheckoutVenueMap';

export default function CheckoutSlider() {
    const locale = useLocale();
    const [emblaRef, emblaApi] = useEmblaCarousel({ direction: isRTL(locale) ? 'rtl' : 'ltr' }, []);
    const { selectedIndex, scrollSnaps, onDotClick } = useSlide(emblaApi);

    const { external_3ddv_id } = useCheckoutData();

    return (
        <div className="overflow-hidden relative max-h-40" ref={emblaRef}>
            <div className="flex">
                {/* Svg map */}
                <div className="bg-gray-200 border-b w-full shrink-0">
                    {external_3ddv_id ? (
                        <CheckoutDigitalVenueMap
                            external_3ddv_id={external_3ddv_id}
                            mapContainerId={`map_viewer_${external_3ddv_id}`}
                        />
                    ) : (
                        <CheckoutVenueMap />
                    )}
                </div>

                {/* Performer Image */}
                <div className="h-40 w-full shrink-0 relative">
                    <CheckoutThumbnail />
                </div>
            </div>

            <div className="absolute -translate-x-1/2 left-1/2 bottom-4 flex items-center">
                {scrollSnaps.map((_, index) => (
                    <button
                        key={index}
                        data-active={index === selectedIndex}
                        className="size-2 bg-white rounded-full opacity-20 mx-1 data-[active=true]:opacity-100 transition-opacity"
                        onClick={() => onDotClick(index)}
                    ></button>
                ))}
            </div>
        </div>
    );
}
