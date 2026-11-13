'use client';

import { ApiCallInfo } from '@/lib/debug/api-tracker';

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

export const CallItem = ({
    call,
    isSelected,
    onClick,
}: {
    call: ApiCallInfo;
    isSelected: boolean;
    onClick: () => void;
}) => {
    return (
        <div
            onClick={onClick}
            className={`
            p-2 rounded text-xs cursor-pointer transition-colors relative group
            ${isSelected ? 'bg-gray-700 ring-1 ring-yellow-400/30' : 'bg-gray-800 hover:bg-gray-750'}
        `}
        >
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
                        ⚠ {call.debug?.errorRule}
                    </div>
                </>
            )}
            {call.debug?.successRule ? (
                <div className="mt-0.5 text-[10px] text-green-400 truncate">
                    {call.debug?.successRule}
                </div>
            ) : null}
        </div>
    );
};
