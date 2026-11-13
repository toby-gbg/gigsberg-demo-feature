'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useSelectedLayoutSegment } from 'next/navigation';
import { useTranslations } from 'next-intl';

import GigsbergDarkSrc from '@/assets/img/gigsberg_dark.png';
import GigsbergSrc from '@/assets/img/gigsberg_white.png';
import { getIsGradient } from '@/utils/website';

import { useSite } from '@/providers/SiteProvider';

const DISCLAIMER_CONTEXT_MAP: Record<string, string> = {
    football: 'football',
};
const DEFAULT_DISCLAIMER_CONTEXT = 'default';

const getDisclaimerSuffix = (subtype?: string): string => {
    const context = (subtype && DISCLAIMER_CONTEXT_MAP[subtype]) || DEFAULT_DISCLAIMER_CONTEXT;
    return context === DEFAULT_DISCLAIMER_CONTEXT ? '' : `_${context}`;
};

const DescriptionClient = () => {
    const { website, domainInfo } = useSite();
    const websiteName = website?.name || '';
    const websiteIsGradient = getIsGradient(website);
    const config = domainInfo?.config;
    const t = useTranslations();
    const { subtype } = useParams<{ subtype?: string }>();
    const segment = useSelectedLayoutSegment();

    // create translation key
    const suffix = getDisclaimerSuffix(subtype);
    const translationKey = `header_description${suffix}`;

    // condition to show powered by
    const isCheckout = segment === 'checkout';
    const shouldHidePoweredBy = config?.features?.shouldHidePoweredBy;
    const showPoweredBy = !isCheckout && !shouldHidePoweredBy;

    // description translated
    const description = t.rich(translationKey, {
        name: websiteName,
        link: (chunks) => (
            <Link prefetch={false} href="/terms-and-conditions" className="underline">
                {chunks}
            </Link>
        ),
    });

    const useThemeBackground = config?.features?.useThemeBackground;
    const logoSrc = websiteIsGradient || useThemeBackground ? GigsbergSrc : GigsbergDarkSrc;

    if (segment === 'checkout' || segment === 'redirection') return null;

    // styles note: small text is 10px, larger text is 12px
    return (
        <div className="bg-solid p-2 text-on-solid">
            <p className="text-[10px] text-inherit md:text-xs text-center leading-snug">
                {description}

                {showPoweredBy && (
                    <span
                        className={
                            'hidden xl:inline-flex justify-center items-center gap-2 ms-2 pb-1 align-middle whitespace-nowrap select-none'
                        }
                    >
                        <span className="pt-1 font-bold text-[10px] text-on-solid uppercase leading-none">
                            {t('powered_by')}
                        </span>
                        <Image src={logoSrc} width={70} alt="Gigsberg Logo" />
                    </span>
                )}
            </p>
        </div>
    );
};

export default DescriptionClient;
