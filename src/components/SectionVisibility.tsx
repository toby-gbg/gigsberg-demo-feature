'use client';

import { ReactNode } from 'react';
import { useSelectedLayoutSegments } from 'next/navigation';

export const shouldShowFooter = (segments: string[]) => {
    // `useSelectedLayoutSegments()` includes route groups, and the 4th segment is treated as a listing.
    // Event page `[type]/[subtype]/[event]/(slots)` → ['concerts', 'rock', 'event-slug', '(slots)']
    // Without this filter, '(slots)' is treated as a listing and the footer is hidden.
    // Listing page `[type]/[subtype]/[event]/[listing]` still has a real 4th segment, so the footer stays hidden.
    const filteredSegments = segments.filter((segment) => segment !== '(slots)');
    const [segment, , , listing] = filteredSegments ?? [];
    return segment !== 'redirection' && !listing;
};

export const shouldShowFooterMainContent = (segments: string[]) => {
    const [segment] = segments ?? [];
    return segment !== 'checkout';
};

interface SectionVisibilityProps {
    showSection?: (segments: string[]) => boolean;
    children: ReactNode;
}

export default function SectionVisibility({
    children,
    showSection = () => true,
}: SectionVisibilityProps) {
    const segments = useSelectedLayoutSegments();
    const hide = !showSection(segments);

    return !hide ? <div>{children}</div> : null;
}
