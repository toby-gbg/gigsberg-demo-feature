'use client';

import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';

import { useSite } from '@/providers/SiteProvider';

import { useFaqContext } from '../../_providers/FaqContext';

export default function SearchField() {
    const t = useTranslations();
    const domainInfo = useSite().domainInfo;
    const { searchValue, setSearchValue } = useFaqContext();

    return (
        <div
            className={cn(
                'flex items-center gap-2 h-14 border-main-end text-on-header px-3 rounded-2xl w-2/3 md:w-1/2',
                domainInfo?.config.features?.useReverseSearchBarColors
                    ? 'text-solid! bg-on-solid hover:text-solid!'
                    : 'bg-solid! text-on-solid hover:bg-solid!'
            )}
        >
            <Search size={20} />

            <input
                name="searchValue"
                className="h-full w-full focus:outline-0"
                placeholder={t('search_for_an_answer')}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
            />

            {searchValue && (
                <button
                    type="button"
                    onClick={() => setSearchValue('')}
                    className="shrink-0"
                    aria-label="Clear search"
                >
                    <X size={20} />
                </button>
            )}
        </div>
    );
}
