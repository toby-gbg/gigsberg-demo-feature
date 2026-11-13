'use client';

import { FC, ReactNode, useRef } from 'react';
import { isEqual } from 'lodash-es';
import { useTranslations } from 'next-intl';

import { EventSearchFilters } from '@/interfaces/Event';
import { convertNameUrlToLabel } from '@/utils/common';

interface SearchViewTitleProps {
    filters: EventSearchFilters;
    query: string | null;
    titleIntlKey: string;
    initialFrom?: string;
    initialProximity?: string;
}

const Title = ({ children }: { children: ReactNode }) => (
    <h1 className="w-full font-medium text-3xl wrap-break-word">{children}</h1>
);

/**
 * H1 title for the search page.
 *
 * When `titleIntlKey` resolves to `event_ticket_result`, the title is wrapped
 * with the active query (or filter name) in quotes — matches the original
 * UX where the search query is rendered next to the static label.
 */
const SearchViewTitle: FC<SearchViewTitleProps> = ({
    titleIntlKey,
    filters,
    query,
    initialFrom,
    initialProximity,
}) => {
    const t = useTranslations();
    const filtersSnapshot = useRef(filters);
    const isInitFilters = isEqual(filters, filtersSnapshot.current);
    const isInitDates =
        filters.fromDate &&
        filters.fromDate === filtersSnapshot.current.fromDate &&
        filters.toDate &&
        filters.toDate === filtersSnapshot.current.toDate;
    const searchQuery = convertNameUrlToLabel(filters.name ?? query ?? '');
    const proximityDateStr = initialProximity ? t(initialProximity) : '';

    // search result with a query
    if (searchQuery && titleIntlKey === 'event_ticket_result') {
        return (
            <Title>
                {t(titleIntlKey)} &quot;{searchQuery}&quot;
            </Title>
        );
    }

    // special cases
    if (initialFrom && (isInitFilters || isInitDates)) {
        return (
            <Title>
                {t(titleIntlKey)}{' '}
                {proximityDateStr ||
                    (initialFrom === 'lastminute' ? t('last_minute_events') : t('trending_events'))}
            </Title>
        );
    }

    return <Title>{t('event_ticket_result_only')}</Title>;
};

export default SearchViewTitle;
