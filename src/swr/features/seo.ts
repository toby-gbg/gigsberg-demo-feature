'use client';

import useSWR from 'swr';

import { SEO } from '@/interfaces/SEO';
import { removeTicketsSuffix } from '@/utils/common';

import { useUser } from '@/providers/UserProvider';

import { fetcher } from '../fetcher';

export function useSeoIntroText(
    { type, subtype, event }: { type: string; subtype: string; event: string },
    currencyCode: string,
    initialText: string
) {
    const userId = useUser()?.id ?? null;
    const endpoint = `/seo/metadata/${removeTicketsSuffix(type)}/${subtype}/${removeTicketsSuffix(event)}`;

    return useSWR(
        [endpoint, currencyCode, userId] as const,
        async ([url, currency]) => {
            const data = await fetcher<SEO>(url, {
                headers: { 'x-user-currency': currency },
            });
            return data.seo_item.intro_text ?? '';
        },
        { fallbackData: initialText, dedupingInterval: 0 }
    );
}
