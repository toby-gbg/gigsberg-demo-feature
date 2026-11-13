import { StringReplaceRule } from '@/interfaces/WhiteLabel';
import { parseRegex } from '@/lib/string';

export const generateHrefLinks = (links: Record<string, string>, path = '') => {
    return Object.fromEntries(
        Object.entries(links).map(([key, url]) => [key, (url + path).replace(/\/$/, '')])
    );
};

/**
 * GM-149 - We need to add this robots meta tag to pages that has params
 *
 * e.g. search params, tracking tags, affiliate id,...
 * @param params
 * @returns
 */
export const generateIndexMetaTag = (params: Record<string, string | string[] | undefined>) => {
    return Object.keys(params || {}).length > 0 ? { robots: { index: false, follow: true } } : {};
};

/**
 * Apply string rule from config
 * Look for `rule.match` inside `value`, if they exist then replace with rule.replace
 * @param value
 * @param rule
 * @returns
 */
export const applyStringRule = (value: string, rule: StringReplaceRule) => {
    if (!value.length) return '';

    const regex = parseRegex(rule.match);

    // regex rule
    if (regex) {
        return value.replace(regex, rule.replace);
    }

    // plain string rule (case-insensitive)
    const escapedMatch = rule.match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return value.replace(new RegExp(escapedMatch, 'gi'), rule.replace);
};

/**
 * Find a rule for current `value` from list of rules and apply
 * @param value
 * @param rules
 * @returns
 */
export const findAndApplyStringRule = (value: string, rules: StringReplaceRule[]): string => {
    return rules
        .reduce((currentValue, rule) => applyStringRule(currentValue, rule), value)
        .replace(/\s+/g, ' ')
        .trim();
};
