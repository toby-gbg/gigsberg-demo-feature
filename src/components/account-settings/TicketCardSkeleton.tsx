import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function TicketCardSkeleton() {
    return (
        <div className="col-span-12 flex flex-col gap-4" aria-hidden="true">
            <Card className="mx-auto w-full rounded-lg border border-neutral-400 bg-white p-0 shadow-none">
                <CardContent className="p-4 md:p-6">
                    <div className="flex w-full flex-col gap-4">
                        <div className="min-w-0 flex-1 space-y-2">
                            <Skeleton className="h-5 w-full rounded" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-full rounded" />
                                <Skeleton className="h-4 w-full rounded" />
                                <Skeleton className="h-4 w-full rounded" />
                                <Skeleton className="h-3 w-15 rounded-full" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                            {Array.from({ length: 14 }).map((_, fieldIndex) => (
                                <div key={fieldIndex} className="flex min-h-11 flex-col gap-1">
                                    <Skeleton className="h-4 w-24 rounded" />
                                    <Skeleton className="h-5 w-20 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
