'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';

import { useDebounce } from '@/hooks/useDebounce';

import MainContainer from '@/components/MainContainer';

import useTranslationHelp from '../../_hooks/useTranslationHelp';
import { useFaqContext } from '../../_providers/FaqContext';
import FAQMenu from './FaqMenu';
import FAQSection from './FaqSection';

export default function FaqView() {
    const t = useTranslations();
    const elements = useTranslationHelp();
    const { selectedTab, searchValue } = useFaqContext();

    //First tab is 'All', so if first tab selected -> show all elements
    const displayElements = selectedTab === 0 ? elements : [elements[selectedTab - 1]];

    const normalizedSearch = searchValue.trim().toLowerCase();

    const hasNoResults =
        normalizedSearch.length > 0 &&
        !displayElements.some((category) =>
            category.elements.some((faq) =>
                faq.question?.toString().toLowerCase().includes(normalizedSearch)
            )
        );

    const debouncedTrackNoResults = useDebounce((searchTerm: string) => {
        GoogleAnalyticsTracker.triggerGA4Event({
            event: 'faq_search_no_results',
            data: { search_term: searchTerm },
        });
    }, 200);

    useEffect(() => {
        if (hasNoResults) {
            debouncedTrackNoResults(normalizedSearch);
        }
    }, [debouncedTrackNoResults, hasNoResults, normalizedSearch]);

    return (
        <div className="relative">
            <FAQMenu items={elements} />

            <MainContainer>
                {hasNoResults ? <p className="text-center italic">{t('faq_no_results')}</p> : null}
                <div className="mb-5 flex flex-col gap-y-5 z-2">
                    {displayElements.map((props) => (
                        <FAQSection key={props.title?.toString()} item={props} />
                    ))}
                </div>
            </MainContainer>
        </div>
    );
}
