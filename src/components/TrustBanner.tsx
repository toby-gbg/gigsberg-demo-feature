'use client';

import { useEffect, useId, useState } from 'react';
import Image from 'next/image';
import { usePathname, useSelectedLayoutSegments } from 'next/navigation';
import { useTranslations } from 'next-intl';

import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';

import { useSite } from '@/providers/SiteProvider';

import { Separator } from '@/components/ui/Separator';

import Link from './Link';

const ShopperApprovedLogo = ({ className }: { className?: string }) => {
    return (
        <Image
            alt="Logo of Shopper Approved"
            src="/logo/shopper_approved.avif"
            width={120}
            height={20}
            className={className}
        />
    );
};

type StarVariant = 'filled' | 'half' | 'outline';

interface StarProps {
    variant?: StarVariant;
    size?: number;
    className?: string;
}

const Star = ({ variant = 'filled', size = 20, className = '' }: StarProps) => {
    const id = useId();
    const path =
        'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';

    if (variant === 'filled') {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                className={className}
                aria-hidden="true"
            >
                <path d={path} fill="currentColor" />
            </svg>
        );
    }

    if (variant === 'outline') {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                className={className}
                aria-hidden="true"
            >
                <path
                    d={path}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }

    const clipPathId = `half-star-${id}`;

    // half
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={className}
            aria-hidden="true"
        >
            <defs>
                <clipPath id={clipPathId}>
                    <rect x="0" y="0" width="12" height="24" />
                </clipPath>
            </defs>

            {/* outline */}
            <path
                d={path}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />

            {/* left half filled */}
            <path d={path} fill="currentColor" clipPath={`url(#${clipPathId})`} />
        </svg>
    );
};

const TrustBanner = () => {
    const t = useTranslations();
    const pathname = usePathname();
    const domainInfo = useSite().domainInfo;

    const [mobileBlockIndex, setMobileBlockIndex] = useState(0);

    const segments = useSelectedLayoutSegments();
    const isCheckout = pathname.includes('/checkout') || segments.includes('checkout');

    //Start a timer to rotate content every 8s
    useEffect(() => {
        const interval = setInterval(() => {
            setMobileBlockIndex((currentIndex) => (currentIndex + 1) % 3);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    //Send analytics to Google on first render
    useEffect(() => {
        GoogleAnalyticsTracker.triggerEvent('social_proof_view');
    }, []);

    if (isCheckout) return null;

    if (!domainInfo?.config.features?.showTrustBanner) return null;

    const handleClickShopperApprovedLink = () => {
        GoogleAnalyticsTracker.triggerEvent('social_proof_reviews_click');
    };

    const firstBlock = (
        <p className="flex justify-center items-center gap-2 text-center">
            {t.rich('rated_by', {
                status: t('excellent'),
                strong: (chunks) => <span className="font-semibold">{chunks}</span>,
            })}
            <Link
                href="https://www.shopperapproved.com/reviews/gigsberg.com"
                target="_blank"
                className="flex items-center gap-1"
                onClick={handleClickShopperApprovedLink}
            >
                <ShopperApprovedLogo className="w-auto h-5" />
                <span className="text-lg">®</span>
            </Link>
        </p>
    );

    const secondBlock = (
        <p className="flex justify-center items-center gap-2 font-semibold text-center">
            <span>4.6</span>

            <span className="flex gap-1 text-orange-500">
                <Star />
                <Star />
                <Star />
                <Star />
                <Star variant="half" />
            </span>

            <Link
                href="https://www.shopperapproved.com/reviews/gigsberg.com"
                target="_blank"
                className="font-normal text-gray-600 underline"
                onClick={handleClickShopperApprovedLink}
            >
                ({t('review_count')})
            </Link>
        </p>
    );

    const thirdBlock = (
        <Link
            href="/terms-and-conditions"
            className="flex gap-2 text-center whitespace-nowrap underline"
            onClick={() =>
                GoogleAnalyticsTracker.triggerGA4Event({
                    event: 'trust_bar_protection_click',
                    data: { domain: domainInfo?.domain },
                })
            }
        >
            {t.rich('every_ticket_protected', {
                strong: (chunks) => <span className="font-black">{chunks}</span>,
            })}
        </Link>
    );

    const mobileBlocks = [firstBlock, secondBlock, thirdBlock];

    return (
        <div className="bg-white w-full text-gray-700 text-sm">
            {/* Mobile */}
            <div className="xl:hidden flex justify-center items-center h-5 min-h-10 transition-opacity duration-500">
                {mobileBlocks[mobileBlockIndex]}
            </div>

            {/* Desktop */}
            <div className="hidden xl:flex justify-around items-center mx-auto py-1.5 max-w-[60vw]">
                {firstBlock}

                <Separator orientation="vertical" className="bg-gray-300 h-6" />

                {secondBlock}

                <Separator orientation="vertical" className="bg-gray-300 h-6" />

                {thirdBlock}
            </div>
        </div>
    );
};

export default TrustBanner;
