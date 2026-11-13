import ToursSkeleton from '@/components/skeleton/ToursSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
    return (
        <div className="mb-14">
            <Skeleton className="mb-4 h-[1.5em] w-80 text-[24px] md:text-[28px] xl:text-heading" />
            <ToursSkeleton />
        </div>
    );
}
