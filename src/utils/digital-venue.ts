export type MatchResult = {
    source: string;
    sourceKey?: string;
    categoryId?: number | string | null;
    targets: string[] | null;
    reason: string;
    matchesAmbious?: MatchTargetNode[];
};

export type ConfigRuleValue = string[];

export type ConfigRulesMap = Record<string, ConfigRuleValue>;

export type MatchSourceBlock = {
    key: string;
    categoryId?: number | string | null;
    categoryName?: string | null;
};

export type MatchTargetNode = {
    id: string;
    original_id?: string | null;
    label?: string | null;
    description?: string | null;
};

/**
 * Helper to check whether an object owns a key directly.
 */
const hasOwn = <T extends object>(object: T, key: PropertyKey) => {
    return Object.prototype.hasOwnProperty.call(object, key);
};

export const getDigitalVenueConfigRuleKey = (
    block: string,
    categoryId?: number | string | null
) => {
    if (categoryId === null || categoryId === undefined || categoryId === '') {
        return block;
    }

    return `${categoryId}:${block}`;
};

/**
 * Removes the 3DDV section prefix from the beginning of a key before normalization.
 * Examples: S_FRONTGALEFT -> FRONTGALEFT, S-FRONTGALEFT -> FRONTGALEFT.
 */
const removeDDVPrefix = (value: string) => {
    return value.replace(/^S[_-]/i, '');
};

/**
 * Normalizes leading zeroes for numeric and code-like block keys.
 *
 * Numeric-first keys:
 * 001   -> 1
 * 011   -> 11
 * 0005  -> 5
 * 125A  -> 125A
 *
 * Letter-first keys only drop zeroes after prefixes with at least 2 letters:
 * PC05  -> PC5
 * RN032 -> RN32
 */
const normalizeNumericKey = (value: string) => {
    if (/^\d/.test(value)) {
        return value.replace(/^0+(?=\d)/, '');
    }

    /**
     * PC05  -> PC5
     * RN032 -> RN32
     *
     * Keep:
     * A001 -> A001
     */
    return value.replace(/^([A-Z]{2,})0+([1-9]\d*)$/, '$1$2');
};

/**
 * Converts every source/DDV key into the same comparable format.
 *
 * Examples:
 * S_FRONT GA-LEFT -> FRONTGALEFT
 * front standing north -> FRONTSTANDINGNORTH
 * s_001 -> 1
 * PC05 -> PC5
 *
 * Steps:
 * - remove S_ or S- prefix
 * - remove non-alphanumeric characters
 * - uppercase
 * - normalize numeric/code-like leading zeroes
 */
export const normalizeKey = (value: string) => {
    const compactValue = removeDDVPrefix(value)
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
        .trim();

    return normalizeNumericKey(compactValue);
};

/**
 * Only these simple/code-like keys can be auto-matched without config rules.
 *
 * Allow:
 * 11
 * 001
 * 011
 * 125A
 * RN32
 * PC05
 *
 * Do not allow:
 * FRONTGALEFT
 * REARGA
 * LEFT
 * RIGHT
 * Rear General Admission
 */
const isAutoMappableSimpleKey = (value: string) => {
    const normalized = normalizeKey(value);

    if (!normalized) {
        return false;
    }

    /**
     * Numeric only:
     * 11, 001, 011
     */
    if (/^\d+$/.test(normalized)) {
        return true;
    }

    /**
     * Number + letter suffix:
     * 125A
     */
    if (/^\d+[A-Z]+$/.test(normalized)) {
        return true;
    }

    /**
     * Letter prefix + number:
     * RN32, PC05, T220, A001
     */
    if (/^[A-Z]+\d+$/.test(normalized)) {
        return true;
    }

    return false;
};

/**
 * Direct config rules are the first matching layer. They manually map one of our
 * blocks to one or more specific 3DDV sections and are treated as the source of truth.
 *
 * Example configRules:
 * {
 *      Left: ["S_FRONTGALEFT"],
 *      519: ["S_519Category7", "S_519Category6", "S_519Category5"]
 * }
 *
 * When source is Left, this checks configRules["Left"], then verifies that
 * S_FRONTGALEFT exists in the current 3DDV target nodes.
 *
 * If the target exists, matching succeeds:
 * {
 *      source: "Left",
 *      targets: ["S_FRONTGALEFT"],
 *      reason: "match_by_config_rules"
 * }
 *
 * If the configured target does not exist in the current 3DDV nodes, it returns:
 * {
 *      source: "Left",
 *      targets: null,
 *      reason: "config_rules_not_found"
 * }
 */
const findConfigRulesMatch = (
    sourceBlock: MatchSourceBlock,
    targetNodes: MatchTargetNode[],
    configRules: ConfigRulesMap
): MatchResult | null => {
    const source = sourceBlock.key;
    const sourceKey = getDigitalVenueConfigRuleKey(source, sourceBlock.categoryId);
    const ruleKey = hasOwn(configRules, sourceKey)
        ? sourceKey
        : hasOwn(configRules, source)
          ? source
          : null;

    if (!ruleKey) {
        return null;
    }

    const aliasTargets = configRules[ruleKey];
    const targetIds = targetNodes.map((target) => target.id);
    const existingAliasTargets = aliasTargets.filter((target) => targetIds.includes(target));

    if (existingAliasTargets.length === 0) {
        return {
            source,
            targets: null,
            reason: 'config_rules_not_found',
        };
    }

    return {
        source,
        targets: existingAliasTargets,
        reason: 'match_by_config_rules',
    };
};

const getTargetSearchValues = (target: MatchTargetNode) => {
    return [target.id, target.original_id, target.label, target.description].filter(
        (value): value is string => !!value
    );
};

const getTargetLabelValues = (target: MatchTargetNode) => {
    return [target.label].filter((value): value is string => !!value);
};

const getSourceLabelCandidates = (sourceBlock: MatchSourceBlock) => {
    const candidates: string[] = [];

    if (sourceBlock.categoryName) {
        candidates.push(`${sourceBlock.categoryName} ${sourceBlock.key}`);
    }

    candidates.push(sourceBlock.key);

    return Array.from(new Set(candidates.map((candidate) => normalizeKey(candidate)))).filter(
        Boolean
    );
};

/**
 * Splits a long label into normalized tokens for partial label matching.
 *
 * Examples:
 * toTokens("FRONT STANDING NORTH") -> ["FRONT", "STANDING", "NORTH"]
 * toTokens("FrontStandingNorth") -> ["FRONT", "STANDING", "NORTH"]
 */
const toTokens = (value: string) => {
    return value
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(/[^a-zA-Z0-9]+/)
        .map((token) => normalizeKey(token))
        .filter(Boolean);
};

/**
 * Shared helper that turns a list of candidates into the final match result.
 *
 * - no candidates: return null so the next matching rule can run
 * - one candidate: return those target ids
 * - multiple candidates: return an ambiguous result and stop matching
 */
const buildMatchResult = (
    source: string,
    matches: MatchTargetNode[],
    reason: string,
    ambiguousReason: string
): MatchResult | null => {
    /**
     * No candidates means this matching layer found nothing, so matchKeys can try
     * the next rule.
     */
    if (matches.length === 0) {
        return null;
    }

    /**
     * Multiple candidates means several targets fit the same source, so it is not
     * safe to choose one automatically.
     *
     * Example:
     * source: "North"
     * matches:
     * S_FRONTSTANDINGNORTH
     * S_REARSTANDINGNORTH
     */
    if (matches.length > 1) {
        return {
            source,
            targets: null,
            reason: ambiguousReason,
            matchesAmbious: matches,
        };
    }

    /**
     * Exactly one candidate means the match is safe.
     */
    return {
        source,
        targets: matches.map((item) => item.id),
        reason,
    };
};

/**
 * Matches by exact DDV label.
 *
 * This can use backend category context by trying "categoryName + key" before
 * falling back to the raw key. For example, categoryName "Front Standing" and
 * key "South" produce candidates ["FRONTSTANDINGSOUTH", "SOUTH"].
 *
 * If a 3DDV label normalizes to one of those candidates, matching succeeds:
 * {
 *      source: 'South',
 *      targets: ['S_FRONTSTANDINGSOUTH'],
 *      reason: 'match_by_exact_label'
 * }
 */
const findExactLabelMatch = (
    sourceBlock: MatchSourceBlock,
    targetNodes: MatchTargetNode[]
): MatchResult | null => {
    const sourceLabelCandidates = getSourceLabelCandidates(sourceBlock);

    for (const sourceLabelCandidate of sourceLabelCandidates) {
        const matches = targetNodes.filter((target) => {
            return getTargetLabelValues(target).some(
                (value) => normalizeKey(value) === sourceLabelCandidate
            );
        });

        const matchResult = buildMatchResult(
            sourceBlock.key,
            matches,
            'match_by_exact_label',
            'ambiguous_match_by_exact_label'
        );

        if (matchResult) {
            return matchResult;
        }
    }

    return null;
};

/**
 * Matches word-like keys by exact normalized node fields.
 *
 * Unlike findExactCodeMatch, this can match non-code keys such as LEFT, RIGHT,
 * FRONTGALEFT, REARGA, or Rear General Admission if the source exactly matches
 * one of the 3DDV node fields after normalization.
 *
 * Examples:
 * FRONTGALEFT -> S_FRONTGALEFT
 * CIRCLE -> S_CIRCLE
 * DISCO -> S_DISCO
 *
 * Successful result:
 * {
 *      source: "FRONTGALEFT",
 *      targets: ["S_FRONTGALEFT"],
 *      reason: "match_by_exact_node"
 * }
 */
const findExactWordKeyMatch = (
    source: string,
    targetNodes: MatchTargetNode[]
): MatchResult | null => {
    const sourceKey = normalizeKey(source);
    const matches = targetNodes.filter((target) => {
        return getTargetSearchValues(target).some((value) => normalizeKey(value) === sourceKey);
    });

    return buildMatchResult(
        source,
        matches,
        'match_by_exact_node',
        'ambiguous_match_by_exact_node'
    );
};

/**
 * Matches only simple/code-like keys by exact normalized node fields.
 *
 * This rule only runs for safe code-like sources such as 11, 001, 011, 125A,
 * RN32, or PC05. It intentionally skips word-like keys.
 *
 * Examples:
 * 001 -> 1
 * PC05 -> PC5
 *
 * Successful result:
 * {
 *      source: "230",
 *      targets: ["S_230"],
 *      reason: "match_by_exact_code"
 * }
 */
const findExactCodeMatch = (source: string, targetNodes: MatchTargetNode[]): MatchResult | null => {
    if (!isAutoMappableSimpleKey(source)) {
        return null;
    }

    const sourceKey = normalizeKey(source);

    const matches = targetNodes.filter((target) => {
        return getTargetSearchValues(target).some((value) => normalizeKey(value) === sourceKey);
    });

    return buildMatchResult(
        source,
        matches,
        'match_by_exact_code',
        'ambiguous_match_by_exact_code'
    );
};

/**
 * Fallback label-token match.
 *
 * Splits the 3DDV label into tokens and compares the source with each token or
 * with the label suffix. It only accepts the match when exactly one target is
 * found.
 *
 * Example:
 * "FRONT STANDING NORTH" -> ["FRONT", "STANDING", "NORTH"]
 *
 * If multiple 3DDV nodes match, the result is ambiguous:
 * source: "North"
 * labels:
 * FRONT STANDING NORTH
 * REAR STANDING NORTH
 *
 * {
 *      source: 'North',
 *      targets: null,
 *      reason: "ambiguous_match_by_unique_label_token",
 * }
 */
const findLabelTokenMatch = (
    source: string,
    targetNodes: MatchTargetNode[]
): MatchResult | null => {
    const sourceKey = normalizeKey(source);
    const canUseSuffixMatch = sourceKey.length >= 3;

    if (!sourceKey) {
        return null;
    }

    const matches = targetNodes.filter((target) => {
        return getTargetLabelValues(target).some((label) => {
            const labelKey = normalizeKey(label);
            const labelTokens = toTokens(label);

            return (
                labelTokens.includes(sourceKey) ||
                (canUseSuffixMatch && labelKey.endsWith(sourceKey))
            );
        });
    });

    return buildMatchResult(
        source,
        matches,
        'match_by_unique_label_token',
        'ambiguous_match_by_unique_label_token'
    );
};

export const matchKeys = (
    sourceBlocks: MatchSourceBlock[],
    targetNodes: MatchTargetNode[],
    configRules: ConfigRulesMap = {}
): MatchResult[] => {
    return sourceBlocks.map((sourceBlock) => {
        const source = sourceBlock.key;
        const withSourceMetadata = (result: MatchResult): MatchResult => ({
            ...result,
            categoryId: sourceBlock.categoryId,
            sourceKey: getDigitalVenueConfigRuleKey(source, sourceBlock.categoryId),
        });

        /**
         * Matching priority:
         * 1. configRules is the source of truth for known ambiguous venues.
         * 2. Exact label match, including "categoryName + key" such as "Front Standing North".
         * 3. Existing simple code match for numeric/code-like blocks such as 11, PC05, RN32.
         * 4. Exact node key match such as LEFT, RIGHT, FRONTGALEFT, REARGA, Rear General Admission.
         * 5. Unique label token match, e.g. North -> "FRONT STANDING NORTH".
         * 6. No match when nothing is found or a candidate set is ambiguous.
         */

        /**
         * 1. Direct config rules first.
         *
         * If Admin defines config rules for this source,
         * config rules becomes the source of truth.
         */
        const aliasMatch = findConfigRulesMatch(sourceBlock, targetNodes, configRules);

        if (aliasMatch) {
            return withSourceMetadata(aliasMatch);
        }

        /**
         * 2. Exact label match.
         *
         * Examples:
         * South -> label "FRONT STANDING SOUTH"
         */
        const exactLabelMatch = findExactLabelMatch(sourceBlock, targetNodes);

        if (exactLabelMatch) {
            return withSourceMetadata(exactLabelMatch);
        }

        /**
         * 3. Simple code-like exact match only.
         *
         * Examples:
         * 11    -> S_11
         * 001   -> S_1
         * 011   -> S_11
         * 125A  -> S_125A
         * RN32  -> S_RN32
         * PC05  -> S_PC5
         */
        const simpleMatch = findExactCodeMatch(source, targetNodes);

        if (simpleMatch) {
            return withSourceMetadata(simpleMatch);
        }

        /* We can ignore 2 Rules below */
        /**
         * 4. Exact word key match.
         *
         * Examples:
         * FRONTGALEFT -> id "S_FRONTGALEFT"
         */
        // const exactWordKeyMatch = findExactWordKeyMatch(source, targetNodes);

        // if (exactWordKeyMatch) {
        //     return withSourceMetadata(exactWordKeyMatch);
        // }

        /**
         * 5. Unique label token match.
         *
         * Examples:
         * North -> label "FRONT STANDING NORTH" if it is the only matching label.
         */
        // const labelTokenMatch = findLabelTokenMatch(source, targetNodes);

        // if (labelTokenMatch) {
        //     return withSourceMetadata(labelTokenMatch);
        // }

        /**
         * 6. No match.
         */
        return withSourceMetadata({
            source,
            targets: null,
            reason: 'match_not_found',
        });
    });
};
