export interface Pagination<I> {
    items: I[];
    total: number;
    nextPage: boolean | number | null;
    prevPage: boolean | number | null;
    lastPage: string;
}

export interface FastifyPagination<R> {
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
    rows: R[];
}

export type EventsByCityResponse<E> = {
    id: number;
    name: string;
    nameUrl: string;
    hasMore: boolean;
    events: E[];
};

export interface FrontAPIPaginationFilters {
    per_page?: number;
    page?: number;
}

export interface PaginationFilters {
    query?: string;
    pageNumber?: number;
    pageSize?: number;
}

export interface SortingFilters {
    sortBy?: string;
    sortDirection?: string;
}

export interface FastifyError {
    status: number;
}

export type LastMinuteEventsResponse<E> = {
    seeAllFromDate: string;
    seeAllToDate: string;
    events: E[];
};
