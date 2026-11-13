import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffectOnce } from 'react-use';

import { VENUE_TOOLTIP_PREVIEW_EVENT } from '@/utils/venueTooltip';

import { Spinner } from '@/components/ui/Spinner';

type ImageStatus = 'error' | 'loaded' | 'loading';

function VenuePreviewImage({ src }: { src: string }) {
    const [status, setStatus] = useState<ImageStatus>('loading');

    if (status === 'error') return null;

    return (
        <div className="relative hidden overflow-hidden rounded bg-black md:block">
            {status === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <Spinner className="text-white" />
                </div>
            )}
            <Image
                src={src}
                alt="block view"
                width={285}
                height={160}
                className={`object-cover transition-opacity ${status === 'loading' ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setStatus('loaded')}
                onError={() => setStatus('error')}
                unoptimized
            />
        </div>
    );
}

export default function ListingMapTooltip() {
    const t = useTranslations();

    const [previewData, setPreviewData] = useState<string | null>();

    useEffectOnce(() => {
        const updatePreview = (event: Event) => {
            const previewImage = (event as CustomEvent<{ imageMapUrl: string | null }>).detail
                .imageMapUrl;
            setPreviewData(previewImage);
        };

        window.addEventListener(VENUE_TOOLTIP_PREVIEW_EVENT, updatePreview);

        return () => {
            window.removeEventListener(VENUE_TOOLTIP_PREVIEW_EVENT, updatePreview);
        };
    });

    return (
        <div
            id="venue-map-tooltip"
            className="pointer-events-none fixed z-1001 hidden min-w-28 overflow-hidden rounded-lg bg-black text-sm text-white shadow-lg"
        >
            {previewData && <VenuePreviewImage key={previewData} src={previewData} />}
            <div className="p-2">
                <div data-venue-tooltip-block-price-section>
                    <p className="font-semibold">
                        {t('block')}: <span data-venue-tooltip-block />
                    </p>
                    <div data-venue-tooltip-price-block>
                        <p>
                            {t('price')}: <span data-venue-tooltip-price />
                        </p>
                    </div>
                    <div className="my-2 h-px w-full bg-white" data-venue-tooltip-divider />
                </div>
                <p className="font-semibold" data-venue-tooltip-category-block>
                    {t('category')}: <span data-venue-tooltip-category />
                </p>
                <p data-venue-tooltip-min-price-block>
                    From: <span data-venue-tooltip-min-price />
                </p>
            </div>
        </div>
    );
}
