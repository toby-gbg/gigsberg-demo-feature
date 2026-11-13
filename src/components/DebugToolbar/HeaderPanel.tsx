'use client';

import { useDebug } from './DebugContext';

const Badge = ({ label, className }: { label: string; className: string }) => (
    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${className}`}>
        {label}
    </span>
);

const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    return ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(2)}s`;
};

export function HeaderPanel() {
    const { setIsOpen, apiCalls, websiteName, locale } = useDebug();

    const sortedCalls = [...apiCalls].reverse();
    const cachedCount = sortedCalls.filter((c) => c.cached).length;
    const freshCount = sortedCalls.length - cachedCount;
    const totalDuration = sortedCalls.reduce((sum, c) => sum + (c.duration ?? 0), 0);

    return (
        <div className="flex justify-between items-center bg-gray-900/95 backdrop-blur-sm px-4 py-3 border-gray-700 border-b shrink-0">
            <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-yellow-400 text-sm tracking-wide">🔧 DEBUG</span>
                <Badge
                    label={`${sortedCalls.length} calls`}
                    className="bg-gray-700 text-gray-200"
                />
                {cachedCount > 0 && (
                    <Badge
                        label={`${cachedCount} cached`}
                        className="bg-green-800 text-green-200"
                    />
                )}
                {freshCount > 0 && (
                    <Badge
                        label={`${freshCount} fresh`}
                        className="bg-orange-800 text-orange-200"
                    />
                )}
                {websiteName && <Badge label={websiteName} className="bg-blue-800 text-blue-200" />}
                {locale && <Badge label={locale} className="bg-purple-800 text-purple-200" />}

                <span className="text-[10px] text-gray-500">
                    {formatDuration(totalDuration)} total
                </span>
            </div>
            <button
                onClick={() => setIsOpen(false)}
                className="ml-2 text-gray-400 hover:text-white text-lg leading-none transition-colors"
                aria-label="Close debug panel"
            >
                ✕
            </button>
        </div>
    );
}
