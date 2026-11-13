'use client';

import { memo, useEffect } from 'react';

import Country from '@/interfaces/Country';
import { FansAlsoLike } from '@/interfaces/Performer';
import { useGetPerformerEventSuggestionQuery } from '@/swr/features/performers';

import { useFansAlsoLikeGA } from '@/hooks/useFansAlsoLikeGA';
import useFooterImages from '@/hooks/useFooterImages';

import Container from '@/components/Container';

import { MAX_PERFORMER_CARDS } from '../../../_constants';
import { useEntityContext } from '../../../_providers/EntityProvider';
import PerformerCardsView from './PerformerCardsView';

interface Props {
    fansAlsoLikeData: FansAlsoLike;
    ipCountry: Country;
}

const PerformerSuggestion = ({ fansAlsoLikeData: initialDataProp, ipCountry }: Props) => {
    const { entityMetadata } = useEntityContext();

    const performerId = entityMetadata?.entity?.id?.toString();

    const handleTrackShown = (fansAlsoLikeData: FansAlsoLike) => {
        const suggestionPerformers = fansAlsoLikeData?.recommendations || [];
        if (suggestionPerformers.length > 0) {
            trackShown(suggestionPerformers.map((item) => item.performer_id.toString()));
        } else {
            trackEmpty();
        }
    };

    const { data } = useGetPerformerEventSuggestionQuery(
        { performerId, limit: MAX_PERFORMER_CARDS },
        { skip: !performerId, initialData: initialDataProp, onSuccess: handleTrackShown }
    );

    const suggestionPerformers = data?.recommendations || [];

    const showSection = suggestionPerformers.length > 0;

    const { trackShown, trackEmpty, trackClick } = useFansAlsoLikeGA(performerId, ipCountry);

    const onCardClick = (index: number) => {
        const recommendation = (suggestionPerformers || [])?.[index];
        if (!recommendation) return;

        trackClick(recommendation.performer_id.toString(), index + 1);
    };

    useEffect(() => {
        handleTrackShown(initialDataProp);
    }, [initialDataProp]);

    useFooterImages({
        fansAlsoLikePerformers: suggestionPerformers,
        clearOnUnmount: true,
    });

    if (!showSection) {
        return null;
    }

    return (
        <Container className="px-0!">
            <PerformerCardsView performers={suggestionPerformers} onCardClick={onCardClick} />
        </Container>
    );
};

export default memo(PerformerSuggestion);
