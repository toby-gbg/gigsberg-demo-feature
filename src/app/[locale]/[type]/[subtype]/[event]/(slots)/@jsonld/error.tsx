'use client';

export default function EventJsonLdError({ error }: { error: Error }) {
    console.error('[EventJsonLdError] An unexpected error occurred:', error);

    return null;
}
