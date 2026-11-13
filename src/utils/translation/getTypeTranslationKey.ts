import { removeTicketsSuffix } from '../common';

// Simple dynamic mapping
export const getTypeTranslationKey = (type?: string, prefix?: string): string => {
    if (!type) return '';

    // Remove & and normalize spaces to dashes
    const normalizedType = type
        .toLowerCase()
        .replace(/\s*&\s*/g, '-')
        .replace(/\s+/g, '-');
    const normalizedPrefix = removeTicketsSuffix(
        prefix
            ?.toLowerCase()
            .replace(/\s*&\s*/g, '-')
            .replace(/\s+/g, '-')
    );

    // If no prefix, return type as-is
    if (!normalizedPrefix) {
        return normalizedType;
    }

    // For other cases with prefix, return prefix_type format
    if (normalizedPrefix !== normalizedType) {
        return `${normalizedPrefix}_${normalizedType}`;
    }

    // Fallback to original type
    return normalizedType;
};
