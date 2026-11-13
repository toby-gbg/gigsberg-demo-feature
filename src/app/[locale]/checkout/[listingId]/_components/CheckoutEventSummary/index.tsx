'use client';

import { useEffect, useState } from 'react';
import { XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMedia } from 'react-use';

import { Button } from '@/components/ui/Button';
import {
    Drawer,
    DrawerBody,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/Drawer';

import CheckoutGuarantee from '../CheckoutGuarantee';
import CheckoutTitle from '../CheckoutTitle';
import CheckoutEventInfo from './CheckoutEventInfo';
import CheckoutSlider from './CheckoutSlider';
import CheckoutThumbnail from './CheckoutThumbnail';
import CheckoutTicketDetails from './CheckoutTicketDetails';

export default function CheckoutEventSummary() {
    const t = useTranslations();

    const [isOpen, setIsOpen] = useState(false);

    const handleOpenDrawer = () => setIsOpen(true);

    const isMobile = useMedia('(max-width: 767px)', false);

    // Close drawer if resized to desktop
    useEffect(() => {
        if (!isMobile && isOpen) {
            setIsOpen(false);
        }
    }, [isMobile, isOpen]);

    return (
        <div className="space-y-3">
            <div className="md:hidden md:mt-4 pt-8">
                <CheckoutTitle />
            </div>

            <div className="shadow-xs border border-border rounded-2xl overflow-hidden">
                <div className="hidden md:block">{!isMobile && <CheckoutSlider />}</div>

                <div className="space-y-2 p-4">
                    <div
                        className="flex justify-between gap-2"
                        onClick={isMobile ? handleOpenDrawer : undefined}
                    >
                        <CheckoutEventInfo />
                        <div className="md:hidden relative rounded-lg size-20 overflow-hidden shrink-0">
                            <CheckoutThumbnail sizes="80px" />
                        </div>
                    </div>

                    <div className="hidden md:block space-y-2">
                        <div className="bg-dash-line w-full h-px" />
                        <CheckoutTicketDetails />
                    </div>

                    <Button
                        className="md:hidden bg-foreground-100 text-sm text-black w-full"
                        onClick={handleOpenDrawer}
                    >
                        {t('more_details')}
                    </Button>
                </div>
            </div>

            {/* Mobile drawer */}
            <Drawer open={isOpen} onOpenChange={setIsOpen} swipeDirection="down">
                <DrawerContent classNames={{ popup: 'px-4 pt-4 pb-0' }}>
                    <DrawerHeader className="pb-4">
                        <div className="flex justify-between items-center">
                            <DrawerTitle className="capitalize">{t('selected_event')}</DrawerTitle>
                            <DrawerClose>
                                <XIcon />
                            </DrawerClose>
                        </div>
                    </DrawerHeader>
                    <DrawerBody className="space-y-2 pb-4">
                        <CheckoutEventInfo hideDetails />

                        <div className="rounded-xl overflow-hidden shrink-0">
                            {isMobile && <CheckoutSlider />}
                        </div>

                        <CheckoutTicketDetails />

                        <hr className="border" />

                        <CheckoutGuarantee />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
