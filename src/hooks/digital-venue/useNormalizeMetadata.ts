import { useEffect, useMemo } from 'react';
import type { MapViewer } from '@3ddv/dvm';

import type { ListingMetadata } from '@/interfaces/Listing';
import type { DigitalVenueAvailableBlockInfo } from '@/types/digital-venue';
import {
    getDigitalVenueConfigRuleKey,
    matchKeys,
    type ConfigRulesMap,
    type MatchResult,
} from '@/utils/digital-venue';

interface UseNormalizeMetadataParams {
    metadata?: ListingMetadata;
    mapViewer?: MapViewer | null;
    configRules: ConfigRulesMap;
}

interface UseNormalizeMetadataResult {
    allBlocksMetadata: DigitalVenueAvailableBlockInfo[];
    availableBlockInfoById: Record<string, DigitalVenueAvailableBlockInfo>;
    availableBlocks: string[];
    keyMatching: MatchResult[];
}

export const useNormalizeMetadata = ({
    metadata,
    mapViewer,
    configRules,
}: UseNormalizeMetadataParams): UseNormalizeMetadataResult => {
    const normalizedMetadata = useMemo(() => {
        const ddvSectionNodes = mapViewer ? mapViewer.getNodesByType('section') : [];

        if (ddvSectionNodes.length === 0) {
            return {
                allBlocksMetadata: [],
                availableBlockInfoById: {},
                availableBlocks: [],
                keyMatching: [],
            };
        }

        if (!metadata?.blocks || !Array.isArray(metadata.blocks)) {
            return {
                allBlocksMetadata: [],
                availableBlockInfoById: {},
                availableBlocks: [],
                keyMatching: [],
            };
        }

        // Handle missing_blocks
        const missingBlocks: DigitalVenueAvailableBlockInfo[] = [];
        if (metadata.missing_blocks) {
            for (const missing of metadata.missing_blocks) {
                for (const blockName of missing.blocks) {
                    missingBlocks.push({
                        key: blockName,
                        price: 0,
                        categoryId: missing.category_id,
                        categoryName: missing.category_name,
                        minPrice: missing.min_price || 0,
                    });
                }
            }
        }

        // Combine missing_blocks and blocks from metadata
        const nextAllBlocksMetadata: DigitalVenueAvailableBlockInfo[] = [
            ...missingBlocks,
            ...metadata.blocks,
        ];

        // HANDLE KEY-MATCHING ==> target's field is the final value
        const keyMatching = matchKeys(nextAllBlocksMetadata, ddvSectionNodes, configRules);

        // Filter the available blocks and compare them with Gigsberg's metadata.
        const nextAvailableBlocks = keyMatching.flatMap((item) => {
            if (!item.targets) return [];

            return item.targets;
        });

        // Assign block details to specified key.
        const blockInfoBySource = new Map(
            nextAllBlocksMetadata.map(
                (block) =>
                    [getDigitalVenueConfigRuleKey(block.key, block.categoryId), block] as const
            )
        );

        const nextAvailableBlockInfoById: Record<string, DigitalVenueAvailableBlockInfo> = {};
        keyMatching.forEach((key) => {
            if (!key.targets) return;

            const blockInfo = blockInfoBySource.get(
                key.sourceKey ?? getDigitalVenueConfigRuleKey(key.source, key.categoryId)
            );
            if (!blockInfo) return;

            const targets = key.targets;

            for (const target of targets) {
                // Multiple metadata keys can match the same DDV target.
                // Prefer the block with a real price (price > 0); if none has a price, keep the normal insert behavior.
                const currentBlockInfo = nextAvailableBlockInfoById[target];
                const shouldPreferCurrent = currentBlockInfo && Number(currentBlockInfo.price) > 0;
                const shouldPreferNext = Number(blockInfo.price) > 0;

                if (shouldPreferCurrent && !shouldPreferNext) return;

                nextAvailableBlockInfoById[target] = {
                    ...blockInfo,
                    source: key.source,
                    target,
                };
            }
        });

        return {
            allBlocksMetadata: nextAllBlocksMetadata,
            availableBlockInfoById: nextAvailableBlockInfoById,
            availableBlocks: nextAvailableBlocks,
            keyMatching,
        };
    }, [configRules, metadata, mapViewer]);

    useEffect(() => {
        if (!mapViewer) return;

        Object.entries(normalizedMetadata.availableBlockInfoById).forEach(([key, blockInfo]) => {
            mapViewer.addNodesToGroup([key], String(blockInfo.categoryId));
        });
    }, [mapViewer, normalizedMetadata.availableBlockInfoById]);

    return normalizedMetadata;
};
