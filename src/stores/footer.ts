import { atom } from 'nanostores';

import { FooterCommonCredits, FooterCredits } from '@/interfaces/Footer';
import { combineLocaleCredits } from '@/utils/footer.util';

export const $footerCommon = atom<FooterCommonCredits>({
    slides: [],
    events: [],
    performers: [],
    entities: [],
    fansAlsoLikePerformers: [],
});

export const $footerCredits = atom<FooterCredits[]>([{ imageCredits: '', imageSource: '' }]);

const mergeCredits = (
    existing: FooterCredits[] = [],
    incoming: FooterCredits[] = []
): FooterCredits[] => {
    const map = new Map(
        [...existing, ...incoming].map((item) => [
            `${item.imageCredits || ''}|${item.imageSource || ''}`,
            item,
        ])
    );

    return Array.from(map.values());
};

export const updateFooterCommonCredits = (
    localeCredits: Partial<FooterCommonCredits>,
    append = false
) => {
    const current = $footerCommon.get();

    $footerCommon.set({
        slides: append
            ? mergeCredits(current.slides, localeCredits.slides)
            : (localeCredits.slides ?? current.slides),

        events: append
            ? mergeCredits(current.events, localeCredits.events)
            : (localeCredits.events ?? current.events),

        performers: append
            ? mergeCredits(current.performers, localeCredits.performers)
            : (localeCredits.performers ?? current.performers),

        entities: append
            ? mergeCredits(current.entities, localeCredits.entities)
            : (localeCredits.entities ?? current.entities),

        fansAlsoLikePerformers: append
            ? mergeCredits(current.fansAlsoLikePerformers, localeCredits.fansAlsoLikePerformers)
            : (localeCredits.fansAlsoLikePerformers ?? current.fansAlsoLikePerformers),
    });

    $footerCredits.set(combineLocaleCredits($footerCommon.get()));
};
