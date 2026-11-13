import EventFiltersSkeleton from '@/components/event-filters/EventFiltersSkeleton';
import { ListEventDetailsCardSkeleton } from '@/components/EventDetailsCardSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
    return (
        <div className="mb-10">
            <Skeleton className="mb-5 h-[1.5em] w-full max-w-80 text-[24px] md:text-[28px] xl:text-heading" />
            <div className="hidden md:block">
                <EventFiltersSkeleton filterCount={3} />
            </div>
            <ListEventDetailsCardSkeleton cardCount={5} />
        </div>
    );
}
