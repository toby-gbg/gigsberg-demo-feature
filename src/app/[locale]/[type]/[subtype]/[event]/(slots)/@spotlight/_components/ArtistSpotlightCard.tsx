import { FC } from 'react';

import EntityMetadata from '@/interfaces/entity/EntityMetadata';
import { isUrl } from '@/utils/common';

import EventShareButton from '@/components/EventShareButton';
import FallbackImage from '@/components/FallbackImage';

import { isEntityMetadata, isPerformerMetadata } from '../../../_utils';
import SpotifyArtistPreview from './SpotifyArtistPreview';
import SpotifySkeleton from './SpotifySkeleton';

interface ArtistSpotlightCardProps {
    entityMetadata: EntityMetadata | null;
}

const baseImageURL = process.env.NEXT_PUBLIC_IMAGE_URL || '';
const getImageUrl = (img: string | null | undefined, folder: string): string | undefined => {
    if (!img) return undefined;
    return isUrl(img) ? img : `${baseImageURL}/${folder}/${img}`;
};

const ArtistSpotlightCard: FC<ArtistSpotlightCardProps> = ({ entityMetadata }) => {
    const performerMetadataChecked = isPerformerMetadata(entityMetadata);
    const entityMetadataChecked = isEntityMetadata(entityMetadata);

    const image = performerMetadataChecked
        ? entityMetadata.performerImage
        : entityMetadataChecked
          ? entityMetadata.entity.image
          : null;

    const subtypeImage = performerMetadataChecked
        ? entityMetadata.subtypeImage
        : entityMetadataChecked
          ? entityMetadata.entity.subtypeImage
          : null;

    const isTour = entityMetadataChecked && entityMetadata.type === 'tour';
    const imageFolder = isTour ? 'tours' : 'performers';

    const imageSrc = getImageUrl(image, imageFolder) ?? getImageUrl(subtypeImage, 'subtypes');
    const fallbackImage = getImageUrl(subtypeImage, 'subtypes');

    return (
        <div className="static w-full h-70.5 xl:h-113 max-h-[calc(100dvh-32px)]">
            <div className="relative rounded-xl w-full h-full overflow-hidden">
                <div className="xl:hidden top-3 right-3 z-1 absolute">
                    <EventShareButton />
                </div>
                <div className="top-1/2 left-1/2 absolute w-full h-full -translate-x-1/2 -translate-y-1/2">
                    <FallbackImage
                        preload
                        width={452}
                        height={452}
                        className="w-full h-full object-[center_30%] object-cover"
                        src={imageSrc}
                        fallbackImage={fallbackImage}
                        alt="Event image"
                        fallbackLogo={false}
                        fetchPriority="high"
                        loading="eager"
                        sizes="(min-width: 1280px) 452px, 400px"
                    />
                </div>
                <div className="flex flex-col-reverse justify-between p-3 xl:p-4 w-full h-full">
                    <div className="z-1 flex flex-col gap-2">
                        <div className="w-fit overflow-hidden">
                            <p className="font-medium text-[20px] text-white lg:text-[24px] line-clamp-2 leading-7 lg:leading-8">
                                {entityMetadata?.entity?.name}
                            </p>
                        </div>
                        {entityMetadata?.entity?.spotifyId && (
                            <div className="flex flex-col justify-end rounded-xl overflow-hidden [--spotify-height:80px]">
                                <SpotifyArtistPreview
                                    height="var(--spotify-height)"
                                    className="h-(--spotify-height)"
                                    shouldUseTheme={false}
                                    spotifyId={entityMetadata?.entity?.spotifyId || ''}
                                    skeletonComponent={
                                        <SpotifySkeleton overlayClassName="opacity-10" />
                                    }
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="bottom-0 left-0 absolute bg-[linear-gradient(180deg,rgba(34,34,34,0)_27.93%,rgba(35,35,35,0.8)_61.37%,#202020_99.88%)] shadow-[0px_60px_100px_0px_#48484829] w-full h-[calc(80%)] xl:h-[calc(55%)] pointer-events-none select-none" />
            </div>
        </div>
    );
};

export default ArtistSpotlightCard;
