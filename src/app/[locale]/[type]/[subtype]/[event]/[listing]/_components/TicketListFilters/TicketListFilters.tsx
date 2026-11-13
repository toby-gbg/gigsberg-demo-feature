'use client';

import { useCallback, useMemo } from 'react';
import { Crown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { EventDetail } from '@/interfaces/Event';
import { ListingMetadata } from '@/interfaces/Listing';
import { cn } from '@/lib/cn';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { LISTING_CARD_HOVERED, LISTING_CARD_UNHOVERED } from '@/lib/venue-viewer';
import { convertTicketTypeToId } from '@/utils/ticketType.util';

import { useListing } from '@/providers/ListingProvider';
import { useSite } from '@/providers/SiteProvider';
import useTicketTypes from '@/hooks/useTicketType';

import PriceRangeSlider from '@/components/PriceRangeSlider';
import { Button } from '@/components/ui/Button';

import { useFilterCategories } from '../../_hooks/useFilterCategories';
import { QUANTITY_OPTIONS, toggleValue } from '../../_utils/listing-filter.util';
import FilterDropdown from './FilterDropdown';
import FilterOption from './FilterOption';

export interface TicketListFiltersProps {
    metadata: ListingMetadata;
    isMetadataFetching: boolean;
    eventTicketTypes?: EventDetail['ticketTypes'];
    mode?: 'desktop' | 'mobile';
    currencyCode: string;
}

export default function TicketListFilters({
    metadata,
    mode = 'desktop',
    eventTicketTypes,
    currencyCode,
}: TicketListFiltersProps) {
    const t = useTranslations();
    const { filters, setFilters, onResetFilters } = useListing();
    const { config } = useSite().domainInfo || {};
    const useThemeBackground = config?.features?.useThemeBackground || false;
    const ticketTypes = useTicketTypes(eventTicketTypes);

    const priceRange = useMemo<[number, number]>(
        () => [
            metadata.min_price ? Math.floor(metadata.min_price) : 0,
            metadata.max_price ? Math.ceil(metadata.max_price) : 0,
        ],
        [metadata.min_price, metadata.max_price]
    );
    const hasPriceRange =
        priceRange[0] >= 0 &&
        priceRange[1] >= 0 &&
        Math.round(metadata.min_price ?? 0) < Math.round(metadata.max_price ?? 0);

    const { casualCategories, selectedCasualIds, selectedVipIds, vipCategories, vipCategoryNames } =
        useFilterCategories(metadata.categories, filters.categories);

    const hasActiveFilters =
        filters.number_of_tickets?.[0] !== undefined ||
        Boolean(filters.categories?.length) ||
        Boolean(filters.ticket_type?.length) ||
        filters.min_price != null ||
        filters.max_price != null ||
        Boolean(filters.blocks?.length);

    const handleVipChange = useCallback(
        (categoryId: string) => {
            const nextVipIds = toggleValue(selectedVipIds, categoryId);
            const nextCategories = [...nextVipIds, ...selectedCasualIds];

            if (nextVipIds.length > selectedVipIds.length) {
                GoogleAnalyticsTracker.triggerEvent('vip_filter_applied', {
                    vip_types: nextVipIds.map((id) => vipCategoryNames.get(id) ?? id),
                    result_count: metadata.total_tickets ?? 0,
                });
            } else if (nextVipIds.length === 0) {
                GoogleAnalyticsTracker.triggerEvent('vip_filter_cleared');
            }

            setFilters((previous) => ({
                ...previous,
                categories: nextCategories.length ? nextCategories : undefined,
                blocks: undefined,
                page: 1,
                skip: false,
            }));
        },
        [metadata.total_tickets, selectedCasualIds, selectedVipIds, setFilters, vipCategoryNames]
    );

    const handleCasualChange = useCallback(
        (categoryId: string) => {
            const nextCasualIds = toggleValue(selectedCasualIds, categoryId);
            const nextCategories = [...selectedVipIds, ...nextCasualIds];
            setFilters((previous) => ({
                ...previous,
                categories: nextCategories.length ? nextCategories : undefined,
                blocks: undefined,
                page: 1,
                skip: false,
            }));
        },
        [selectedCasualIds, selectedVipIds, setFilters]
    );

    const handleReset = () => {
        if (selectedVipIds.length) GoogleAnalyticsTracker.triggerEvent('vip_filter_cleared');
        onResetFilters();
        // handleSetParams({ quantity: null });
        window.dispatchEvent(new CustomEvent('CLOSE_MODAL_3D_MAP'));
    };

    const onHoverHighlight = (categoryId: string, categoryName: string) => {
        if (!categoryId) return;
        window.dispatchEvent(
            new CustomEvent(LISTING_CARD_HOVERED, {
                detail: {
                    categoryName,
                    categoryId,
                },
            })
        );
    };

    const onRestoreHighlight = () => {
        window.dispatchEvent(new CustomEvent(LISTING_CARD_UNHOVERED));
    };

    return (
        <div
            className={cn('@container flex-col gap-y-2 mt-1 md:px-5 md:pt-2 lg:pt-0', {
                'hidden md:flex': mode === 'desktop',
                flex: mode === 'mobile',
            })}
        >
            <div
                className={cn('grid gap-2 @sm:grid-cols-2', {
                    '@md:grid-cols-2':
                        (metadata.categories?.length ?? 0) === 0 ||
                        (casualCategories.length > 0 && vipCategories.length > 0),
                    '@md:grid-cols-3':
                        (casualCategories.length > 0 && vipCategories.length === 0) ||
                        (casualCategories.length === 0 && vipCategories.length > 0),
                    '@2xl:grid-cols-4': casualCategories.length > 0 && vipCategories.length > 0,
                })}
            >
                <FilterDropdown
                    title={t('quantity')}
                    active={filters.number_of_tickets?.[0] !== undefined}
                    activeLabel={
                        filters.number_of_tickets?.[0] !== undefined
                            ? `${filters.number_of_tickets[0]} ${t('ticket', { count: filters.number_of_tickets[0] })}`
                            : undefined
                    }
                    contentClassName="max-h-sm"
                >
                    {QUANTITY_OPTIONS.map((quantity) => {
                        const isSelected = filters.number_of_tickets?.[0] === quantity;
                        return (
                            <FilterOption
                                key={quantity}
                                label={`${quantity} ${t('ticket', { count: quantity })}`}
                                checked={isSelected}
                                onCheckedChange={() => {
                                    setFilters((previous) => ({
                                        ...previous,
                                        number_of_tickets: isSelected
                                            ? undefined
                                            : [
                                                  quantity,
                                                  `${quantity} ${t('ticket', { count: quantity })}`,
                                              ],
                                        page: 1,
                                        skip: false,
                                    }));
                                    // handleSetParams({
                                    //     quantity: isSelected ? null : quantity,
                                    // });
                                }}
                            />
                        );
                    })}
                </FilterDropdown>

                {vipCategories.length > 0 && (
                    <FilterDropdown
                        title={t('vip')}
                        active={selectedVipIds.length > 0}
                        activeCount={selectedVipIds.length}
                        icon={Crown}
                        iconClassName="fill-yellow-500 text-yellow-500"
                        className="font-bold text-yellow-500"
                        onOpenChange={(open) => {
                            if (open) GoogleAnalyticsTracker.triggerEvent('vip_filter_opened');
                        }}
                    >
                        {vipCategories.map((category) => (
                            <FilterOption
                                key={category.category_id}
                                label={category.name}
                                checked={selectedVipIds.includes(String(category.category_id))}
                                onCheckedChange={() =>
                                    handleVipChange(String(category.category_id))
                                }
                            />
                        ))}
                    </FilterDropdown>
                )}

                {casualCategories.length > 0 && (
                    <FilterDropdown
                        title={t('categories')}
                        active={selectedCasualIds.length > 0}
                        activeCount={selectedCasualIds.length}
                    >
                        {casualCategories.map((category) => (
                            <FilterOption
                                key={category.category_id}
                                label={category.name}
                                checked={selectedCasualIds.includes(String(category.category_id))}
                                onCheckedChange={() =>
                                    handleCasualChange(String(category.category_id))
                                }
                                onHoverHighlight={() =>
                                    onHoverHighlight(category.category_id, category.name)
                                }
                                onRestoreHighlight={onRestoreHighlight}
                            />
                        ))}
                    </FilterDropdown>
                )}

                <FilterDropdown
                    title={t('type_of_ticket')}
                    active={Boolean(filters.ticket_type?.length)}
                    activeCount={filters.ticket_type?.length}
                >
                    {ticketTypes.map((type) => {
                        const id = convertTicketTypeToId(type.value);
                        const isSelected = Boolean(
                            filters.ticket_type?.some(([value]) => value === id)
                        );

                        return (
                            <FilterOption
                                key={id}
                                label={type.label}
                                checked={isSelected}
                                onCheckedChange={() => {
                                    setFilters((previous) => {
                                        const selectedTicketTypes = previous.ticket_type ?? [];
                                        const selectedAtUpdate = selectedTicketTypes.some(
                                            ([value]) => value === id
                                        );

                                        return {
                                            ...previous,
                                            ticket_type: selectedAtUpdate
                                                ? selectedTicketTypes.filter(
                                                      ([value]) => value !== id
                                                  )
                                                : [...selectedTicketTypes, [id, type.label]],
                                            page: 1,
                                            skip: false,
                                        };
                                    });
                                }}
                            />
                        );
                    })}
                </FilterDropdown>
            </div>

            <div className="z-10 items-center gap-2 grid grid-cols-1 md:grid-cols-2 rounded-md">
                {hasPriceRange && (
                    <PriceRangeSlider
                        priceRange={priceRange}
                        currentValue={[
                            filters.min_price ?? Math.floor(metadata.min_price ?? 0),
                            filters.max_price ?? Math.ceil(metadata.max_price ?? 0),
                        ]}
                        onChange={(value: number | number[]) => {
                            if (!Array.isArray(value)) return;
                            const [minPrice, maxPrice] = value;
                            const isFullRange =
                                minPrice <= Math.floor(metadata.min_price ?? 0) &&
                                maxPrice >= Math.ceil(metadata.max_price ?? 0);

                            setFilters((previous) => ({
                                ...previous,
                                min_price: isFullRange ? undefined : minPrice,
                                max_price: isFullRange ? undefined : maxPrice,
                                page: 1,
                                skip: false,
                            }));
                        }}
                        currencyCode={currencyCode}
                    />
                )}
                {hasActiveFilters && (
                    <Button
                        className={cn(
                            'hidden md:flex md:col-start-2 ms-auto px-3 py-1.5 h-auto min-h-9.5',
                            useThemeBackground && 'text-on-header'
                        )}
                        onClick={handleReset}
                    >
                        {t('reset_filters')}
                    </Button>
                )}
            </div>
        </div>
    );
}
