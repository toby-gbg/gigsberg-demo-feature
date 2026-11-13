'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import {
    FansAlsoLike,
    FansAlsoLikeRequest,
    PerformerInteractionRequest,
} from '@/interfaces/Performer';

import { useUser } from '@/providers/UserProvider';

import { fetcher } from '../fetcher';
import { getPerformerEventSuggestionKeyForSWR } from '../helpers/performers.helper';
import { ErrorResponse } from '../types';
import { PerformerSuggestionKey } from '../types/performers';

export function useGetPerformerEventSuggestionQuery(
    args?: FansAlsoLikeRequest,
    options?: {
        skip?: boolean;
        initialData?: FansAlsoLike;
        onSuccess?: (data: FansAlsoLike) => void;
    }
) {
    const user = useUser();
    const userId = user?.id?.toString();

    const swrKey = !options?.skip ? getPerformerEventSuggestionKeyForSWR({ args, userId }) : null;

    const { data, error, isLoading, isValidating, mutate } = useSWR<
        FansAlsoLike,
        ErrorResponse,
        PerformerSuggestionKey
    >(
        swrKey,
        ([url]) =>
            fetcher<FansAlsoLike>(url, {
                method: 'GET',
            }),
        {
            fallbackData: options?.initialData,
            revalidateOnMount: !options?.initialData,
            revalidateOnFocus: false,
            onSuccess: (data) => options?.onSuccess?.(data),
        }
    );

    return {
        data: data ?? {},
        error: error ?? null,
        isError: !!error,
        isLoading,
        isValidating,
        mutate,
    };
}

export function usePostPerformerInteractionMutation() {
    return useSWRMutation<void, ErrorResponse, string, PerformerInteractionRequest>(
        '/performers/interactions',
        async (_, { arg }) => {
            const { performerId, clicked_performer_id } = arg;

            return fetcher<void>(`/performers/${performerId}/interactions`, {
                method: 'POST',
                body: { clicked_performer_id },
            });
        }
    );
}
