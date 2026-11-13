import type { Element as XmlElement } from '@xmldom/xmldom';

import { ListingMetadataBlock, MissingMetadataBlock } from '@/interfaces/Listing';

import { normalizeKeyData } from './normalize';
import { BlockKeyIdentity, SvgNode } from './type';
import { getBlockVariants, getCategoryVariants } from './variants';

// Checks whether a <g> element is a logical leaf node.
const isLeafNode = (group: XmlElement): boolean => {
    const groupId = normalizeKeyData(group.getAttribute('id') ?? '');
    const groupDataName = normalizeKeyData(group.getAttribute('data-name') ?? '');

    if (!groupId) return false;

    return Array.from(group.childNodes).some((node) => {
        if (node.nodeType !== 1) return false;

        const child = node as XmlElement;
        const childIdentity = child.getAttribute('data-name') || child.getAttribute('id') || '';

        return (
            normalizeKeyData(childIdentity) === groupDataName ||
            normalizeKeyData(childIdentity) === groupId
        );
    });
};

// Normalizes a <g> element into an SvgNode
// Marking it as interactive if it meets the logical leaf-node conditions;
// Otherwise, it recursively processes its child groups.
const buildSvgNode = (group: XmlElement): SvgNode => {
    const isLeaf = isLeafNode(group);
    const svgNodeData = {
        id: group.getAttribute('id') ?? '',
        name: group.getAttribute('data-name') ?? '',
        isLeaf,
    };

    // Stop early when the current group is a logical leaf node.
    if (isLeaf) {
        return {
            ...svgNodeData,
            children: [],
        };
    }

    const children = getDirectGroupChildren(group);

    // Recurse into direct <g> children; an empty array ends traversal naturally.
    return {
        ...svgNodeData,
        children: children.map(buildSvgNode),
    };
};

// Gets direct child <g> elements, ignoring text nodes and other elements.
// childNode
//    ↓
// Is it an Element?
//    │
//    ├─ No → Skip
//    │
//    └─ Yes
//        ↓
//      Is it a <g>?
//        │
//        ├─ No → Skip
//        └─ Yes → Add <g> element to result
const getDirectGroupChildren = (element: XmlElement): XmlElement[] => {
    const groups: XmlElement[] = [];

    for (const node of Array.from(element.childNodes)) {
        /**
         * Example:
            <g id="Level_300">
                <g id="_317"></g>
                <g id="_309"></g>
            </g>
         * From HTML above, childNodes can be considered as below:
            [
                TextNode("\n    "),
                Element(<g id="_317">),
                TextNode("\n    "),
                Element(<g id="_309">),
                TextNode("\n")
            ]
         * The DOM defines several common nodeTypes:
         * 1 // ELEMENT_NODE
         * 3 // TEXT_NODE
         * 8 // COMMENT_NODE
         * 9 // DOCUMENT_NODE
         * ...
         * ==> Reference: https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
         * Below the condition 'node.nodeType !== 1' mean that if this node is not an Element
         * skip it and check the next node.
        */
        if (node.nodeType !== 1) {
            continue;
        }

        const child = node as XmlElement;

        if (child.tagName === 'g') {
            groups.push(child);
        }
    }

    return groups.filter((group) => {
        const groupId = normalizeKeyData(group.getAttribute('id') ?? '');
        return !['stage', 'field'].includes(groupId);
    });
};

// Example of svgNode:
//     [
//         {
//             "id": "Layer_1",
//             "name": "Layer 1",
//             "children": [
//                 {
//                     "id": "Floor",
//                     "name": "",
//                     "isLeaf": "false";
//                     "children": [
//                         {
//                             "id": "_0Floor_text",
//                             "name": "0Floor_text",
//                             "isLeaf": "true",
//                             "children": []
//                         },
//                         ...
//                 ]
//             },
//             ...
//     ]
export const buildSvgNodeTree = (svg: XmlElement) => getDirectGroupChildren(svg).map(buildSvgNode);

// Traverser node in DFS
const traverseNodes = (
    nodes: SvgNode[],
    shouldStop: (node: SvgNode) => boolean,
    callback: (node: SvgNode) => void
): void => {
    for (const node of nodes) {
        if (shouldStop(node)) {
            callback(node);
            continue;
        }

        traverseNodes(node.children, shouldStop, callback);
    }
};

// Traverse current SVG nodes to add blocks that do not exist in missing blocks metadata
export const mergeMissingSvgBlocks = (
    svgNodes: SvgNode[],
    missingBlockMetadata: MissingMetadataBlock[]
) => {
    const categoryBlockUpdates: Map<
        string,
        | {
              mergedBlocks: string[];
              existingBlocks: BlockKeyIdentity[];
              unregisteredSvgBlocks: BlockKeyIdentity[];
              svgBlockNames: BlockKeyIdentity[];
          }
        | undefined
    > = new Map();

    traverseNodes(
        svgNodes,
        (node) => !node.isLeaf && node.children.some((child) => child.isLeaf),
        (node) => {
            // Return node identify by name from SVG as BlockKeyIdentity[]
            const svgBlockNames = node.children.map((child) => ({
                rawKey: child.name,
                normalizedKey: normalizeKeyData(child.name),
            }));

            // Find category metadata
            const categoryMetadata =
                missingBlockMetadata.find((missingBlock) =>
                    getCategoryVariants(missingBlock.category_name).includes(node.id)
                ) ?? undefined;

            if (!categoryMetadata) return;

            // Return block identify from missing block metadata as BlockKeyIdentity[]
            // Filter block which is exist in SVG nodes
            // Note: node.id represents category metadata name
            const existingBlocks =
                categoryMetadata?.blocks
                    .map((item) => ({
                        rawKey: item,
                        normalizedKey: normalizeKeyData(item),
                    }))
                    .filter((block) =>
                        svgBlockNames
                            .map((item) => item.normalizedKey)
                            .filter(Boolean)
                            .includes(block.normalizedKey)
                    ) ?? [];

            // Find nodes which are not exist in missing block metadata
            const existingBlockKeys = new Set(existingBlocks.map((item) => item.normalizedKey));
            const unregisteredSvgBlocks = svgBlockNames.filter(
                (block) => !existingBlockKeys.has(block.normalizedKey)
            );

            // {
            //     "key": "Away Section",
            //     "value": {
            //         "existingBlocks": [{"rawKey": "WL1", "normalizedKey": "wl1"}]
            //         "unregisteredSvgBlocks": [],
            //         "svgBlockNames": [{"rawKey": "WL1", "normalizedKey": "wl1"}]
            //         "mergedBlocks": ["013", ...]
            //     }
            // }
            categoryBlockUpdates.set(categoryMetadata?.category_name, {
                existingBlocks,
                unregisteredSvgBlocks,
                svgBlockNames,
                mergedBlocks: [
                    ...existingBlocks.map((item) => item.rawKey),
                    ...unregisteredSvgBlocks.map((item) => item.rawKey),
                ],
            });
        }
    );

    return missingBlockMetadata.map((item) => {
        return {
            ...item,
            blocks:
                categoryBlockUpdates
                    .get(item.category_name)
                    ?.mergedBlocks.map((block) => block.replace(/^[0_]+/, '')) ?? item.blocks, // Remove all zeros and underscores from the beginning of the string
        };
    });
};

// Filter out metadata blocks that do not exist in the SVG
export const filterSvgBlocks = (svgNodes: SvgNode[], blocks: ListingMetadataBlock[]) =>
    blocks.filter((block) => {
        const categoryVariants = getCategoryVariants(block.categoryName);
        const keyVariants = getBlockVariants(block.key);
        const categorySvg = svgNodes.find((node) => categoryVariants.includes(node.id));

        // If there is no corresponding category,
        // OR this category svg is consider as leaf node (Node is a category). E.g: PIT, FLOOR,...
        // ==> These blocks will not be filtered.
        if (
            !categorySvg ||
            categorySvg.isLeaf ||
            getCategoryVariants('Pit').includes(categorySvg.id) ||
            getCategoryVariants('Circle').includes(categorySvg.id)
        )
            return true;

        return categorySvg.children.some((child) => keyVariants.includes(child.name));
    });
