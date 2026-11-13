import { useMemo } from 'react';

import { ExternalDigitalVenueBlocks } from '@/interfaces/Listing';
import { ConfigRulesMap, getDigitalVenueConfigRuleKey } from '@/utils/digital-venue';

const checkFormatDigitalVenue = (value: string): string => {
    const trimmedValue = value.trim();

    return trimmedValue.startsWith('S_') ? trimmedValue : `S_${trimmedValue}`;
};

const normalizeDigitalVenueRuleValue = (value: string): string[] => {
    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .map(checkFormatDigitalVenue);
};

export const useConfigRules = ({
    external_3ddv_blocks,
}: {
    external_3ddv_blocks: ExternalDigitalVenueBlocks[];
}) => {
    const configRules: ConfigRulesMap = useMemo(() => {
        if (!external_3ddv_blocks) return {};
        return Object.fromEntries(
            external_3ddv_blocks.map((item) => [
                /**
                 * Example: '2158:STARTZIELC'
                 */
                getDigitalVenueConfigRuleKey(item.block, item.category_id),
                /**
                 * Example: external_3ddv_block: "Block531A, Block222" ==> external_3ddv_block: ['S_BLOCK531A', 'S_BLOCK222']
                 */
                normalizeDigitalVenueRuleValue(item.external_3ddv_block),
            ])
        );
    }, [external_3ddv_blocks]);

    return { configRules };
};
