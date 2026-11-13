'use client';

import Website from '@/interfaces/Website';

import ResizableDrawer from '../ResizableDrawer';
import { CallListPanel } from './CallListPanel';
import { DebugProvider, useDebug } from './DebugContext';
import { DetailPanel } from './DetailPanel';
import { HeaderPanel } from './HeaderPanel';

const DebugToolbarContent = () => {
    const { isOpen, setIsOpen } = useDebug();
    return (
        <ResizableDrawer
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            minSize={500}
            initialSize={800}
            placement="right"
            trigger={
                <button
                    className="top-1/2 right-0 z-50 fixed bg-yellow-400 hover:bg-yellow-300 shadow-lg p-1.5 rounded-r-md font-bold text-[9px] text-gray-900 tracking-widest transition-colors cursor-pointer writing-mode-vertical [writing-mode:vertical-rl]"
                    style={{
                        writingMode: 'vertical-rl',
                        transform: 'translateY(-50%) rotate(180deg)',
                    }}
                    aria-label="Open debug panel"
                >
                    ⚙ DEBUG API
                </button>
            }
        >
            <div className="flex flex-col bg-gray-900 h-full text-white">
                <HeaderPanel />
                <div className="relative flex-1 grid grid-cols-[1fr_1.5fr] max-h-[95vh] overflow-hidden">
                    <CallListPanel />
                    <DetailPanel />
                </div>
            </div>
        </ResizableDrawer>
    );
};

export default function DebugToolbar({
    locale,
    website,
}: {
    locale?: string;
    // optional override for trees without SiteProvider (e.g. not-found);
    // inside DataFetcher tree value resolves from useSite().website hook
    website?: Website | null;
}) {
    return (
        <DebugProvider locale={locale} website={website ?? undefined}>
            <DebugToolbarContent />
        </DebugProvider>
    );
}
