'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { ApiCallInfo } from '@/lib/debug/api-tracker';

import { useDebug } from './DebugContext';

const Badge = ({ label, className }: { label: string; className: string }) => (
    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${className}`}>
        {label}
    </span>
);

const getStatusColor = (status?: number) => {
    if (!status) return 'bg-gray-500';
    if (status < 300) return 'bg-green-500';
    if (status < 400) return 'bg-blue-500';
    if (status < 500) return 'bg-orange-500';
    return 'bg-red-500';
};

const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    return ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(2)}s`;
};

const CallItem = ({
    call,
    isSelected,
    onClick,
}: {
    call: ApiCallInfo;
    isSelected: boolean;
    onClick: () => void;
}) => (
    <div
        onClick={onClick}
        className={`
            p-2 rounded text-xs cursor-pointer transition-colors relative group
            ${isSelected ? 'bg-gray-700 ring-1 ring-yellow-400/30' : 'bg-gray-800 hover:bg-gray-750'}
        `}
    >
        {call.debug?.callPoint ? (
            <Badge
                label={call.debug.callPoint}
                className="bg-teal-900 text-teal-300 mb-1 w-fit line-clamp-1"
            />
        ) : null}
        <div className="flex justify-between items-center mb-0.5">
            <div className="flex items-center gap-1.5">
                <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusColor(call.status)}`}
                />
                <span className="font-mono font-bold text-[11px]">{call.method}</span>
                {call.cached && <Badge label="HIT" className="bg-green-900 text-green-300" />}
                {call.cacheStatus && !call.cached && (
                    <Badge label={call.cacheStatus} className="bg-orange-900 text-orange-300" />
                )}
            </div>

            <div className="space-x-4">
                <span className="text-[10px] text-gray-500 shrink-0">
                    {formatDuration(call.duration)}
                </span>

                <span className="text-[10px] text-blue-200 shrink-0">
                    {new Date(call.timestamp).toLocaleTimeString()}
                </span>
            </div>
        </div>
        <div className="font-mono text-[10px] text-gray-400 truncate">{call.endpoint}</div>
        {call.error && (
            <>
                <div className="mt-0.5 text-[10px] text-red-400 truncate">⚠ {call.error}</div>
                <div className="mt-0.5 text-[10px] text-orange-400 truncate">
                    {call.debug?.errorRule}
                </div>
            </>
        )}
        {call.debug?.successRule ? (
            <div className="mt-0.5 text-[10px] text-green-400">{call.debug?.successRule}</div>
        ) : null}
    </div>
);

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

    const groupedCalls = useMemo(() => {
        const current: ApiCallInfo[] = [];
        const previous: ApiCallInfo[] = [];

        if (filteredCalls.length === 0) return { current, previous };

        // We consider calls "current" if they belong to the latest batch for this pathname.
        // A gap of 10 seconds or a different pathname marks the end of the current batch.
        const newestTimestamp = filteredCalls[0].timestamp;
        const TIME_GAP_THRESHOLD = 10000; // 10 seconds

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
        <div className="flex flex-col border-gray-700 border-r overflow-auto">
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
                        {/* Current call */}
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

                        {/* Previous call */}
                        {groupedCalls.previous.length > 0 && (
                            <div className="mt-4 border-gray-800 border-t pt-2">
                                <button
                                    onClick={() => setIsPreviousExpanded(!isPreviousExpanded)}
                                    className="flex items-center gap-2 hover:bg-gray-800 mb-2 px-1 py-1 rounded w-full text-gray-400 text-left transition-colors"
                                >
                                    <span
                                        className={`transform transition-transform duration-200 ${isPreviousExpanded ? 'rotate-90' : ''}`}
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
