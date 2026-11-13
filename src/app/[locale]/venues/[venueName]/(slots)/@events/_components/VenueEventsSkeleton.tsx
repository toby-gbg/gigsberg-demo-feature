import { ListEventDetailsCardSkeleton } from '@/components/EventDetailsCardSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function VenueEventsSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-[1.5em] w-full max-w-60 rounded-lg text-[24px] md:text-[28px] xl:text-heading" />
            <ListEventDetailsCardSkeleton />
        </div>
    );
}
