'use client';

import { FC, ReactNode, useRef } from 'react';
import { useQueryStates } from '@/nuqs/hooks/useQueryStates';
import { searchParamsParsers } from '@/nuqs/params/search';
import { isEqual } from 'lodash-es';
import { useTranslations } from 'next-intl';

import { SearchSource } from '@/interfaces/Search';
import { convertSearchToLabel } from '@/utils/common';

import { useSearchContext, useStableSearchContext } from '@/providers/SearchProvider';

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
const SearchViewTitle: FC = () => {
    const t = useTranslations();
    const {
        intlKey: { title: titleIntlKey },
    } = useStableSearchContext();
    const { filtersValue: filters } = useSearchContext();
    const [{ fromDate, toDate, q: query, proximityDate, from: initialFrom }] =
        useQueryStates(searchParamsParsers);
    const filtersSnapshot = useRef(filters);
    const isInitFilters = isEqual(filters, filtersSnapshot.current);
    const isInitDates =
        fromDate &&
        fromDate === filtersSnapshot.current.fromDate &&
        toDate &&
        toDate === filtersSnapshot.current.toDate;
    const searchQuery = convertSearchToLabel(filters?.query ?? query ?? '');
    const proximityDateStr = proximityDate ? t(proximityDate) : '';

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
                    (initialFrom === SearchSource.LAST_MINUTE
                        ? t('last_minute_events')
                        : t('trending_events'))}
            </Title>
        );
    }

    return <Title>{t('event_ticket_result_only')}</Title>;
};

export default SearchViewTitle;
