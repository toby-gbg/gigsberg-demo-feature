'use client';

import { useCallback, useMemo, type MouseEventHandler } from 'react';
import { Minus, Plus, RotateCcw, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { getIsGradient } from '@/utils/website';
import { DDV_MAP_ZOOM_ANIMATION_TIME } from '@/constants/digital-venue-config';

import { useDigitalVenue } from '@/providers/DigitalVenueProvider';
import { useSite } from '@/providers/SiteProvider';

// Multiplier used by the 3DDV MapViewer API. Values above 1 zoom in; the inverse zooms out.
const DDV_MAP_ZOOM_STEP = 1.25;

type ButtonIconProps = {
    icon: LucideIcon;
    onClick: MouseEventHandler<HTMLButtonElement>;
    className: string;
    disabled: boolean;
    ariaLabel: string;
};

const ButtonIcon = ({ icon: Icon, onClick, className, disabled, ariaLabel }: ButtonIconProps) => (
    <button
        type="button"
        onClick={onClick}
        className={className}
        disabled={disabled}
        aria-label={ariaLabel}
    >
        <Icon size={16} stroke="" />
    </button>
);

export const DigitalVenueMapZoom = () => {
    const isGradient = getIsGradient(useSite().website);
    const t = useTranslations();
    const { activeSectionIds, mapViewer } = useDigitalVenue();
    const className = useMemo(
        () => `px-2 py-1 text-on-main text-sm rounded-md flex justify-center bg-gradient stroke-white disabled:opacity-50 disabled:cursor-not-allowed
             ${!isGradient ? 'bg-solid! stroke-on-solid!' : ''}
            `,
        [isGradient]
    );

    // Animated zoom keeps the current viewport center by converting the DOM center point
    // into 3DDV scene coordinates, then asks goTo to interpolate to the next scale.
    const zoomMap = useCallback(
        (factor: number) => {
            if (!mapViewer) return;

            const container = mapViewer.getContainer();
            const centerPoint = container
                ? mapViewer.fromDomToScene([container.clientWidth / 2, container.clientHeight / 2])
                : null;

            if (!centerPoint) {
                mapViewer.scaleBy(factor);
                return;
            }

            void mapViewer.goTo(
                centerPoint,
                mapViewer.scaling_factor * factor,
                DDV_MAP_ZOOM_ANIMATION_TIME
            );
        },
        [mapViewer]
    );

    const zoomIn = useCallback(() => {
        zoomMap(DDV_MAP_ZOOM_STEP);
    }, [zoomMap]);

    // Using the inverse of the zoom step gives a symmetric zoom-out action.
    const zoomOut = useCallback(() => {
        zoomMap(1 / DDV_MAP_ZOOM_STEP);
    }, [zoomMap]);

    // goTo fits the target nodes back into the viewport and animates the camera reset.
    const resetZoom = useCallback(() => {
        if (!mapViewer) return;

        const resetMapTarget = mapViewer.getNodesByType('section').map((node) => node.id);

        if (!resetMapTarget.length) return;

        void mapViewer.goTo(resetMapTarget, undefined, DDV_MAP_ZOOM_ANIMATION_TIME);
    }, [activeSectionIds, mapViewer]);

    return (
        <div className="absolute top-2 right-2 z-10 flex flex-col space-y-2 rounded-md bg-white p-2 shadow-lg">
            <ButtonIcon
                icon={Plus}
                onClick={zoomIn}
                className={className}
                disabled={!mapViewer}
                ariaLabel={t('zoom_in_map')}
            />
            <ButtonIcon
                icon={Minus}
                onClick={zoomOut}
                className={className}
                disabled={!mapViewer}
                ariaLabel={t('zoom_out_map')}
            />
            <ButtonIcon
                icon={RotateCcw}
                onClick={resetZoom}
                className={className}
                disabled={!mapViewer}
                ariaLabel={t('reset_map_zoom')}
            />
        </div>
    );
};
