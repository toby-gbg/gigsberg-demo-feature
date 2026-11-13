'use client';

import { useTranslations } from 'next-intl';

import { fallbackTranslation } from '@/utils/common';

import useFont from '@/hooks/useFont';

import SubTitle from '@/components/SubTitle';

export default function PartnersError() {
    const t = useTranslations();
    const { sectionTitleFont } = useFont();
    return (
        <>
            <SubTitle
                title={fallbackTranslation(t('partners'), 'partners', 'Our Partners')}
                className="mb-7"
                fontClassName={sectionTitleFont.className}
            />

            <div className="flex justify-center items-center py-10 text-center">
                <p className="text-gray-500 text-sm">{t('section_load_error')}</p>
            </div>
        </>
    );
}
