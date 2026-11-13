// Highlight search term in text with <mark> tags
export const highlightText = (text: string, search: string) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));

    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === search.toLowerCase() ? (
                    <mark key={i} className="bg-yellow-400 text-black rounded-sm px-0.5">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};

// Check if value contains search term (recursive)
export const containsSearchTerm = (value: unknown, search: string): boolean => {
    if (!search) return false;

    const term = search.toLowerCase();

    if (typeof value === 'string') {
        return value.toLowerCase().includes(term);
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value).toLowerCase().includes(term);
    }

    if (Array.isArray(value)) {
        return value.some((item) => containsSearchTerm(item, search));
    }

    if (value && typeof value === 'object') {
        return Object.entries(value).some(
            ([key, val]) => key.toLowerCase().includes(term) || containsSearchTerm(val, search)
        );
    }

    return false;
};
