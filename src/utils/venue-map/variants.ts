// Get possible variant category
// E.g: Input is Lower Tier
// [
//     'Lower Tier',
//     'Lower_Tier',
//     'LOWER TIER',
//     'LOWER_TIER',
//     'lower tier',
//     'lower_tier',
// ]
export const getCategoryVariants = (categoryName: string): string[] => {
    const category = categoryName.trim();

    return [
        category,
        category.replace(/\s+/g, '_'),
        category.toUpperCase(),
        category.toUpperCase().replace(/\s+/g, '_'),
        category.toLowerCase(),
        category.toLowerCase().replace(/\s+/g, '_'),
    ];
};

// Get possible variant block
// E.g: Input is vip box
// [
//     'vip box',
//     '0vip box',
//     '00vip box',
//     '_vip box',
//     '_0vip box',
//
//     'vipbox',
//     '0vipbox',
//     '00vipbox',
//     '_vipbox',
//     '_0vipbox',
//
//     'VIP BOX',
//     '0VIP BOX',
//     '00VIP BOX',
//     '_VIP BOX',
//     '_0VIP BOX',
//
//     'VIPBOX',
//     '0VIPBOX',
//     '00VIPBOX'
//     '_VIPBOX',
//     '_0VIPBOX',
//
//     'vip box',
//     '0vip box',
//     '00vip box',
//     '_vip box',
//     '_0vip box',
//
//     'vipbox',
//     '0vipbox',
//     '00vipbox',
//     '_vipbox',
//     '_0vipbox',
// ]
export const getBlockVariants = (key: string): string[] => {
    const blockKey = key.trim();

    // E.g: blockKey is vip box
    // ['vip box', 'vipbox', 'VIP BOX', 'VIPBOX', 'vip box', 'vipbox', 'Vipbox'];
    const keyBaseVariants = [
        blockKey,
        blockKey.replace(/\s+/g, ''),
        blockKey.toUpperCase(),
        blockKey.toUpperCase().replace(/\s+/g, ''),
        blockKey.toLowerCase(),
        blockKey.toLowerCase().replace(/\s+/g, ''),
        blockKey.toLowerCase().replace(/[a-z]/, (char) => char.toUpperCase()),
    ];

    return keyBaseVariants.flatMap((keyValue) => [
        keyValue,
        `0${keyValue}`,
        `00${keyValue}`,
        `_${keyValue}`,
        `_0${keyValue}`,
    ]);
};
