interface BaseGetProps {
    path: string;
    params?: Record<string, string>;
    method?: RequestInit['method'];
    init?: Omit<RequestInit, 'method' | 'next'>;
    baseUrl?: string;
    retry?: boolean;
}

interface RedisCache {
    cacheKey?: string;
    cacheTtl?: number;
    forceRefreshIsNew?: boolean;
}

interface NextCache {
    tags: string[];
}

export type GetNodeProps = BaseGetProps & RedisCache & Partial<NextCache>;
export type GetEdgeProps = BaseGetProps & Partial<NextCache>;

export interface PostProps {
    path: string;
    body?: unknown;
    baseUrl?: string;
    init?: Omit<RequestInit, 'method' | 'body'>;
}
