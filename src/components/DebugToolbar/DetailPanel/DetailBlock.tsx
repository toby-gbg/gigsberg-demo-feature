import { ReactNode } from 'react';

export default function DetailBlock({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5 relative text-xs">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{label}</p>
            <div className="font-mono break-all">{children}</div>
        </div>
    );
}
