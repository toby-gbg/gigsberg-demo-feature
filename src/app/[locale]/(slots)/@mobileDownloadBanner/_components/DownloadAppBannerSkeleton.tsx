import { Skeleton } from '@/components/ui/Skeleton/Skeleton';

export default function DownloadAppBannerSkeleton() {
    return (
        <div aria-hidden="true" className="relative overflow-hidden rounded-lg bg-[#dcecff]">
            <div className="flex min-h-[362px] flex-col gap-5 p-4 min-[473px]:min-h-0 md:gap-4 md:px-10 md:py-4 lg:min-h-[294px] lg:gap-5 lg:py-6">
                <div className="flex w-[70%] flex-col gap-6 md:w-[60%] md:max-w-[450px] md:gap-4 lg:w-[48%]">
                    <Skeleton className="h-20 md:h-10 motion-reduce:animate-none" />
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-full motion-reduce:animate-none" />
                        <Skeleton className="h-3 w-full motion-reduce:animate-none" />
                        <Skeleton className="h-3 w-4/5 motion-reduce:animate-none" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-12 w-[162px] motion-reduce:animate-none" />
                    <Skeleton className="h-12 w-[139px] motion-reduce:animate-none" />
                </div>
                <Skeleton className="mt-auto h-8 w-full md:max-w-[450px] motion-reduce:animate-none" />
            </div>
            <Skeleton className="absolute top-4 end-0 h-44 w-[30%] md:top-auto md:bottom-0 md:h-52 md:w-[24%] lg:end-[14%] lg:h-64 lg:w-[30%] md:max-w-[300px] motion-reduce:animate-none" />
        </div>
    );
}
