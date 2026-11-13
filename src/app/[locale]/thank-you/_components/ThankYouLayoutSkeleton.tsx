import { Skeleton } from '@/components/ui/Skeleton';

const ThankYouLayoutSkeleton = () => (
    <div className="mx-auto max-w-6xl lg:grid grid-cols-12 py-10 md:py-16 gap-20 px-4">
        <div className="col-span-12 lg:col-span-7 space-y-4">
            <Skeleton className="shadow-xs h-61.25 rounded-2xl border border-neutral-400" />
            <Skeleton className="shadow-xs h-61.25 rounded-2xl border border-neutral-400" />

            <hr className="my-20 text-neutral-400" />

            <div className="hidden lg:flex flex-col md:flex-row gap-4">
                <Skeleton className="h-35 w-full rounded-2xl border border-neutral-400" />
                <Skeleton className="h-35 w-full rounded-2xl border border-neutral-400" />
            </div>
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-4">
            <Skeleton className="rounded-2xl h-105 shadow-xs border border-neutral-400" />
            <Skeleton className="rounded-2xl h-97.75 shadow-xs border border-neutral-400" />
        </div>

        <div className="lg:hidden pt-4 flex flex-col md:flex-row gap-4">
            <Skeleton className="h-35 w-full rounded-2xl border border-neutral-400" />
            <Skeleton className="h-35 w-full rounded-2xl border border-neutral-400" />
        </div>
    </div>
);

export default ThankYouLayoutSkeleton;
