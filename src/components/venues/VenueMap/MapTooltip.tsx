import { Ref, useImperativeHandle, useRef, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import ReactDOM from 'react-dom';

import { formatPrice } from '@/utils/currency.util';
import { getImgsFromMap } from '@/utils/listing.util';

export interface MapTooltipMethod {
    setVisible: (visible: boolean) => void;
    updatePosition: (mouseX: number, mouseY: number) => void;
    updateData: (data: BlockInfo) => void;
}

export interface BlockInfo {
    blockKey: string | null;
    categoryId: string | null;
    categoryName: string | null;
    price: string | null;
    minPrice: string | null;
    available: string | null;
    maps3dUrls: string | null;
    selector: string | null;
}

interface Props {
    ref: Ref<MapTooltipMethod>;
    mapUrls?: Record<string, string[]>;
    isDebug?: boolean;
    currencyCode?: string;
}

function MapTooltip({ mapUrls, isDebug, ref, currencyCode = 'USD' }: Props) {
    const t = useTranslations();
    const locale = useLocale();

    const tooltipRef = useRef<HTMLDivElement>(null);
    const [data, setData] = useState<BlockInfo>();

    useImperativeHandle(ref, () => ({
        setVisible: (visible: boolean) =>
            tooltipRef.current?.setAttribute('data-visible', visible.toString()),
        updatePosition: (mouseX: number, mouseY: number) => {
            const tooltip = tooltipRef.current;
            if (!tooltip) return;

            const rect = tooltip.getBoundingClientRect();
            const screenW = window.innerWidth;
            const screenH = window.innerHeight;

            let left = mouseX + 10;
            let top = mouseY + 10;

            // Adjust position if badge goes beyond screen
            if (left + rect.width > screenW) left = mouseX - rect.width - 10;
            if (top + rect.height > screenH) top = mouseY - rect.height - 10;

            tooltip.style.transform = `translate(${left}px, ${top}px)`;
        },

        updateData: (data: BlockInfo) => setData(data),
    }));

    if (!data) return;

    const price = Number(data.price);
    const blockName = data.blockKey?.trim().split(',')[0] || 'N/A';
    const categoryName = data.categoryName?.trim().split(',')[0] || 'N/A';
    const minPrice = Number(data.minPrice);

    // Seat view image
    const previewImg = getImgsFromMap(mapUrls, categoryName, blockName)?.[0];

    // Create a portal to render the tootlip at the end of the body
    // to prevent overflow issues within transform container
    return ReactDOM.createPortal(
        <div
            ref={tooltipRef}
            data-visible="false"
            className="fixed top-0 left-0 z-[1001] min-w-28 w-fit rounded-lg bg-black text-sm text-white will-change-transform transition-opacity pointer-events-none data-[visible=true]:opacity-100 data-[visible=false]:opacity-0 data-[visible=false]:-z-10"
        >
            {previewImg && (
                <div className="hidden md:block relative bg-black rounded overflow-hidden">
                    <Image
                        key={previewImg}
                        src={previewImg}
                        alt="block view"
                        width={285}
                        height={160}
                        className="object-cover"
                        unoptimized
                    />
                </div>
            )}

            <div className="space-y-2 p-2">
                {price > 0 ? (
                    <>
                        <p className="font-semibold">
                            {t('block')}: {blockName}
                        </p>
                        <p>
                            {t('price')}: {formatPrice(price, locale, currencyCode)}
                        </p>
                    </>
                ) : (
                    <>
                        <p className="font-semibold">
                            {t('category')}: {categoryName}
                        </p>
                        <p>From: {formatPrice(minPrice, locale, currencyCode)}</p>
                    </>
                )}

                {/* Debug section - show selector info */}
                {isDebug && data.selector && (
                    <>
                        <div className="bg-white w-full h-px"></div>
                        <p className="font-semibold">
                            {t('category')}: {categoryName}
                        </p>
                        <p>From: {formatPrice(minPrice, locale, currencyCode)}</p>
                        <div className="bg-white w-full h-px"></div>
                        <p className="font-mono text-sm break-all">
                            <span className="font-semibold">Selector:</span> {data.selector}
                        </p>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
}

MapTooltip.displayName = 'MapTootip';
export default MapTooltip;
