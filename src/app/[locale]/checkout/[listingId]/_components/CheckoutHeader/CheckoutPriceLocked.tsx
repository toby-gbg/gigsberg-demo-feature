'use client';

import { Fragment, useRef, useState } from 'react';
import Image from 'next/image';
import { ClockFading } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useUnmount } from 'react-use';

import { CheckoutStep } from '@/interfaces/Checkout';
import { formatTimer } from '@/utils/common';
import { CHECKOUT_TTL_SECONDS, CHECKOUT_WARNING_THRESHOLD } from '@/constants/checkout';

import { useCountdown } from '@/hooks/useCountDown';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogBody, DialogContent } from '@/components/ui/Dialog';

import { useCheckoutPayment } from '../../_providers/CheckoutPaymentProvider';

export default function CheckoutPriceLocked() {
    // Ref
    const bannerRef = useRef<HTMLDivElement>(null);

    // Translation
    const t = useTranslations();
    const [isOpenModal, setIsOpenModal] = useState(false);

    // External provider
    const { setCurrentStep, releaseTicket, currentMethod } = useCheckoutPayment();

    // Count down
    const { secondsLeft } = useCountdown({
        duration: CHECKOUT_TTL_SECONDS,
        warningAt: CHECKOUT_WARNING_THRESHOLD,
        onWarning: () => {
            bannerRef.current?.setAttribute('data-warning', 'true');
            setIsOpenModal(true);
            new Audio('/checkout/alert.mp3').play();
        },
        onExpire: () => {
            setCurrentStep(CheckoutStep.YOUR_INFORMATION);
        },
    });

    // Release ticket when unmount
    useUnmount(() => {
        if (!currentMethod) releaseTicket(false);
    });

    return (
        <Fragment>
            <div className="bg-white sticky top-0 z-20">
                <div
                    ref={bannerRef}
                    className="bg-[#EBF3FD] data-[warning=true]:bg-red-500/20 transition-colors group"
                >
                    <div className="text-sm font-semibold flex gap-0.5 items-center justify-center text-[#1867C3] p-2 group-data-[warning=true]:text-red-500">
                        <ClockFading size={16} className="mr-0.5" />
                        <p className="hidden md:block">{t('price_locked')}</p>
                        <span className="w-9.5">{formatTimer(secondsLeft)}</span>
                        <p className="md:hidden pl-0.5">{t('left_to_complete')}</p>
                    </div>
                </div>
            </div>

            {/* Warning Modal */}
            <Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
                <DialogContent classNames={{ popup: 'max-w-xl' }}>
                    <DialogBody>
                        <div className="grid place-items-center text-center gap-5">
                            <div className="p-3 bg-red-500/20 rounded-full mt-6">
                                <Image
                                    src="/checkout/waiting.gif"
                                    unoptimized
                                    alt="waiting"
                                    width={40}
                                    height={40}
                                />
                            </div>
                            <div>
                                <p className="text-xl font-semibold">
                                    {t('price_lock_end_in')}{' '}
                                    <span className="w-24 text-red-500">
                                        {formatTimer(secondsLeft)}
                                    </span>
                                </p>
                                <p className="max-w-sm">{t('complete_your_purchase_now')}</p>
                            </div>
                            <Button className="w-full" onClick={() => setIsOpenModal(false)}>
                                {t('continue')}
                            </Button>
                        </div>
                    </DialogBody>
                </DialogContent>
            </Dialog>
        </Fragment>
    );
}
