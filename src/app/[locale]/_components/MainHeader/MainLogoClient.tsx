'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';

import { WhiteLabelConfig } from '@/interfaces/WhiteLabel';
import { toggleMobileMenu } from '@/stores/modal';
import { cn } from '@/lib/cn';

import { useSite } from '@/providers/SiteProvider';

import Link from '@/components/Link';

interface MainLogoClientProps {
    config?: WhiteLabelConfig;
}

const MainLogoClient = ({ config }: MainLogoClientProps) => {
    const locale = useLocale();
    const website = useSite().website;
    const logo = website?.logo ?? '';
    const logoEs = website?.logo_es;

    const useBrandStyling = config?.features?.useBrandStyling;
    const useSpanishLogo = config?.features?.useSpanishLogo ?? true;
    const logoSrc = useSpanishLogo && locale.includes('es') ? logoEs || logo : logo;

    return (
        <Link
            prefetch={false}
            href="/"
            className="cursor-pointer"
            onClick={(e) => {
                e.stopPropagation();
                toggleMobileMenu(false);
            }}
        >
            <div
                className={cn(
                    'relative max-[1279px]:w-40 min-[1475px]:w-32! min-[1536px]:w-34! xl:w-28 h-16 shrink-0',
                    useBrandStyling && 'pb-4!'
                )}
            >
                <Image
                    src={logoSrc}
                    alt="Logo"
                    quality={50}
                    className="object-center object-contain origin-center"
                    fill
                />
            </div>
        </Link>
    );
};

export default MainLogoClient;
