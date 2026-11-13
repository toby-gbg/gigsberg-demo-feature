export const getTermsHeadingId = (title: string, group: 'terms' | 'seller' = 'terms') => {
    const sectionNumber = title.match(/^\d+/)?.[0];

    if (sectionNumber) {
        return `${group === 'seller' ? 'seller-policy' : 'clause'}-${sectionNumber}`;
    }

    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};
