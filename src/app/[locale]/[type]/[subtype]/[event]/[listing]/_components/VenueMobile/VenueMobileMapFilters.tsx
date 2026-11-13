'use client';

import { FC, useMemo, useState } from 'react';
import { useQueryStates } from '@/nuqs/hooks/useQueryStates';
import { Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useListing } from '@/providers/ListingProvider';

import { Button } from '@/components/ui/Button';
import {
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/Drawer';

import { listingParamsParsers } from '../../_searchParams';
import TicketListFilters, { TicketListFiltersProps } from '../TicketListFilters';

const VenueMobileMapFilters: FC<Omit<TicketListFiltersProps, 'mode'>> = ({
    metadata,
    ...props
}) => {
    const t = useTranslations();
    const [isOpen, setIsOpen] = useState(false);
    const [_, handleSetParams] = useQueryStates(listingParamsParsers, {
        shallow: true,
    });
    const handleOpenDrawer = () => setIsOpen(true);
    const handleCloseDrawer = () => setIsOpen(false);

    // Listing provider
    const { filters, onResetFilters } = useListing();

    const hasActiveFilters = useMemo(() => {
        return (
            (filters.number_of_tickets && filters.number_of_tickets.length > 0) ||
            (filters.categories && filters.categories.length > 0) ||
            (filters.ticket_type && filters.ticket_type.length > 0) ||
            (filters.min_price && filters.min_price !== metadata?.min_price) ||
            (filters.max_price && filters.max_price !== metadata?.max_price)
        );
    }, [filters, metadata]);

    return (
        <div>
            <Button
                aria-label={t('filters')}
                onClick={handleOpenDrawer}
                className={'z-50 size-12.5 rounded-full! text-xl text-white'}
            >
                <Filter size={24} aria-hidden />
            </Button>
            <Drawer open={isOpen} onOpenChange={setIsOpen} modal={false} swipeDirection="up">
                <DrawerContent
                    classNames={{
                        viewport: 'z-10000 md:hidden!',
                        popup: 'rounded-b-2xl! px-6 pt-6 pb-5 z-10000',
                        content: 'rounded-none! overflow-visible',
                    }}
                >
                    <DrawerHeader>
                        <DrawerTitle>{t('filters')}</DrawerTitle>
                    </DrawerHeader>
                    <DrawerBody className="mt-2 overflow-visible py-4">
                        <TicketListFilters mode="mobile" metadata={metadata} {...props} />
                    </DrawerBody>
                    <DrawerFooter>
                        {hasActiveFilters && (
                            <Button
                                className="ms-auto min-w-35"
                                onClick={() => {
                                    onResetFilters();
                                    handleSetParams({ quantity: null });
                                    window.dispatchEvent(new CustomEvent('CLOSE_MODAL_3D_MAP'));
                                }}
                            >
                                {t('reset_filters')}
                            </Button>
                        )}
                        <Button variant="destructive" onClick={handleCloseDrawer} className="w-35">
                            {t('close')}
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
};

export default VenueMobileMapFilters;
