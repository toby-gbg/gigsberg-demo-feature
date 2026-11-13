import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

type Props = { isLoaded?: boolean };

const ListingInfoSkeleton = ({ isLoaded }: Props) => {
    return (
        <Card className="rounded border p-2 shadow-none">
            <div className="flex justify-between gap-4">
                <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-10 w-full rounded" />
                    <Skeleton className="h-8 w-[75%] rounded" />
                </div>

                <div className="flex flex-1 justify-between gap-2">
                    <div className="hidden h-full lg:block">
                        <div className="text-primary">
                            {isLoaded ? (
                                <div className="mb-1 h-4 w-24 rounded-md" />
                            ) : (
                                <Skeleton className="mb-1 h-4 w-24 rounded-md" />
                            )}

                            <div className="flex gap-3">
                                {Array.from({ length: 4 }).map((_, i) =>
                                    isLoaded ? (
                                        <div key={i} className="size-8 rounded-full" />
                                    ) : (
                                        <Skeleton key={i} className="size-8 rounded-full" />
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-2 lg:w-64">
                        {!isLoaded && (
                            <>
                                <Skeleton className="h-10 w-full rounded" />
                                <Skeleton className="h-8 w-[75%] rounded" />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ListingInfoSkeleton;
