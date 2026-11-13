'use client';

import { useState } from 'react';
import { ClassValue } from 'clsx';
import { Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';

import { Button } from '@/components/ui/Button';
import { Drawer, DrawerBody, DrawerContent, DrawerFooter } from '@/components/ui/Drawer';

import { EventFiltersForm, type EventFiltersFormProps } from './EventFiltersForm';

type EventFiltersMobileProps = EventFiltersFormProps & {
    className?: ClassValue;
};

export const EventFiltersMobile = ({ className, ...props }: EventFiltersMobileProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const t = useTranslations();
    const filtersLabel = fallbackTranslation(t('filters_label'), 'filters_label', 'Filters');

    return (
        <div
            data-mobile-bottom-control
            className={cn('fixed bottom-4 left-4 z-300 m-0! md:hidden', className)}
        >
            <Button
                aria-label={filtersLabel}
                onClick={() => setIsOpen(true)}
                className="z-50 size-12.5 rounded-full text-xl"
                isIconOnly
                prefixIcon={<Filter size={24} aria-hidden />}
            />
            <Drawer open={isOpen} onOpenChange={setIsOpen} modal={false} swipeDirection="up">
                <DrawerContent
                    classNames={{
                        viewport: 'z-9999 md:hidden!',
                        popup: 'px-6 pt-6 pb-5 rounded-b-2xl! bg-zinc-100',
                        content: 'rounded-none!',
                    }}
                >
                    <DrawerBody>
                        <EventFiltersForm {...props} />
                    </DrawerBody>
                    <DrawerFooter>
                        <Button onClick={() => setIsOpen(false)}>
                            {fallbackTranslation(t('close'), 'close', 'Close')}
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
};
