import { FooterCommonCredits, FooterCredits } from '../interfaces/Footer';

export const isValidCredit = (credit: FooterCredits): boolean => {
    // Check if both imageCredits and imageSource are present
    // And they are not empty strings, null, undefined, or whitespace-only
    return !!(
        credit?.imageCredits &&
        credit?.imageSource &&
        typeof credit.imageCredits === 'string' &&
        typeof credit.imageSource === 'string' &&
        credit.imageCredits.trim().length > 0 &&
        credit.imageSource.trim().length > 0
    );
};

export const filterValidCredits = (credits: FooterCredits[]): FooterCredits[] => {
    return credits.filter(isValidCredit);
};

export const combineLocaleCredits = (locale: FooterCommonCredits): FooterCredits[] => {
    return [
        ...(locale.slides || []),
        ...(locale.entities || []),
        ...(locale.events || []),
        ...(locale.performers || []),
        ...(locale.fansAlsoLikePerformers || []),
    ];
};

export const deduplicateCredits = (credits: FooterCredits[]): FooterCredits[] => {
    const seen = new Set<string>();

    return credits.filter((credit) => {
        const key = `${credit.imageCredits}|${credit.imageSource}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
};
