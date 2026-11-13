import { carouselApi, getMobileLcpImage } from '@/services/server/carousel';
import { getCurrencyFromCookies } from '@/services/server/currencies';

import HeroCarousel from '@/components/HeroCarousel';

export default async function HomeSliderSection() {
    const slides = await carouselApi.getHomeSlides();
    const currencyCode = await getCurrencyFromCookies();
    const mobileLcpImages = await Promise.all(slides.map(({ image }) => getMobileLcpImage(image)));

    return (
        <HeroCarousel
            initialSlides={slides}
            currencyCode={currencyCode}
            className="mb-10"
            mobileLcpImages={mobileLcpImages}
        />
    );
}
