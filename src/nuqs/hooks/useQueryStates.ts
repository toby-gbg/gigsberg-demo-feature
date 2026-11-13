'use client';

import { BProgress } from '@bprogress/core';
import {
    useQueryStates as useNuqsQueryStates,
    type ParserMap,
    type UseQueryStatesOptions,
} from 'nuqs';

export const useQueryStates = <T extends ParserMap>(
    searchParamsParsers: T,
    options?: Partial<UseQueryStatesOptions<T>>
) => {
    const [params, setParams] = useNuqsQueryStates(searchParamsParsers, options);

    const handleSetParams = async (newParams: Parameters<typeof setParams>[0]) => {
        if (options?.shallow) {
            return setParams(newParams);
        }

        try {
            BProgress.start();
            await setParams(newParams);
        } catch (err) {
            console.error('Error setting query states', err);
        } finally {
            BProgress.done();
        }
    };

    return [params, handleSetParams] as const;
};
