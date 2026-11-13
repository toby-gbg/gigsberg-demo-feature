import { Star } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

const AccountSettingsItemSkeleton = () => {
    return (
        <div className="col-span-12 flex flex-col gap-y-5" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, index) => (
                <Card
                    key={index}
                    className="mx-auto w-full rounded-lg border border-gray-400 bg-white p-4 shadow-none"
                >
                    <CardContent>
                        <div className="flex w-full flex-col gap-1">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-40 rounded" />
                                    <Star
                                        className="size-5 animate-pulse text-zinc-200"
                                        fill="currentColor"
                                    />
                                </div>
                                <Skeleton className="size-9 rounded-lg" />
                            </div>

                            <div className="mt-1 space-y-1.5">
                                <Skeleton className="h-4 w-32 rounded" />
                                <Skeleton className="h-4 w-56 rounded" />
                                <Skeleton className="h-4 w-44 rounded" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default AccountSettingsItemSkeleton;
