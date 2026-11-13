'use client';

import {
    FC,
    KeyboardEventHandler,
    ReactNode,
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react';
import { searchParamsSerializer } from '@/nuqs/params/search';
import { ClassValue } from 'clsx';
import { Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { SearchItem } from '@/interfaces/Search';
import { SelectCategory } from '@/interfaces/Select';
import { getFieldTriggerClassName } from '@/config/classname';
import { cn } from '@/lib/cn';
import { fallbackTranslation, normalizeString } from '@/utils/common';
import { getSearchItemUrl, processSearchOptionLabel } from '@/utils/search';
import { useEventSearch } from '@/swr/features/events';

import { useSite } from '@/providers/SiteProvider';
import { useDebounce } from '@/hooks/useDebounce';
import useIntlRouter from '@/hooks/useIntlRouter';
import { useOutsideClick } from '@/hooks/useOutsideClick';

import SearchIcon from '@/components/SearchIcon';

import LoadingDots from '../LoadingDots';

type SearchOption = {
    value: string;
    label: string;
    item: SearchItem;
};

const HeaderSearchBar: FC = () => {
    const t = useTranslations();
    const id = useId();
    const listBoxId = `${id}-listbox`;
    const getOptionId = useCallback((index: number) => `${id}-option-${index}`, [id]);

    const router = useIntlRouter();
    const locale = useLocale();
    const domainInfo = useSite().domainInfo;
    const { config } = domainInfo ?? {};
    const useReverseSearchBarColors = config?.features?.useReverseSearchBarColors || false;

    const [inputValue, setInputValue] = useState('');
    const [debouncedValue, setDebouncedValue] = useState('');
    const debouncedSetValue = useDebounce((value: string) => setDebouncedValue(value), 300);
    const { data: rawOptions, isLoading: isLoadingOptions } = useEventSearch(debouncedValue);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listBoxRef = useRef<HTMLDivElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    // Transform API response into display options
    const options = useMemo((): SelectCategory<SearchOption>[] => {
        if (isLoadingOptions || !rawOptions) return [];

        const groups = [
            { label: 'performers', options: rawOptions.performers },
            { label: 'tours', options: rawOptions.tours },
            { label: 'cities', options: rawOptions.cities },
            { label: 'venues', options: rawOptions.venues },
            { label: 'events', options: rawOptions.events },
        ];

        return groups
            .map((group) => ({
                label: group.label || '',
                options: group.options.map((item) => ({
                    value: `${item.tableName}-${item.id}`,
                    label: item.labelTranslationKey
                        ? `${t(item.labelTranslationKey)}${
                              item.categoryTranslationKey
                                  ? ` - ${t(item.categoryTranslationKey)}`
                                  : ''
                          }`
                        : item.label,
                    item,
                })),
            }))
            .filter((group) => group.options.length > 0);
    }, [rawOptions, t]);

    const flatOptions = useMemo(() => options.flatMap((group) => group.options), [options]);
    const activeOptionId = isOpen && activeIndex >= 0 ? getOptionId(activeIndex) : undefined;

    const close = useCallback(() => {
        setIsOpen(false);
        setActiveIndex(-1);
    }, []);

    const resetSearch = useCallback(() => {
        setInputValue('');
        setDebouncedValue('');
        setIsOpen(false);
        setActiveIndex(-1);
    }, []);

    const handleInputChange = (value: string) => {
        setInputValue(value);
        setIsOpen(true);
        setActiveIndex(-1);

        if (!value.trim()) {
            debouncedSetValue(''); // cancel + clear
            return;
        }

        debouncedSetValue(value);
    };

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setIsOpen(true);
            setActiveIndex((current) =>
                flatOptions.length === 0 ? -1 : current < flatOptions.length - 1 ? current + 1 : 0
            );
            return;
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setIsOpen(true);
            setActiveIndex((current) =>
                flatOptions.length === 0 ? -1 : current > 0 ? current - 1 : flatOptions.length - 1
            );
            return;
        }

        if (event.key === 'Escape') {
            if (!isOpen) return;
            event.preventDefault();
            close();
            return;
        }

        if (event.key === 'Tab') {
            close();
            return;
        }

        if (event.key !== 'Enter' || !inputValue) return;

        const activeOption = flatOptions[activeIndex];

        if (isOpen && activeOption) {
            event.preventDefault();
            handleChange(activeOption);
            return;
        }

        router.push(
            searchParamsSerializer('/search', {
                q: inputValue,
            })
        );
        resetSearch();
    };

    const handleChange = ({ item }: SearchOption) => {
        resetSearch();
        router.push(getSearchItemUrl(item));
    };

    const renderMessage = (message: ReactNode, className?: ClassValue) => {
        if (!message) return null;
        return <div className={cn('px-3 py-2 text-sm text-center', className)}>{message}</div>;
    };

    const renderGroupLabel = (group: SelectCategory<SearchOption>) => {
        const normalizedLabel = normalizeString(group.label || 'default_group_heading_search');
        return (
            <div className="flex items-center gap-2 bg-solid px-3 pt-5 pb-3 font-bold text-on-solid text-sm uppercase">
                <SearchIcon label={normalizeString(group.label)} />
                <span>
                    {fallbackTranslation(t(normalizedLabel), normalizedLabel, group.label || '')}
                </span>
            </div>
        );
    };

    const getOptionIndex = (groupIndex: number, optionIndex: number) =>
        options
            .slice(0, groupIndex)
            .reduce((count, group) => count + group.options.length, optionIndex);

    const renderOption = (option: SearchOption, groupName: string, index: number) => {
        const isActive = activeIndex === index;
        return (
            <button
                key={option.value}
                id={getOptionId(index)}
                type="button"
                role="option"
                aria-selected={isActive}
                className={cn(
                    'flex justify-between items-center hover:bg-main-end px-3 py-2.5 rounded-none outline-none w-full text-on-solid hover:text-on-main text-sm text-left cursor-pointer',
                    isActive && 'bg-main-end text-on-main'
                )}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => handleChange(option)}
            >
                <span className="block min-w-0 truncate">
                    {processSearchOptionLabel(option.item, groupName, locale)}
                </span>
            </button>
        );
    };

    const renderMenuContent = () => {
        if (isLoadingOptions && options.length === 0) {
            return renderMessage(`${t('loading')}`, 'text-on-solid/80');
        }

        if (options.length === 0 && debouncedValue.length >= 3) {
            return renderMessage(t('noResults'), 'text-on-solid!');
        }

        return options.map((group, groupIndex) => (
            <div key={group.label || '__options__'}>
                {group.label && renderGroupLabel(group)}
                {group.options.map((option, optionIndex) =>
                    renderOption(option, group.label, getOptionIndex(groupIndex, optionIndex))
                )}
            </div>
        ));
    };

    const shouldRenderMenu =
        isOpen && (isLoadingOptions || options.length > 0 || debouncedValue.length >= 3);

    useOutsideClick(isOpen, close, [wrapperRef]);

    useEffect(() => {
        const handleModalClose = () => close();
        document.addEventListener('gigsberg:close-all-select', handleModalClose);
        return () => document.removeEventListener('gigsberg:close-all-select', handleModalClose);
    }, [close]);

    useEffect(() => {
        if (listBoxRef.current) listBoxRef.current.scrollTop = 0;
        setActiveIndex(-1);
    }, [inputValue, options]);

    useEffect(() => {
        if (!activeOptionId) return;
        document.getElementById(activeOptionId)?.scrollIntoView({ block: 'nearest' });
    }, [activeOptionId]);

    return (
        <div ref={wrapperRef} className="z-51 relative xl:mt-0 w-full">
            <div className="relative">
                <div
                    data-focused={isFocused || undefined}
                    className={cn(
                        getFieldTriggerClassName({
                            hasLabel: false,
                            triggerClassName:
                                'min-h-9.5 min-[1475px]:min-h-8.5 min-[1280px]:min-h-7.5 min-[1280px]:w-52! min-[1475px]:w-62! min-[1525px]:w-72! rounded-[22px]! border-none! shadow-none',
                        }),
                        useReverseSearchBarColors
                            ? 'text-solid! bg-on-solid hover:text-solid!'
                            : 'bg-solid! text-on-solid hover:bg-solid!'
                    )}
                    onMouseDown={() => inputRef.current?.focus()}
                >
                    <span className="mr-2 shrink-0">
                        <Search
                            size={20}
                            className={useReverseSearchBarColors ? 'text-solid' : 'text-on-solid'}
                        />
                    </span>
                    <input
                        ref={inputRef}
                        id={id}
                        type="search"
                        value={inputValue}
                        placeholder={`${t('search')}...`}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        aria-label={t('search')}
                        role="combobox"
                        aria-expanded={isOpen}
                        aria-controls={listBoxId}
                        aria-autocomplete="list"
                        aria-haspopup="listbox"
                        aria-activedescendant={activeOptionId}
                        className={cn(
                            'flex-1 bg-transparent outline-none min-w-0 min-[1280px]:placeholder:text-sm! min-[1280px]:text-sm text-base',
                            useReverseSearchBarColors
                                ? 'text-solid placeholder:text-solid/70'
                                : 'text-on-solid placeholder:text-on-solid/70'
                        )}
                        onFocus={() => {
                            setIsFocused(true);
                            setIsOpen(true);
                        }}
                        onBlur={() => setIsFocused(false)}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {isLoadingOptions && (
                        <LoadingDots
                            className={cn(
                                'ml-2 text-on-solid/50 shrink-0',
                                useReverseSearchBarColors ? 'text-solid/50' : 'text-on-solid/50'
                            )}
                        />
                    )}
                </div>

                {shouldRenderMenu && (
                    <div
                        className={cn(
                            'toastify-z-index absolute bg-solid shadow-xl mt-2 border border-on-solid/20 rounded-[10px] w-full max-h-75 overflow-hidden text-on-solid',
                            !isLoadingOptions && 'xl:min-w-full xl:w-max! xl:max-w-120!'
                        )}
                    >
                        <div
                            id={listBoxId}
                            ref={listBoxRef}
                            role="listbox"
                            className="py-0 outline-none max-h-75 overscroll-contain custom-scrollbar"
                        >
                            {renderMenuContent()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeaderSearchBar;
