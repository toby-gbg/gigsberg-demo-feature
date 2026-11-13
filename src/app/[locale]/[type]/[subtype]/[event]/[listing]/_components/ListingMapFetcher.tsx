import Image from 'next/image';

import DefaultVenue from '@/assets/svg/DefaultVenue.svg';
import { ListingMetadata } from '@/interfaces/Listing';
import { processMap } from '@/utils/venue-map';

import ListingMap from './ListingMap';

interface Props {
    currencyCode: string;
    metadata: ListingMetadata;
    rawSvg: string | undefined;
    type: string;
    subtype: string;
}

export default function ListingMapFetcher({
    currencyCode,
    metadata,
    rawSvg = undefined,
    type,
    subtype,
}: Props) {
    const svgContent = processMap(rawSvg, metadata, type, subtype);

    if (!svgContent) {
        return (
            <Image
                src={DefaultVenue}
                alt="Default Venue Map"
                className="mx-auto py-4 w-full! h-62.5! lg:h-[calc(100vh-328px)]!"
            />
        );
    }

    return <ListingMap key={currencyCode} svgContent={svgContent} type={type} subtype={subtype} />;
}
