import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { fallbackTranslation } from '@/utils/common';

import { useSite } from '@/providers/SiteProvider';

import { CarouselItem } from '@/components/carousel/CarouselItem';
import { CarouselSection } from '@/components/carousel/CarouselSection';
import MainContainer from '@/components/MainContainer';

import { useFaqContext } from '../../_providers/FaqContext';
import { FAQCategory } from '../../_types/faq';

export default function FAQMenu({ items }: { items: FAQCategory[] }) {
    const t = useTranslations();
    const { selectedTab, setSelectedTab } = useFaqContext();
    const domainInfo = useSite().domainInfo;

    const tabs = [
        {
            title: fallbackTranslation(t('all'), 'all', 'All'),
            value: 0,
        },
        ...items.map((item, index) => ({
            title: item.title,
            value: index + 1,
        })),
    ];

    return (
        <div
            className={cn(
                'sticky top-0 z-5 py-2 border-b border-neutral-400 mt-1 mb-5',
                domainInfo?.config.features?.useThemeBackground ? 'bg-main-start' : 'bg-zinc-100'
            )}
        >
            <MainContainer>
                <div className="md:hidden">
                    <select
                        id="tabs"
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pr-8 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        defaultValue={selectedTab}
                        onChange={(e) => setSelectedTab(Number(e.target.value))}
                    >
                        <option value={0}>{fallbackTranslation(t('all'), 'all', 'All')}</option>
                        {items.map((element, index) => (
                            <option
                                key={element.title?.toString()}
                                value={index + 1}
                                onClick={() =>
                                    GoogleAnalyticsTracker.triggerGA4Event({
                                        event: 'faq_category_filter',
                                        data: { category: element.title?.toString() },
                                    })
                                }
                            >
                                {element.title}
                            </option>
                        ))}
                    </select>
                </div>

                <CarouselSection classNames={{ actions: 'hidden', layout: 'hidden md:block' }}>
                    {tabs.map((tab) => {
                        const isSelected = selectedTab === tab.value;

                        return (
                            <CarouselItem key={tab.value} className="w-fit! focus-within:z-10">
                                <button
                                    className={cn(
                                        'inline-block w-fit whitespace-nowrap px-4 py-2.5 focus:outline-none border border-neutral-300 rounded-full me-2 hover:border-primary hover:bg-white',
                                        isSelected
                                            ? domainInfo?.config.features?.useReverseSearchBarColors
                                                ? 'text-on-header bg-gradient hover:text-on-header'
                                                : 'bg-solid text-on-solid hover:bg-solid'
                                            : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-black'
                                    )}
                                    onClick={() => setSelectedTab(tab.value)}
                                >
                                    {tab.title}
                                </button>
                            </CarouselItem>
                        );
                    })}
                </CarouselSection>
            </MainContainer>
        </div>
    );
}
