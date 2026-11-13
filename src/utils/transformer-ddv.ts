type FormatterContext = {
    originalValue: string;
};

export type FormatRule = {
    name: string;
    match: (value: string, context: FormatterContext) => boolean;
    transform: (value: string, context: FormatterContext) => string;
};

type FormatOptions = {
    /**
     * If true, run all matching rules in order.
     * If false, only run the first matching rule.
     */
    applyMultipleRules?: boolean;
};

/**
 * Rule factory:
 * Remove leading zeros after a prefix.
 *
 * Examples:
 * S_025 -> S_25
 * S_006 -> S_6
 */
export const removeLeadingZeroAfterPrefix = (prefix: string): FormatRule => {
    return {
        name: `remove-leading-zero-after-${prefix}`,

        match: (value) => {
            const regex = new RegExp(`^${prefix}\\d+$`);
            return regex.test(value);
        },

        transform: (value) => {
            const regex = new RegExp(`^${prefix}0+(?=\\d)`);
            return value.replace(regex, prefix);
        },
    };
};

/**
 * Main formatter.
 */
export const formatValueByRules = (
    value: string,
    rules: FormatRule[],
    options: FormatOptions = {}
): string => {
    const context: FormatterContext = {
        originalValue: value,
    };

    const { applyMultipleRules = true } = options;

    if (applyMultipleRules) {
        return rules.reduce((result, rule) => {
            if (!rule.match(result, context)) {
                return result;
            }

            return rule.transform(result, context);
        }, value);
    }

    const matchedRule = rules.find((rule) => rule.match(value, context));

    if (!matchedRule) {
        return value;
    }

    return matchedRule.transform(value, context);
};

/**
 * Format a list of values.
 */
export const formatValuesByRules = (
    values: string[],
    rules: FormatRule[],
    options?: FormatOptions
): string[] => {
    return values.map((value) => formatValueByRules(value, rules, options));
};
