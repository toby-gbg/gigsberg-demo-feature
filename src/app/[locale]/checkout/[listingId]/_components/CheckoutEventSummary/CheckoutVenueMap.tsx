'use client';

import { useEffect, useMemo } from 'react';
import Image from 'next/image';
import parse from 'html-react-parser';

import DefaultVenue from '@/assets/svg/DefaultVenue.svg';
import { normalizeString } from '@/utils/common';
import { searchSvgBlock } from '@/utils/venue';
import { useGetVenueSvgMap } from '@/swr/features/venues';

import { Skeleton } from '@/components/ui/Skeleton';

import { useCheckoutData } from '../../_providers/CheckoutDataProvider';

export default function CheckoutVenueMap() {
    const { data, metadata } = useCheckoutData();

    const { svgFilePath, block, category, venueName } = data;

    const { data: svg, isLoading, error } = useGetVenueSvgMap(svgFilePath);

    const blocks = useMemo(
        () =>
            block
                ?.split(',')
                .map((b) => b.trim())
                .filter(Boolean) || [],
        [block]
    );

    const parsedSvg = useMemo(() => {
        if (!svg) return null;
        return parse(svg, {
            replace: (domNode) => {
                if (domNode.type === 'tag' && domNode.name === 'svg') {
                    domNode.attribs = {
                        ...domNode.attribs,
                        id: 'venue-container',
                        style: 'direction: ltr;',
                        class: 'w-full! h-40!',
                    };
                }

                return domNode;
            },
        });
    }, [svg]);

    // Search the category item in metadata by category name
    const categoryItem = useMemo(() => {
        if (!metadata || !metadata.categories || !category) return null;
        return metadata.categories.find(
            (cat) => normalizeString(cat.name) === normalizeString(category)
        );
    }, [metadata, category]);

    useEffect(() => {
        if (!parsedSvg) return;

        const container = document.querySelector('#venue-container') as SVGElement | null;

        if (!container) return;

        const textNodes = container.querySelectorAll<SVGTextElement>('tspan, text');

        // Check by block first
        if (blocks.length > 0) {
            for (const b of blocks) {
                const result = searchSvgBlock({
                    container,
                    textNodes,
                    rawKey: b,
                    rawCategory: category,
                    venueName,
                });
                if (result) {
                    result.classList.add('available');
                }
            }
        } else {
            // If block not found, check by category's blocks
            const categoryBlocks = categoryItem?.blocks || [];
            for (const b of categoryBlocks) {
                const result = searchSvgBlock({
                    container,
                    textNodes,
                    rawKey: String(b).trim(),
                    rawCategory: category,
                    venueName,
                });
                if (result) result.classList.add('available');
            }
        }
    }, [parsedSvg, blocks, category, categoryItem, venueName]);

    if (isLoading) return <Skeleton className="h-40 w-full" />;

    if (error || !svg) {
        return (
            <Image src={DefaultVenue} alt="Default Venue Map" className="mx-auto h-40! w-full!" />
        );
    }

    return parsedSvg;
}
