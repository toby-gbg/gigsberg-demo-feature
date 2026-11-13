'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { Button } from '@/components/ui/Button';

import { useDebug } from '../DebugContext';
import CodeBlock from './CodeBlock';
import DetailBlock from './DetailBlock';
import JsonBlock from './JsonBlock';

// Format milliseconds to display string (e.g., 500 -> "500ms")
const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    return ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(2)}s`;
};

export function DetailPanel() {
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [inputValue, setInputValue] = useState('');
    const [detailSearch, setDetailSearch] = useState('');
    const [matchIndex, setMatchIndex] = useState(0);
    const [totalMatches, setTotalMatches] = useState(0);

    const { selectedCall, handleInvalidate, isPending } = useDebug();

    // Debounce: delay search update until typing stops
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDetailSearch(inputValue);
        }, 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [inputValue]);

    // Count matches and scroll to first result
    useEffect(() => {
        setMatchIndex(0);
        if (!detailSearch || !containerRef.current) {
            setTotalMatches(0);
            return;
        }
        const timeoutId = setTimeout(() => {
            const marks = containerRef.current!.querySelectorAll('mark');
            setTotalMatches(marks.length);
            marks.forEach((m) => m.classList.remove('ring-2', 'ring-yellow-500', 'ring-offset-1'));
            if (marks.length > 0) {
                marks[0].scrollIntoView({ behavior: 'auto', block: 'center' });
                marks[0].classList.add('ring-2', 'ring-yellow-500', 'ring-offset-1');
            }
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [detailSearch]);

    // Clear search input and reset state
    const clearHighlights = useCallback(() => {
        setInputValue('');
        setDetailSearch('');
        setMatchIndex(0);
        setTotalMatches(0);
    }, []);

    // Navigate between matches (prev/next)
    const navigateMatch = useCallback(
        (dir: 'next' | 'prev') => {
            if (totalMatches === 0 || !containerRef.current) return;
            const marks = containerRef.current.querySelectorAll('mark');
            marks[matchIndex].classList.remove('ring-2', 'ring-yellow-500', 'ring-offset-1');
            let newIdx = dir === 'next' ? matchIndex + 1 : matchIndex - 1;
            if (newIdx >= totalMatches) newIdx = 0;
            if (newIdx < 0) newIdx = totalMatches - 1;
            setMatchIndex(newIdx);
            marks[newIdx].classList.add('ring-2', 'ring-yellow-500', 'ring-offset-1');
            marks[newIdx].scrollIntoView({ behavior: 'auto', block: 'center' });
        },
        [matchIndex, totalMatches]
    );

    return (
        <div className="relative flex flex-col overflow-auto">
            <div className="flex h-8 items-center border-b border-gray-800 px-3 py-2">
                <span className="text-xs font-semibold text-yellow-400 uppercase">Details</span>
            </div>

            <div className="sticky top-0 flex items-center gap-2 border-b border-gray-800 px-2 py-1.5">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search in details..."
                        className="focus:bg-gray-750 w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-[11px] text-gray-200 placeholder-gray-500 transition-all focus:outline-none"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    {inputValue && (
                        <button
                            onClick={() => {
                                clearHighlights();
                                setDetailSearch('');
                            }}
                            className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                            ✕
                        </button>
                    )}
                </div>
                {totalMatches > 0 && (
                    <div className="flex items-center gap-1 rounded border border-gray-700 bg-gray-800 px-2 py-0.5">
                        <span className="font-mono text-[10px]">
                            {matchIndex + 1} / {totalMatches}
                        </span>
                        <Button
                            variant="ghost"
                            className="size-5 min-w-5 p-0"
                            onClick={() => navigateMatch('prev')}
                        >
                            <ChevronUp size={14} className="stroke-white" />
                        </Button>
                        <Button
                            variant="ghost"
                            className="size-5 min-w-5 p-0"
                            onClick={() => navigateMatch('next')}
                        >
                            <ChevronDown size={14} className="stroke-white" />
                        </Button>
                    </div>
                )}
            </div>

            {selectedCall ? (
                <div className="flex-1 space-y-4 overflow-y-auto p-2" ref={containerRef}>
                    <div className="flex justify-between gap-4">
                        <DetailBlock label="Method">
                            <span className="font-mono font-bold">{selectedCall.method}</span>
                        </DetailBlock>
                        <DetailBlock label="Status">
                            <span
                                className={`font-bold ${
                                    (selectedCall.status ?? 0) < 400
                                        ? 'text-green-400'
                                        : 'text-red-400'
                                }`}
                            >
                                {selectedCall.status ?? 'N/A'}
                            </span>
                        </DetailBlock>
                        <DetailBlock label="Duration">
                            <span className="font-bold">
                                {formatDuration(selectedCall.duration)}
                            </span>
                        </DetailBlock>
                        <DetailBlock label="Timestamp">
                            {new Date(selectedCall.timestamp).toLocaleTimeString()}
                        </DetailBlock>
                    </div>

                    {selectedCall.debug?.callPoint ? (
                        <DetailBlock label="Call Point">
                            <span className="font-bold text-teal-300">
                                {selectedCall.debug.callPoint}
                            </span>
                        </DetailBlock>
                    ) : null}

                    <DetailBlock label="Endpoint">
                        <CodeBlock search={detailSearch}>{selectedCall.endpoint}</CodeBlock>
                    </DetailBlock>

                    <DetailBlock label="Full Endpoint">
                        <CodeBlock search={detailSearch}>{selectedCall.url}</CodeBlock>
                    </DetailBlock>

                    <DetailBlock label="Trigger from">
                        <CodeBlock search={detailSearch}>{selectedCall.pageUrl}</CodeBlock>
                    </DetailBlock>

                    <DetailBlock label="Cache">
                        <div className="flex w-full items-center justify-between">
                            {selectedCall.cached ? (
                                <span className="font-bold text-green-400">
                                    HIT{' '}
                                    {selectedCall.cacheStatus && `(${selectedCall.cacheStatus})`}
                                </span>
                            ) : selectedCall.cacheStatus ? (
                                <span className="font-bold text-orange-400">
                                    {selectedCall.cacheStatus}
                                </span>
                            ) : (
                                <span className="text-gray-600">—</span>
                            )}

                            {selectedCall.cacheTags && selectedCall.cacheTags.length > 0 && (
                                <button
                                    onClick={() => handleInvalidate(selectedCall.cacheTags!)}
                                    disabled={isPending}
                                    className="rounded bg-yellow-500 px-2 py-0.5 text-[10px] font-bold text-gray-900 uppercase transition-colors hover:bg-yellow-400 disabled:opacity-50"
                                >
                                    Invalidate Cache
                                </button>
                            )}
                        </div>
                    </DetailBlock>
                    <DetailBlock label="Cache tags">
                        {Array.isArray(selectedCall.cacheTags) ? (
                            selectedCall.cacheTags.map((tag) => <p key={tag}>· {tag}</p>)
                        ) : (
                            <span className="text-gray-600">—</span>
                        )}
                    </DetailBlock>

                    {selectedCall.debug?.successRule ? (
                        <DetailBlock label="Success Rule">
                            <CodeBlock className="text-green-300 no-break" search={detailSearch}>
                                {selectedCall.debug.successRule}
                            </CodeBlock>
                        </DetailBlock>
                    ) : null}

                    {selectedCall.curlCommand && (
                        <DetailBlock label="cURL">
                            <CodeBlock search={detailSearch}>{selectedCall.curlCommand}</CodeBlock>
                        </DetailBlock>
                    )}

                    {selectedCall.headers && Object.keys(selectedCall.headers).length > 0 && (
                        <DetailBlock label="Request Headers">
                            <JsonBlock value={selectedCall.headers} search={detailSearch} />
                        </DetailBlock>
                    )}
                    {selectedCall.requestBody && (
                        <DetailBlock label="Request Body">
                            <JsonBlock value={selectedCall.requestBody} search={detailSearch} />
                        </DetailBlock>
                    )}
                    {selectedCall.responseBody && (
                        <DetailBlock label="Response Body">
                            <JsonBlock value={selectedCall.responseBody} search={detailSearch} />
                        </DetailBlock>
                    )}
                    {selectedCall.responseHeaders &&
                        Object.keys(selectedCall.responseHeaders).length > 0 && (
                            <DetailBlock label="Response Headers">
                                <JsonBlock
                                    value={selectedCall.responseHeaders}
                                    search={detailSearch}
                                />
                            </DetailBlock>
                        )}
                    {selectedCall.error && (
                        <DetailBlock label="Error">
                            <CodeBlock className="text-red-300" search={detailSearch}>
                                {selectedCall.error}
                            </CodeBlock>
                        </DetailBlock>
                    )}

                    {selectedCall.error && selectedCall.debug?.errorRule ? (
                        <DetailBlock label="Error Rule">
                            <CodeBlock className="text-orange-300" search={detailSearch}>
                                {selectedCall.debug.errorRule}
                            </CodeBlock>
                        </DetailBlock>
                    ) : null}
                </div>
            ) : (
                <div className="flex flex-1 items-center justify-center">
                    <p className="text-xs text-gray-700">← Select a call</p>
                </div>
            )}
        </div>
    );
}
