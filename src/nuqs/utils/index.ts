export const convertSearchParams = (
    searchParams: Record<string, string | string[] | number | null>
) => {
    return Object.entries(searchParams).reduce(
        (acc, [key, value]) => {
            acc[key] = value ?? undefined;
            return acc;
        },
        {} as Record<string, string | string[] | number | undefined>
    );
};
