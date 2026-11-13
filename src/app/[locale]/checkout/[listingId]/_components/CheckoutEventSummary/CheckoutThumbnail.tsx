import useFooterImages from '@/hooks/useFooterImages';

import FallbackImage from '@/components/FallbackImage';

import { useCheckoutData } from '../../_providers/CheckoutDataProvider';

export default function CheckoutThumbnail({
    sizes = '(min-width: 1024px) 425px, calc(100vw - 32px)',
}: {
    sizes?: string;
}) {
    const { data } = useCheckoutData();
    const { performerImage, performerFallbackImage, performerImagesMetadata } = data;

    useFooterImages({
        credits: (performerImagesMetadata || [])?.map((item) => ({
            imageCredits: item.credits,
            imageSource: item.source,
        })),
        useSimpleCredits: true,
        clearOnUnmount: true,
    });

    return (
        <FallbackImage
            src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/performers/${performerImage}`}
            fallbackImage={`${process.env.NEXT_PUBLIC_IMAGE_URL}/subtypes/${performerFallbackImage}`}
            alt="Artist"
            fill
            sizes={sizes}
            className="object-cover"
        />
    );
}
