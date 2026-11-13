import EventCardSkeleton from '@/components/event-card/EventCardSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Error() {
    return (
        <div className="mb-14">
            <Skeleton className="mb-8 h-[1.5em] w-80 text-[24px] md:text-[28px] xl:text-heading" />

            <EventCardSkeleton className="mb-10" />
        </div>
    );
}
