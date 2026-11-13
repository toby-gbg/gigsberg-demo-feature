import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ListingFilterSkeleton() {
    return (
        <Card className="hidden lg:block shadow-none mx-2 p-2 border border-neutral-400 rounded">
            <Skeleton className="rounded h-23.25" />
        </Card>
    );
}
