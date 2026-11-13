import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { useDigitalVenue } from '@/providers/DigitalVenueProvider';
import { useGetThumbnail } from '@/hooks/digital-venue/useGetThumbnail';

interface Props {
    openViewer3dModal: () => void;
}

export const DigitalVenueViewThumbnail3D = ({ openViewer3dModal }: Props) => {
    const t = useTranslations();
    const { viewId, mapViewer, venueId } = useDigitalVenue();
    const { thumbnailImg, thumbnailInfo } = useGetThumbnail({ mapViewer, viewId, venueId });
    const hasViewThumbnail = !!viewId && !!thumbnailImg;

    return (
        <div className="top-4 md:top-2 left-4 md:left-2 absolute">
            <div className="flex flex-col justify-center items-center space-y-1 w-full">
                {hasViewThumbnail ? (
                    <Image
                        src={thumbnailImg.src}
                        alt={thumbnailImg.alt || ''}
                        crossOrigin={thumbnailInfo ?? 'use-credentials'}
                        lang={thumbnailImg.lang || undefined}
                        onClick={openViewer3dModal}
                        className="rounded-[0.25rem] w-[80px] md:w-[150px] h-[60px] md:h-[100px] object-cover cursor-pointer"
                        width={150}
                        height={100}
                        sizes="(min-width: 768px) 150px, 80px"
                        // 3D Digital Venue thumbnails can return 403 through Next's image optimizer.
                        // 3D Digital Venue may block requests from the optimizer server, due to missing headers/cookies/credentials, or because of signed/resource policies that prevent proxy fetching),
                        // Therefore, load the source URL directly.
                        unoptimized
                    />
                ) : null}

                <div className="text-[10px] text-primary md:text-xs text-center leading-[14px]">
                    {hasViewThumbnail ? (
                        <div className="hidden lg:block max-w-[70px] md:max-w-[150px] font-bold">
                            {t.rich('click_to_view_3d_map', {
                                strong: (chunks) => <span className="font-bold">{chunks}</span>,
                            })}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};
