import { useTranslations } from 'next-intl';

import { fallbackTranslation } from '../common';
import { getTypeTranslationKey } from './getTypeTranslationKey';

export const getTypeSubtypeTranslations = (
    t: ReturnType<typeof useTranslations>,
    type?: string,
    prefix?: string,
    fallbackType?: string,
    toLowercase = true
): string => {
    if (!type) return '';

    //In the future, modify so that also accept Comedy
    const needLowercase = toLowercase && !/festival/.test(type || '');

    const translationKey = getTypeTranslationKey(type, prefix);
    const typeTranslation =
        fallbackTranslation(t(translationKey), translationKey, fallbackType ?? '') || type;

    return needLowercase ? typeTranslation.toLowerCase() : typeTranslation;
};

export const convertUrlToKeyTranslate = (url: string, prefix: string): string => {
    const key = url.split('-').join('_');
    return `${prefix}${key}`;
};
