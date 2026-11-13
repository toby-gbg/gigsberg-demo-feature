import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

import { ListingMetadata } from '@/interfaces/Listing';
import { EXCLUDE_SUBTYPE, EXCLUDE_TYPE } from '@/constants/venue-map';

import { modifyElementByBlock } from './modifyElement';
import { buildResolvedCategories } from './normalize';
import { buildSvgNodeTree, filterSvgBlocks, mergeMissingSvgBlocks } from './traverse';
import { getMissingBlocksAvailable, removeElements } from './utils';

export const processMap = (
    svgString: string | undefined,
    metadata: ListingMetadata,
    type: string,
    subtype: string
): string | undefined => {
    if (!svgString) return undefined;

    /* === Step 1: Initialize and sanitize SVG elements === */
    // Convert an SVG string into a DOM tree
    const document = new DOMParser().parseFromString(svgString, 'image/svg+xml');

    // Get the root element of the parsed document
    const svg = document.documentElement;

    // If document is not SVG => Throw Error
    if (!svg || svg.tagName !== 'svg') throw new Error('Invalid SVG');

    // Cleans the input SVG and adds the attributes needed for identifying
    removeElements(document, 'title');
    removeElements(document, 'desc');
    svg.setAttribute('id', 'venue-map-container');
    svg.setAttribute('style', 'direction: ltr;');
    svg.setAttribute('class', 'size-full!');
    svg.setAttribute('aria-hidden', 'true');

    /* === Step 2: Traverse SVG nodes */
    const svgNodes = buildSvgNodeTree(svg);

    /* === Step 3: Add blocks which are not exist in missing_blocks of metadata */
    // If type and subtpye is not belong to football event ==> Do not merge missing_blocks
    // If do ==> Merge missing_blocks
    const updatedMissingBlocks =
        type && subtype && EXCLUDE_TYPE.includes(type) && EXCLUDE_SUBTYPE.includes(subtype)
            ? mergeMissingSvgBlocks(svgNodes, metadata.missing_blocks ?? [])
            : [];

    /* === Step 4: Normalize category's name in "blocks" metadata */
    const resolvedCategories = buildResolvedCategories(metadata.blocks, metadata.event?.venue_name);

    /* === Step 5: Filter blocks in metadata.blocks that are not exist in SVG */
    const availableBlocks = filterSvgBlocks(svgNodes, resolvedCategories);

    /* === Step 6: Get available missing blocks */
    const availableMissingBlocks = getMissingBlocksAvailable(updatedMissingBlocks);

    /* === Step 7: Modify element's SVG by settting needed attributes === */
    modifyElementByBlock(svg, availableBlocks, metadata.event?.venue_name);
    modifyElementByBlock(svg, availableMissingBlocks, metadata.event?.venue_name);

    return new XMLSerializer().serializeToString(document);
};
