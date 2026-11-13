'use client';

import { useTranslations } from 'next-intl';

import { SubtypeImageTile } from '@/interfaces/Tour';
import { fallbackTranslation, removeTicketsSuffix } from '@/utils/common';

import DiscoverySection from '@/components/DiscoverySection';

const DISCOVERY_SECTION_TITLE_STRATEGY: Record<string, [key: string, fallback: string]> = {
    sport: ['popular_sport', 'Popular Sports'],
    festival: ['festival_location', 'Festival Locations'],
};
const DEFAULT_DISCOVERY_SECTION_TITLE = ['popular_genres', 'Popular Genres'] as const;

export default function TypePageAllSubtypes({
    type,
    subtypes,
}: {
    type: string;
    subtypes: SubtypeImageTile[];
}) {
    const t = useTranslations();

    const [discoverySectionTitleKey, discoverySectionTitleFallback] =
        DISCOVERY_SECTION_TITLE_STRATEGY[removeTicketsSuffix(type)] ??
        DEFAULT_DISCOVERY_SECTION_TITLE;
    const discoverySectionTitle = fallbackTranslation(
        t(discoverySectionTitleKey),
        discoverySectionTitleKey,
        discoverySectionTitleFallback
    );

    return <DiscoverySection items={subtypes} title={discoverySectionTitle} imageType="subtypes" />;
}
