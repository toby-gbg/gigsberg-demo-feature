'use client';

import { useTranslations } from 'next-intl';

interface DDVMapTooltipProps {
    tooltipElementId: string;
}

export const DigitalVenueMapTooltip = ({ tooltipElementId }: DDVMapTooltipProps) => {
    const t = useTranslations();

    return (
        <div
            id={tooltipElementId}
            className="pointer-events-none fixed z-[1001] w-48 max-w-[calc(100vw-16px)] hidden"
        >
            <div
                data-ddv-tooltip-card
                className="rounded-lg bg-black p-2 text-sm text-white shadow-lg will-change-[opacity,transform] [animation:ddv-tooltip-enter_220ms_cubic-bezier(0.16,1,0.3,1)] space-y-1"
            >
                <div data-ddv-tooltip-price-block>
                    <p className="font-semibold">
                        {t('block')}: <span data-ddv-tooltip-block />
                    </p>
                    <p>
                        {t('price')}: <span data-ddv-tooltip-price />
                    </p>
                    <div className="my-2 h-px w-full bg-white" />
                </div>
                <p className="font-semibold">
                    {t('category')}: <span data-ddv-tooltip-category />
                </p>
                <p data-ddv-tooltip-min-price-block>
                    From: <span data-ddv-tooltip-min-price />
                </p>
            </div>
        </div>
    );
};
