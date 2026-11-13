'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import PromoImage from '@/assets/img/promotions/promo05.png';

import { useSite } from '@/providers/SiteProvider';
import useCookie from '@/hooks/useCookie';

import { Dialog, DialogBody, DialogContent } from '@/components/ui/Dialog';

const DELAY_MS = 8000; // 8 seconds

export default function BlackFridayModal() {
    const { getCookie } = useCookie('gc');
    const [copied, setCopied] = useState<boolean>(false);

    const domainInfo = useSite().domainInfo;
    const config = domainInfo?.config;
    const blackFridayConfig = config?.features?.blackFridayModal;

    const isAffiliate = Boolean(useSearchParams().get('aff'));

    const hasShownRef = useRef(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        const modalConfig = config?.features?.blackFridayModal;
        const storageKey = blackFridayConfig?.storageKey;

        if (!modalConfig?.enable || !storageKey || isAffiliate) return;

        const date = new Date();

        if (modalConfig.expiresAt && date > new Date(modalConfig.expiresAt)) return;

        // Check if user has already seen the modal
        const hasSeenModal = localStorage.getItem(storageKey);

        if (hasSeenModal || hasShownRef.current) return;

        // Set timeout to show modal after 8 seconds
        const timer = setTimeout(() => {
            // Check if gc cookie exists after delay (it might take time to be set)
            const gcCookie = getCookie();

            // Don't show modal if gc cookie exists
            if (gcCookie) return;

            if (!hasShownRef.current) {
                setIsOpen(true);
                hasShownRef.current = true;
                // Mark as seen in localStorage
                localStorage.setItem(storageKey, 'true');
            }
        }, DELAY_MS);

        // Cleanup timeout on unmount
        return () => clearTimeout(timer);
    }, [getCookie, config?.features?.blackFridayModal, blackFridayConfig?.storageKey, isAffiliate]);

    const copyCouponCode = async () => {
        if (!blackFridayConfig?.couponCode) return;

        try {
            await navigator.clipboard.writeText(blackFridayConfig.couponCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy coupon code:', err);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent
                classNames={{
                    popup: 'p-0 max-w-lg bg-transparent! shadow-none!',
                }}
            >
                <DialogBody className="p-0">
                    <div
                        className="relative cursor-pointer"
                        onClick={copyCouponCode}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && copyCouponCode()}
                    >
                        {/* Black Friday Image */}
                        <Image
                            src={PromoImage}
                            alt="Let the Concert Season Begin - 10% OFF with code SPRING10"
                            width={720}
                            height={840}
                            className="h-auto w-full rounded-lg shadow-2xl"
                            priority
                        />

                        {/* Copied Feedback */}
                        {copied && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 backdrop-blur-sm">
                                <div className="rounded-full bg-white px-6 py-3 shadow-xl">
                                    <p className="flex items-center gap-2 text-lg font-bold text-green-600">
                                        <span className="text-2xl">Done</span>
                                        Code copied!
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}
