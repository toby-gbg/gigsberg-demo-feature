'use client';

import { useEffect } from 'react';
import uniqBy from 'lodash-es/uniqBy';
import { useUpdateEffect } from 'react-use';

import { EntityInfo } from '@/interfaces/entity/EntityMetadata';
import { Pagination } from '@/interfaces/Fetch';
import { FooterCredits } from '@/interfaces/Footer';
import HpSlide from '@/interfaces/HpSlide';
import PopularPerformer, { FansAlsoLikePerformer } from '@/interfaces/Performer';
import { $footerCredits, updateFooterCommonCredits } from '@/stores';
import { filterValidCredits } from '@/utils/footer.util';

interface FooterImageMetadata {
    licenseId?: number;
    license_id?: number;
    credits: string | null;
    source: string | null;
}

interface FooterImageEvent {
    image?: string | null;
    eventImage?: string | null;
    event_image?: string | null;
    performerImage?: string | null;
    performerImageCredits?: string | null;
    performerImageSource?: string | null;
    performer_image_credits?: string | null;
    performer_image_source?: string | null;
    imagesMetadata?: FooterImageMetadata[];
    images_metadata?: FooterImageMetadata[];
    performerImagesMetadata?: FooterImageMetadata[];
    performer_images_metadata?: FooterImageMetadata[];
}

interface UseFooterImagesProps {
    slides?: HpSlide[];
    events?: FooterImageEvent[] | Pagination<FooterImageEvent>;
    performers?: PopularPerformer[];
    fansAlsoLikePerformers?: FansAlsoLikePerformer[];
    entities?: EntityInfo[];
    credits?: FooterCredits[]; // New prop for simple credits array
    useUpdateEffectHook?: boolean;
    clearOnUnmount?: boolean;
    useSimpleCredits?: boolean; // Flag to use setFooterCredits instead of
    // setFooterCommonCredits
    appendToExisting?: boolean;
}

interface FooterCreditsData {
    slides?: FooterCredits[];
    events?: FooterCredits[];
    performers?: FooterCredits[];
    entities?: FooterCredits[];
    fansAlsoLikePerformers?: FooterCredits[];
}

const getMetadataCredits = (
    metadata: FooterImageMetadata[] | undefined,
    fallbackSource?: string | null
) =>
    metadata?.map((item) => ({
        imageCredits: item.credits,
        imageSource: item.source || fallbackSource,
    })) || [];

const getEventImageCredits = (event: FooterImageEvent): FooterCredits[] => {
    const eventImage =
        'eventImage' in event || 'event_image' in event
            ? event.eventImage || event.event_image
            : event.image;

    const imagesMetadata = event.imagesMetadata || event.images_metadata;
    const performerImagesMetadata =
        event.performerImagesMetadata || event.performer_images_metadata;

    if (eventImage) {
        return getMetadataCredits(imagesMetadata, eventImage);
    }

    const performerMetadataCredits = getMetadataCredits(
        performerImagesMetadata,
        event.performerImageSource || event.performer_image_source
    );

    if (performerMetadataCredits.length > 0) {
        return performerMetadataCredits;
    }

    return [
        {
            imageCredits: event.performerImageCredits || event.performer_image_credits,
            imageSource: event.performerImageSource || event.performer_image_source,
        },
    ];
};

const useFooterImages = ({
    slides = [],
    events = [],
    performers = [],
    fansAlsoLikePerformers = [],
    entities = [],
    credits = [],
    useUpdateEffectHook = false,
    clearOnUnmount = true,
    useSimpleCredits = false,
    appendToExisting = false,
}: UseFooterImagesProps) => {
    const effectHook = useUpdateEffectHook ? useUpdateEffect : useEffect;
    const eventsArray = Array.isArray(events) ? events : events?.items || [];

    effectHook(() => {
        // Handle simple credits mode (for checkout component)
        if (useSimpleCredits) {
            const validCredits = filterValidCredits(credits);

            if (appendToExisting) {
                const current = $footerCredits.get();
                const deduped = uniqBy(
                    [...current, ...validCredits],
                    (item) => `${item.imageCredits || ''}|${item.imageSource || ''}`
                );

                $footerCredits.set(deduped);
            } else {
                $footerCredits.set(validCredits);
            }

            if (clearOnUnmount) {
                return () => {
                    $footerCredits.set([]);
                };
            }

            return;
        }

        // Handle structured data mode (for other components)
        const creditsData: FooterCreditsData = {};
        const keysToReset: (keyof FooterCreditsData)[] = [];

        if (slides.length > 0) {
            const slidesImageMetadata = slides.flatMap(
                (slide) =>
                    slide?.imagesMetadata?.map((item) => ({
                        imageCredits: item.credits,
                        imageSource: item.source,
                    })) || []
            );

            creditsData.slides = filterValidCredits(slidesImageMetadata);

            if (creditsData.slides.length > 0) {
                keysToReset.push('slides');
            }
        }

        if (eventsArray.length > 0) {
            const eventsImageMetadata = eventsArray.flatMap(getEventImageCredits);

            creditsData.events = filterValidCredits(eventsImageMetadata);

            if (creditsData.events.length > 0) {
                keysToReset.push('events');
            }
        }

        if (performers.length > 0) {
            const performersImageMetadata = performers.flatMap(
                (performer) =>
                    performer?.imagesMetadata?.map((item) => ({
                        imageCredits: item.credits,
                        imageSource: item.source,
                    })) || []
            );

            creditsData.performers = filterValidCredits(performersImageMetadata);

            if (creditsData.performers.length > 0) {
                keysToReset.push('performers');
            }
        }

        if (entities.length > 0) {
            const entitiesImageMetadata = entities.flatMap(
                (entity) =>
                    entity?.imagesMetadata?.map((item) => ({
                        imageCredits: item.credits,
                        imageSource: item.source,
                    })) || []
            );

            creditsData.entities = filterValidCredits(entitiesImageMetadata);

            if (creditsData.entities.length > 0) {
                keysToReset.push('entities');
            }
        }

        if (fansAlsoLikePerformers.length > 0) {
            const fansAlsoLikePerformersImageMetadata = fansAlsoLikePerformers.map((item) => ({
                imageCredits: item.image_credits,
                imageSource: item.image_source,
            }));
            creditsData.fansAlsoLikePerformers = filterValidCredits(
                fansAlsoLikePerformersImageMetadata
            );
            if (creditsData.fansAlsoLikePerformers.length > 0)
                keysToReset.push('fansAlsoLikePerformers');
        }

        // Update nanostore (append or overwrite depending on prop)
        updateFooterCommonCredits(creditsData, appendToExisting);

        if (clearOnUnmount && keysToReset.length > 0) {
            return () => {
                const reset: Partial<FooterCreditsData> = {};

                if (keysToReset.includes('slides')) reset.slides = [];
                if (keysToReset.includes('events')) reset.events = [];
                if (keysToReset.includes('performers')) reset.performers = [];
                if (keysToReset.includes('entities')) reset.entities = [];
                if (keysToReset.includes('fansAlsoLikePerformers'))
                    reset.fansAlsoLikePerformers = [];

                // Call by nanostore
                updateFooterCommonCredits(reset);
            };
        }
    }, [
        slides,
        eventsArray,
        performers,
        entities,
        fansAlsoLikePerformers,
        credits,
        useSimpleCredits,
        clearOnUnmount,
        appendToExisting,
    ]);
};

export default useFooterImages;
