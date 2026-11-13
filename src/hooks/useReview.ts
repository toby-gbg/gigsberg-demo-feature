'use client';

import { useTranslations } from 'next-intl';

const useReviews = () => {
    const t = useTranslations();

    return [
        {
            name: 'Vanessa W.',
            rating: 5,
            comment: t('vanessa_comment'),
        },
        {
            name: 'Delaram H.',
            rating: 5,
            comment: t('delaram_comment'),
        },
        {
            name: 'Dmytro O.',
            rating: 5,
            comment: t('dmytro_comment'),
        },
    ];
};

export default useReviews;
