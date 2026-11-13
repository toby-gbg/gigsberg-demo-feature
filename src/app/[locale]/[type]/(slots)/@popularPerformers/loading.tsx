import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
    return (
        <div className="mb-14">
            <Skeleton className="mb-8 h-[1.5em] w-80 text-[24px] md:text-[28px] xl:text-heading" />
            <div className="flex gap-4">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="w-[25%] space-y-4">
                        <Skeleton className="aspect-16/12" />
                        <Skeleton className="w-30 h-7" />
                    </div>
                ))}
            </div>
        </div>
    );
}
