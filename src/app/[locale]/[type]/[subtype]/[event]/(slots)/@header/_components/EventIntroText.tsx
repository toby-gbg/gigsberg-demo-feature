'use client';

import { useParams } from 'next/navigation';

import { useSeoIntroText } from '@/swr/features/seo';

export default function EventIntroText({
    initialText,
    currencyCode,
}: {
    initialText: string;
    currencyCode: string;
}) {
    const params = useParams<{ type: string; subtype: string; event: string }>();
    const { data = initialText } = useSeoIntroText(params, currencyCode, initialText);

    return (
        <div className="w-full text-xs md:text-sm whitespace-pre-line">
            {data.split(/(<strong>[\s\S]*?<\/strong>)/gi).map((part, index) => {
                const strongMatch = /^<strong>([\s\S]*?)<\/strong>$/i.exec(part);
                return strongMatch ? <strong key={index}>{strongMatch[1]}</strong> : part;
            })}
        </div>
    );
}
