'use client';

import { FC } from 'react';
import { useLocale } from 'next-intl';

import Language, { L } from '@/interfaces/Language';
import { cn } from '@/lib/cn';

import { useSite } from '@/providers/SiteProvider';

import Dropdown from '@/components/Dropdown';

import { getLanguageDropdownClassNames, getVisibleHeaderLanguages } from './languageDropdownLayout';
import MainCountryItem from './MainCountryItem';

interface MainCountryProps {
    mode?: 'burger' | 'normal';
    onClick?: () => void;
    mobileOnly?: boolean;
    languages: L;
}

const MainCountryClient: FC<MainCountryProps> = ({
    mode = 'normal',
    onClick,
    mobileOnly,
    languages = {},
}) => {
    const locale = useLocale();
    const { domainInfo } = useSite();

    const lang = locale.toLowerCase();
    const currentLanguage = languages[lang];
    const currentLanguageName = currentLanguage?.local_name || locale.toUpperCase();

    const isBurger = mode === 'burger';
    const visibleLanguages = getVisibleHeaderLanguages({
        languages,
        locale,
        hostname: domainInfo?.hostname,
        onlySupportOneLocale: domainInfo?.config?.features?.onlySupportOneLocale,
    });
    const hugContent = visibleLanguages.length <= 1;
    const { className, controlledContentClassName } = getLanguageDropdownClassNames(
        visibleLanguages.length
    );

    return (
        <Dropdown<Language & { hugContent?: boolean }>
            elements={visibleLanguages.map((language) => ({ ...language, hugContent }))}
            iconSrc={`https://flagcdn.com/w40/${currentLanguage?.flag_code}.webp`}
            title={currentLanguageName}
            containerClassName={cn('z-200', { 'block xl:hidden': mobileOnly })}
            Element={MainCountryItem}
            className={className}
            controlledContentClassName={controlledContentClassName}
            showArrow
            rightOrLeftMode
            trigger={isBurger ? 'click' : 'hover'}
            closeOnChoose
            onClick={onClick}
            aria-label={`Select language: ${currentLanguageName}`}
            hideValue
            isControlledSpacing
        />
    );
};

export default MainCountryClient;
