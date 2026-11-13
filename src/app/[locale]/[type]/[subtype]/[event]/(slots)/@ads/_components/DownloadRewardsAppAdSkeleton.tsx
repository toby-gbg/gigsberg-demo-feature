import { Skeleton } from '@/components/ui/Skeleton';

export default function DownloadRewardsAppAdSkeleton() {
    return (
        <div
            aria-hidden="true"
            className="relative bg-linear-to-t from-[#4334F0] to-[#8461E6] shadow-2xl rounded-lg w-full aspect-[33/16] overflow-hidden"
        >
            <Skeleton className="-top-12 left-4 absolute opacity-30 rounded-3xl w-44 h-32 rotate-12" />

            <div className="right-0 bottom-0 left-0 absolute flex flex-col gap-1.5 p-3">
                <Skeleton className="bg-white/30 rounded-sm w-48 h-5" />
                <div className="flex items-center gap-2">
                    <Skeleton className="bg-black/40 rounded-md w-[135px] h-10" />
                    <Skeleton className="bg-black/40 rounded-md w-[116px] h-10" />
                </div>
            </div>
        </div>
    );
}
