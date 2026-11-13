'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { ApiCallInfo } from '@/lib/debug/api-tracker';

import { useDebug } from '../DebugContext';
import { CallItem } from './CallItem';

export function CallListPanel() {
    const {
        apiCalls,
        selectedCall,
        setSelectedCall,
        refreshApiCalls,
        handleClearHistory,
        isPending,
    } = useDebug();

    const pathname = usePathname();
    const { refresh } = useRouter();

    const [searchTerm, setSearchTerm] = useState('');
    const [isPreviousExpanded, setIsPreviousExpanded] = useState(false);

    // Filter calls by search term
    const filteredCalls = useMemo(() => {
        const sorted = [...apiCalls].reverse();
        if (!searchTerm.trim()) return sorted;

        const term = searchTerm.toLowerCase();
        return sorted.filter(
            (call) =>
                call.endpoint.toLowerCase().includes(term) ||
                call.method.toLowerCase().includes(term)
        );
    }, [apiCalls, searchTerm]);

    // Group calls into current (recent) and previous
    const groupedCalls = useMemo(() => {
        const current: ApiCallInfo[] = [];
        const previous: ApiCallInfo[] = [];

        if (filteredCalls.length === 0) return { current, previous };

        const newestTimestamp = filteredCalls[0].timestamp;
        const TIME_GAP_THRESHOLD = 10000;

        filteredCalls.forEach((call) => {
            const isRecent = newestTimestamp - call.timestamp < TIME_GAP_THRESHOLD;

            if (isRecent && call.pathname === pathname) {
                current.push(call);
            } else {
                previous.push(call);
            }
        });

        return { current, previous };
    }, [filteredCalls]);

    const handleRefresh = () => {
        refresh();
        refreshApiCalls();
    };

    return (
        <div className="flex flex-col border-gray-700 border-r w-1/2">
            <div className="flex justify-between items-center px-3 py-2 border-gray-800 border-b shrink-0 h-8">
                <span className="font-semibold text-yellow-400 text-xs uppercase tracking-wider">
                    API Calls
                </span>
                <div className="text-[10px] text-gray-500">
                    <span className="text-blue-200">
                        Last call: {new Date().toLocaleTimeString()}
                    </span>
                </div>
                <div className="flex gap-1.5">
                    <button
                        onClick={handleRefresh}
                        disabled={isPending}
                        className="bg-gray-700 hover:bg-gray-600 disabled:opacity-40 px-2 py-0.5 rounded text-[10px] transition-colors"
                    >
                        {isPending ? '…' : 'Refresh'}
                    </button>
                    {apiCalls.length > 0 && (
                        <button
                            onClick={handleClearHistory}
                            disabled={isPending}
                            className="bg-red-800 hover:bg-red-700 disabled:opacity-40 px-2 py-0.5 rounded text-[10px] transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            <div className="px-2 py-1.5 border-gray-800 border-b shrink-0">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search endpoints..."
                        className="bg-gray-800 focus:bg-gray-750 border-gray-700 px-2 py-1 border rounded w-full text-[11px] text-gray-200 placeholder-gray-500 focus:outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="top-1/2 right-2 absolute text-gray-500 hover:text-gray-300 -translate-y-1/2"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 p-2 overflow-y-auto space-y-2">
                {groupedCalls.current.length === 0 && groupedCalls.previous.length === 0 ? (
                    <p className="mt-8 text-gray-600 text-xs text-center">
                        {searchTerm ? 'No matching calls' : 'No API calls tracked'}
                    </p>
                ) : (
                    <>
                        <div className="space-y-1">
                            {groupedCalls.current.map((call) => (
                                <CallItem
                                    key={call.id}
                                    call={call}
                                    isSelected={selectedCall?.id === call.id}
                                    onClick={() => setSelectedCall(call)}
                                />
                            ))}
                            {groupedCalls.current.length === 0 && !searchTerm && (
                                <p className="py-4 text-gray-600 text-[10px] text-center italic">
                                    No calls for current page
                                </p>
                            )}
                        </div>

                        {groupedCalls.previous.length > 0 && (
                            <div className="mt-4 border-gray-800 border-t pt-2">
                                <button
                                    onClick={() => setIsPreviousExpanded(!isPreviousExpanded)}
                                    className="flex items-center gap-2 hover:bg-gray-800 mb-2 px-1 py-1 rounded w-full text-gray-400 text-left transition-colors"
                                >
                                    <span
                                        className={`transform transition-transform duration-200 ${
                                            isPreviousExpanded ? 'rotate-90' : ''
                                        }`}
                                    >
                                        ▶
                                    </span>
                                    <span className="font-semibold text-[10px] uppercase tracking-wider">
                                        Previous call ({groupedCalls.previous.length})
                                    </span>
                                </button>

                                {isPreviousExpanded && (
                                    <div className="space-y-1">
                                        {groupedCalls.previous.map((call) => (
                                            <CallItem
                                                key={call.id}
                                                call={call}
                                                isSelected={selectedCall?.id === call.id}
                                                onClick={() => setSelectedCall(call)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
