'use client';

import useSWRMutation from 'swr/mutation';

import HpSlide from '@/interfaces/HpSlide';
import { removeTicketsSuffix } from '@/utils/common';

import { fetcher } from '../fetcher';
import { ErrorResponse } from '../types';

interface SlidesFilters {
    type?: string;
    currencyCode: string;
}

export function useLazyGetSlidesQuery() {
    return useSWRMutation<HpSlide[], ErrorResponse, string, SlidesFilters>(
        'getSlides',
        async (_, { arg: { type, currencyCode } }) => {
            if (type) {
                const response = await fetcher<{ slides: HpSlide[] }>('/subtypes/slides', {
                    params: { type: removeTicketsSuffix(type), currencyCode },
                });
                return response.slides;
            }

            return fetcher<HpSlide[]>('/carousel', { params: { currencyCode } });
        }
    );
}
