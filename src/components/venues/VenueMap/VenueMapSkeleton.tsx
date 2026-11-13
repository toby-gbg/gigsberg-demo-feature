'use client';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

const VenueMapSkeleton = (_props: { isLoaded?: boolean }) => {
    return (
        <Card className="space-y-2 shadow-none mb-2 ml-0 lg:ml-2 p-2 border border-neutral-400 rounded">
            <Skeleton className="bg-default-300 rounded h-62.5 lg:h-131.75" />
        </Card>
    );
};

export default VenueMapSkeleton;
