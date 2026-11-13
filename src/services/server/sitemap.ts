import { FrontAPIEvent } from '@/interfaces/Event';
import { Pagination } from '@/interfaces/Fetch';
import { FrontAPIPerformer } from '@/interfaces/Performer';
import { SitemapDataType } from '@/interfaces/Sitemap';
import { SubtypeDataResponse } from '@/interfaces/Subtype';
import { fetchPagesInBatches } from '@/lib/fetch';
import Headers from '@/lib/headers';
import Cache from '@/constants/cache';
import { DEFAULT_LARGE_SIZE } from '@/constants/pagination';

import { apiService } from './base';

export const sitemapApi = {
    async getSitemapData(refresh = false): Promise<SitemapDataType> {
        const { domain } = await Headers.getDomainInfo();
        // Get available locales for this domain
        let sitemapData: SitemapDataType = {
            activeLanguageCodes: ['en-GB', 'es-ES'],
            types: [],
        };
        try {
            const fetchOptions: RequestInit = refresh
                ? { cache: 'no-store' }
                : { next: { revalidate: 86400 } };

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/sitemap?domain=${domain}`,
                fetchOptions
            );

            sitemapData = await res.json();
        } catch {}

        return sitemapData;
    },

    async getTypeData(
        type = '',
        subtype = ''
    ): Promise<SubtypeDataResponse<FrontAPIPerformer[], Pagination<FrontAPIEvent>> | null> {
        const { hostname } = await Headers.getDomainInfo();

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/subtypes/data?type=${type}${subtype ? `&subtype=${subtype}` : ''}`,
                {
                    headers: {
                        'x-website-domain': hostname,
                    },
                }
            );

            const data = await res.json();
            return data;
        } catch (error) {
            console.error('Error fetching subtype data', error);
            return null;
        }
    },

    async getSubtypeEvents({
        type,
        typeId,
        subtypeId,
        refresh = false,
    }: {
        type: string;
        typeId?: number;
        subtypeId?: number;
        refresh?: boolean;
    }): Promise<FrontAPIEvent[]> {
        const { hostname } = await Headers.getDomainInfo();

        const fetchOptions: RequestInit = refresh
            ? { cache: 'no-store' }
            : { next: { revalidate: 86400 } };

        const LIMIT = 1500;

        const typeURI = typeId ? `&typeId=${typeId}` : '';
        const subtypeURI = subtypeId ? `&subtypeId=${subtypeId}` : '';
        const buildUrl = (page: number) =>
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/subtypes/events?nameUrl=${type}&page=${page}&per_page=${LIMIT}${typeURI}${subtypeURI}`;

        try {
            const data = await fetchPagesInBatches<Pagination<FrontAPIEvent>>({
                totalPages: 10,
                batchSize: 5,
                buildUrl,
                fetchOptions,
                headers: {
                    'x-website-domain': hostname,
                },
            });

            return data.flatMap((d) => d.items || []);
        } catch (error) {
            console.error('Error fetching subtype events', error);
            return [];
        }
    },

    async getCities(refresh = false): Promise<{ id: number; nameUrl: string }[]> {
        let data;
        try {
            const fetchOptions: RequestInit = refresh
                ? { cache: 'no-store' }
                : { next: { revalidate: 86400 } };

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/cities/locations?perPage=${DEFAULT_LARGE_SIZE}`,
                fetchOptions
            );

            data = await res.json();
        } catch {}
        return data.cities;
    },

    async getVenues(refresh = false): Promise<{ id: number; name_url: string }[]> {
        try {
            const data = await apiService.get<{ rows: { id: number; name_url: string }[] }>(
                '/venues',
                {
                    params: {
                        pageSize: DEFAULT_LARGE_SIZE,
                    },
                    ...(refresh ? { cache: 'no-store' } : { next: { revalidate: Cache.DAY } }),
                }
            );

            return data?.rows ?? [];
        } catch (error) {
            console.error('Error fetching venues', error);
            return [];
        }
    },
};
