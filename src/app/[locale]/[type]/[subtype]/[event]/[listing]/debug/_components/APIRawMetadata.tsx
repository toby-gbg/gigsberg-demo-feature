'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import JsonView from '@uiw/react-json-view';
import { vscodeTheme } from '@uiw/react-json-view/vscode';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { ListingMetadata } from '@/interfaces/Listing';

import { Button } from '@/components/ui/Button';

import { useVenueMapDebug } from '../_providers/VenueMapDebugProvider';

interface Props {
    metadata: ListingMetadata;
}

export default function Metadata({ metadata }: Props) {
    const { searchTerm } = useVenueMapDebug();
    const containerRef = useRef<HTMLDivElement>(null);
    const [matchIndex, setMatchIndex] = useState(0);
    const [totalMatches, setTotalMatches] = useState(0);

    useEffect(() => {
        setMatchIndex(0);
        setTotalMatches(0);

        if (!searchTerm) return;

        const timeoutId = setTimeout(() => {
            if (containerRef.current) {
                const marks = containerRef.current.querySelectorAll('mark');
                setTotalMatches(marks.length);
                if (marks.length > 0) {
                    marks[0].scrollIntoView({
                        behavior: 'auto',
                        block: 'center',
                    });
                    marks[0].classList.add('ring-2', 'ring-blue-500', 'ring-offset-1');
                }
            }
        }, 150);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const navigateMatch = (direction: 'next' | 'prev') => {
        if (totalMatches === 0 || !containerRef.current) return;

        const marks = containerRef.current.querySelectorAll('mark');
        marks[matchIndex].classList.remove('ring-2', 'ring-blue-500', 'ring-offset-1');

        let newIndex = direction === 'next' ? matchIndex + 1 : matchIndex - 1;
        if (newIndex >= totalMatches) newIndex = 0;
        if (newIndex < 0) newIndex = totalMatches - 1;

        setMatchIndex(newIndex);
        marks[newIndex].scrollIntoView({
            behavior: 'auto',
            block: 'center',
        });
        marks[newIndex].classList.add('ring-2', 'ring-blue-500', 'ring-offset-1');
    };

    const highlightText = (text: string) => {
        if (!searchTerm) return text;
        const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
        return (
            <>
                {parts.map((part, i) =>
                    part.toLowerCase() === searchTerm.toLowerCase() ? (
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const containsSearchTerm = (val: any, term: string): boolean => {
        if (!term) return false;
        const strTerm = term.toLowerCase();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const check = (v: any): boolean => {
            if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
                return String(v).toLowerCase().includes(strTerm);
            }
            if (Array.isArray(v)) {
                return v.some(check);
            }
            if (typeof v === 'object' && v !== null) {
                return Object.entries(v).some(
                    ([k, val]) => k.toLowerCase().includes(strTerm) || check(val)
                );
            }
            return false;
        };
        return check(val);
    };

    const memoizedJsonView = useMemo(
        () => (
            <JsonView
                value={metadata}
                style={vscodeTheme}
                displayDataTypes={false}
                collapsed={searchTerm ? false : 3}
                highlightUpdates={false}
                shouldExpandNodeInitially={(isExpanded, { value }) => {
                    if (searchTerm && containsSearchTerm(value, searchTerm)) {
                        return true;
                    }
                    return isExpanded;
                }}
            >
                <JsonView.KeyName
                    render={({ children, ...props }) => (
                        <span {...props}>{highlightText(String(children))}</span>
                    )}
                />
                <JsonView.String
                    render={({ children, ...props }) => (
                        <span {...props}>{highlightText(String(children).replace(/"/g, ''))}</span>
                    )}
                />
                <JsonView.Int
                    render={({ children, ...props }) => (
                        <span {...props}>{highlightText(String(children))}</span>
                    )}
                />
            </JsonView>
        ),
        [metadata, searchTerm]
    );

    return (
        <div className="h-[calc(100vh-180px)] flex flex-col relative group">
            {totalMatches > 0 && (
                <div className="absolute top-2 right-6 z-10 flex items-center gap-1 bg-white/90 backdrop-blur shadow-sm border rounded-lg p-1 animate-in fade-in slide-in-from-top-2">
                    <span className="text-[10px] font-mono px-2 text-gray-500">
                        {matchIndex + 1} / {totalMatches}
                    </span>
                    <Button
                        aria-label="Previous search match"
                        isIconOnly
                        className="h-6 w-6 min-w-6"
                        onClick={() => navigateMatch('prev')}
                        prefixIcon={<ChevronUp size={14} />}
                    />
                    <Button
                        aria-label="Next search match"
                        isIconOnly
                        className="h-6 w-6 min-w-6"
                        onClick={() => navigateMatch('next')}
                        prefixIcon={<ChevronDown size={14} />}
                    />
                </div>
            )}
            <div className="flex-1 overflow-y-auto" ref={containerRef}>
                {memoizedJsonView}
            </div>
        </div>
    );
}
