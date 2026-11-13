import { useMemo } from 'react';

import { ListingMetadata } from '@/interfaces/Listing';

import { VIP_CATEGORY_KEYWORDS } from '../_utils/listing-filter.util';

export function useFilterCategories(
    categories: ListingMetadata['categories'],
    selectedCategories: Array<string | number> | undefined
) {
    const { vipCategories, casualCategories, vipCategoryNames } = useMemo(() => {
        const vip: NonNullable<ListingMetadata['categories']> = [];
        const casual: NonNullable<ListingMetadata['categories']> = [];
        const vipNames = new Map<string, string>();

        for (const category of categories ?? []) {
            const categoryId = String(category.category_id);
            const isVip =
                category.name &&
                VIP_CATEGORY_KEYWORDS.some((keyword) =>
                    category.name.toLowerCase().includes(keyword)
                );

            if (isVip) {
                vip.push(category);
                vipNames.set(categoryId, category.name);
            } else {
                casual.push(category);
            }
        }

        return { vipCategories: vip, casualCategories: casual, vipCategoryNames: vipNames };
    }, [categories]);

    const selectedCategoryIds = selectedCategories?.map(String) ?? [];
    const vipCategoryIds = new Set(vipCategories.map((category) => String(category.category_id)));
    const casualCategoryIds = new Set(
        casualCategories.map((category) => String(category.category_id))
    );
    const selectedVipIds = selectedCategoryIds.filter((category) => vipCategoryIds.has(category));
    const selectedCasualIds = selectedCategoryIds.filter((category) =>
        casualCategoryIds.has(category)
    );

    return {
        casualCategories,
        selectedCasualIds,
        selectedVipIds,
        vipCategories,
        vipCategoryNames,
    };
}
