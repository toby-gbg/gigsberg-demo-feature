'use client';

import { FC } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';

import Language from '@/interfaces/Language';
import { cn } from '@/lib/cn';
import { changeLocale } from '@/lib/locale';

import { DropdownElementProps } from '@/components/Dropdown';

const MainCountryItem: FC<DropdownElementProps<Language & { hugContent?: boolean }>> = ({
    iso_code: code,
    flag_code,
    local_name,
    onClick,
    hugContent,
}) => {
    const locale = useLocale();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isSelected = code === locale;

    const handleSelect = async (targetLocale: string) => {
        if (locale === targetLocale) {
            onClick?.();
            return;
        }

        await changeLocale({
            targetLocale,
            pathname,
            searchParams,
        });
    };

    const content = (
        <>
            <Image
                src={`https://flagcdn.com/w20/${flag_code}.webp`}
                width={20}
                height={15}
                alt={`${local_name} flag`}
                className="w-auto h-auto"
            />
            <span className="text-xs">{local_name}</span>
        </>
    );

    const itemClassName = cn(
        'flex items-center gap-x-2 p-2 pr-3! rounded-lg text-center transition cursor-pointer shrink-0',
        hugContent ? 'w-max whitespace-nowrap' : 'w-full',
        'hover:bg-gray-200 hover:font-bold hover:text-black',
        { 'bg-gray-200 font-bold text-black': isSelected }
    );

    return (
        <button
            type="button"
            onClick={() => handleSelect(code || 'en-GB')}
            className={itemClassName}
        >
            {content}
        </button>
    );
};

export default MainCountryItem;
