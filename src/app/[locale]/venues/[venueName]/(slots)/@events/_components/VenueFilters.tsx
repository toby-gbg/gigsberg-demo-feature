'use client';

import { useState } from 'react';
import { useQueryStates } from '@/nuqs/hooks/useQueryStates';
import { Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { fallbackTranslation } from '@/utils/common';
import { formatDateToISODate, isoDateToDate } from '@/utils/date';

import DateRangePickerSelect from '@/components/DateRangePickerSelect';
import EventFiltersHeader from '@/components/event-filters/EventFiltersHeader';
import { Button } from '@/components/ui/Button';
import { Drawer, DrawerBody, DrawerContent, DrawerFooter } from '@/components/ui/Drawer';

import { venueSearchParamsParsers } from '../_searchParams';

const VenueFiltersContent = () => {
    const [searchParams, setSearchParams] = useQueryStates(venueSearchParamsParsers);
    const hasActiveFilters = Object.values(searchParams).some((value) => value != null);
    const resetFilters = () => {
        setSearchParams(null);
    };
    return (
        <div className="space-y-5">
            <EventFiltersHeader
                classNames={{ header: 'md:hidden' }}
                hasActiveFilters={hasActiveFilters}
                resetFilters={resetFilters}
            />
            <div className="border border-neutral-300 rounded-md">
                <DateRangePickerSelect
                    value={{
                        from: searchParams.fromDate
                            ? isoDateToDate(searchParams.fromDate)
                            : undefined,
                        to: searchParams.toDate ? isoDateToDate(searchParams.toDate) : undefined,
                    }}
                    classNames={{ trigger: 'h-10' }}
                    onChange={(range) => {
                        if (!range) {
                            setSearchParams({ fromDate: null, toDate: null });
                            return;
                        }

                        setSearchParams({
                            fromDate: formatDateToISODate(range?.from) ?? null,
                            toDate: formatDateToISODate(range?.to) ?? null,
                        });
                    }}
                />
            </div>
        </div>
    );
};

const VenueFilters = () => {
    const [isOpen, setIsOpen] = useState(false);
    const t = useTranslations();

    return (
        <>
            <div className="hidden md:block">
                <VenueFiltersContent />
            </div>
            <div className="fixed bottom-4 left-4 z-300 m-0! md:hidden">
                <Button
                    onClick={() => setIsOpen(true)}
                    className="z-50 size-12.5 rounded-full text-xl"
                >
                    <Filter size={24} aria-hidden />
                </Button>
                <Drawer open={isOpen} onOpenChange={setIsOpen} modal={false} swipeDirection="up">
                    <DrawerContent
                        classNames={{
                            viewport: 'z-9999',
                            content: 'rounded-none',
                        }}
                    >
                        <DrawerBody>
                            <VenueFiltersContent />
                        </DrawerBody>
                        <DrawerFooter>
                            <Button onClick={() => setIsOpen(false)}>
                                {fallbackTranslation(t('close'), 'close', 'Close')}
                            </Button>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>
        </>
    );
};

export default VenueFilters;
