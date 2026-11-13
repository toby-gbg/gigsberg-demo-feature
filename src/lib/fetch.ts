export async function fetchPagesInBatches<T>({
    totalPages,
    batchSize = 3,
    buildUrl,
    fetchOptions,
    headers,
}: {
    totalPages: number;
    batchSize?: number;
    buildUrl: (page: number) => string;
    fetchOptions: RequestInit;
    headers: Record<string, string>;
}) {
    const results: T[] = [];

    for (let i = 1; i <= totalPages; i += batchSize) {
        const batchPages = Array.from(
            { length: Math.min(batchSize, totalPages - i + 1) },
            (_, idx) => i + idx
        );

        // run batch in parallel
        const responses = await Promise.all(
            batchPages.map((page) =>
                fetch(buildUrl(page), {
                    headers,
                    ...fetchOptions,
                })
            )
        );

        // check errors
        responses.forEach((res) => {
            if (!res.ok) {
                throw new Error(`Failed at page ${res.url}`);
            }
        });

        // parse JSON
        const data = await Promise.all(responses.map((r) => r.json()));
        results.push(...data);

        // continue if has more
        const hasMore = data.some((item) => !item.nextPage);
        if (!hasMore) break;
    }

    return results;
}
