'use client';

import { Maximize2, Minus, Plus, type LucideIcon } from 'lucide-react';
import { useControls } from 'react-zoom-pan-pinch';

import { useSite } from '@/providers/SiteProvider';

export default function VenueMapZoom() {
    const { zoomIn, zoomOut, resetTransform } = useControls();

    return (
        <div className="absolute z-10 mt-5 flex flex-col space-y-2 rounded-md bg-white p-2 shadow-md ltr:right-4 rtl:left-4">
            <ZoomButton icon={Plus} onClick={() => zoomIn()}></ZoomButton>
            <ZoomButton icon={Minus} onClick={() => zoomOut()}></ZoomButton>
            <ZoomButton icon={Maximize2} onClick={() => resetTransform()}></ZoomButton>
        </div>
    );
}

const ZoomButton = ({ icon: Icon, onClick }: { icon: LucideIcon; onClick: () => void }) => {
    const { config } = useSite().domainInfo || {};
    const useThemeBackground = config?.features?.useThemeBackground || false;

    return (
        <button
            onClick={onClick}
            className="bg-main-start rounded-md px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
            <Icon size={16} stroke={useThemeBackground ? '#000000' : '#FFFFFF'} />
        </button>
    );
};
