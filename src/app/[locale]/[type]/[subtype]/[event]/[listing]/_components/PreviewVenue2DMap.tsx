import Image from 'next/image';
import { MapViewer } from '@3ddv/dvm';

import DefaultVenue from '@/assets/svg/DefaultVenue.svg';

import { useListing } from '@/providers/ListingProvider';

import { Spinner } from '@/components/ui/Spinner';

const PREVIEW_IMAGE_SIZES = '(min-width: 640px) 160px, calc(100vw - 24px)';

const CENTERED_CONTENT_CLASS = 'flex h-full flex-col items-center justify-center';

interface Props {
    mapViewer: MapViewer | null;
    thumbnailImgDigitalVenue?: HTMLImageElement;
}

function LoadingPreview() {
    return (
        <div className={CENTERED_CONTENT_CLASS}>
            <Spinner />
        </div>
    );
}

function DefaultVenuePreview() {
    return (
        <Image
            src={DefaultVenue}
            fill
            sizes={PREVIEW_IMAGE_SIZES}
            alt="Default Venue Map"
            className="object-contain aspect-auto p-2"
        />
    );
}

export default function PreviewVenue2DMap({ mapViewer = null, thumbnailImgDigitalVenue }: Props) {
    const { rawSvgContent, imageFromSvg, external_3ddv_id } = useListing();
    const { src, alt, lang } = thumbnailImgDigitalVenue || {};

    if (external_3ddv_id) {
        if (!mapViewer) {
            return <LoadingPreview />;
        }

        if (src && alt) {
            return (
                <Image
                    src={src}
                    alt={alt}
                    crossOrigin="use-credentials"
                    lang={lang}
                    className="object-cover"
                    fill
                    sizes={PREVIEW_IMAGE_SIZES}
                    unoptimized
                />
            );
        }
        return <DefaultVenuePreview />;
    }

    if (rawSvgContent && imageFromSvg) {
        return (
            <Image
                src={imageFromSvg}
                alt="SVG image"
                fill
                sizes={PREVIEW_IMAGE_SIZES}
                className="object-contain aspect-auto p-2"
            />
        );
    }

    return <DefaultVenuePreview />;
}
