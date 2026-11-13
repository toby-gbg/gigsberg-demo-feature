'use client';

import { useEffect, useState } from 'react';
import { CountryCode } from 'libphonenumber-js';
import { useTranslations } from 'next-intl';

import { StudentDiscountEmbedInfo } from '@/interfaces/StudentDiscount';
import { cn } from '@/lib/cn';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import {
    DEFAULT_STUDENT_DISCOUNT_EMBED_SRC,
    STUDENT_DISCOUNT_EMBED_SOURCES,
} from '@/constants/student-discount';

import FallbackImage from '@/components/FallbackImage';
import { Skeleton } from '@/components/ui/Skeleton';

interface Props {
    countryCode: CountryCode;
}

export default function DiscountSelector({ countryCode }: Props) {
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);
    const [loaded, setLoaded] = useState(true);
    const t = useTranslations();

    const DISCOUNT_LIST: StudentDiscountEmbedInfo[] =
        STUDENT_DISCOUNT_EMBED_SOURCES[countryCode] || DEFAULT_STUDENT_DISCOUNT_EMBED_SRC;

    useEffect(() => {
        if (countryCode) {
            GoogleAnalyticsTracker.triggerStudentDiscountPageView('student_discount_page_view', {
                country_code: countryCode,
            });
        }
    }, [countryCode]);

    const showTabs = DISCOUNT_LIST.length > 1;

    return (
        <div className="mx-auto max-w-[1376px] overflow-hidden rounded-[12px] border border-[#d5d3cb]">
            {showTabs && (
                <div className="flex overflow-auto border-b border-b-[#d5d3cb]">
                    {DISCOUNT_LIST.map((discount: StudentDiscountEmbedInfo, index: number) => (
                        <div
                            key={`${discount.name}-tab`}
                            className={cn(
                                'flex min-w-[178px] flex-1 cursor-pointer items-center justify-center gap-1 p-3 md:min-w-[239px] md:p-4',
                                {
                                    'bg-white': selectedTabIndex === index,
                                }
                            )}
                            onClick={() => {
                                if (selectedTabIndex !== index) {
                                    setSelectedTabIndex(index);
                                    setLoaded(false);
                                }
                            }}
                        >
                            <div className="overflow-hidden rounded-md">
                                <FallbackImage
                                    src={new URL(DISCOUNT_LIST[index].src).origin + '/favicon.ico'}
                                    fallbackImage="/favicon.ico"
                                    width={28}
                                    height={28}
                                    alt={discount.name}
                                    className="size-6 md:h-7 md:w-7"
                                />
                            </div>
                            <p
                                className={cn('text-[13px] font-medium md:text-sm', {
                                    'text-gray-500': selectedTabIndex !== index,
                                })}
                            >
                                {t(discount.name)}
                            </p>
                        </div>
                    ))}
                </div>
            )}
            <div className="relative w-full">
                {!loaded && (
                    <div className="absolute z-10 h-full w-full">
                        <Skeleton className="h-full w-full" />
                    </div>
                )}
                <iframe
                    width="100%"
                    height="700"
                    key={DISCOUNT_LIST[selectedTabIndex]?.src}
                    src={DISCOUNT_LIST[selectedTabIndex]?.src}
                    title={DISCOUNT_LIST[selectedTabIndex]?.title}
                    style={{
                        boxShadow: '0 0 15px rgba(0,0,0,.2)',
                    }}
                    onLoad={() => setLoaded(true)}
                    className="block max-w-[1376px] overflow-hidden border-none shadow-md"
                    scrolling="no"
                    loading="lazy"
                />
            </div>
        </div>
    );
}
