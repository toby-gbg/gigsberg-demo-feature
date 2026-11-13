import { ChevronRight } from 'lucide-react';

import { Skeleton } from '@/components/ui/Skeleton';

const CheckoutLayoutSkeleton = () => (
    <div className="relative bg-white min-h-screen overflow-hidden font-normal">
        <header>
            <div className="flex justify-between items-center gap-5 mx-auto px-4 py-2 max-w-6xl min-h-16">
                <Skeleton className="w-45 h-10" />

                <div className="hidden md:block">
                    <div className="flex items-center gap-1 py-1">
                        <div className="flex items-center gap-2 px-1 py-1">
                            <Skeleton className="rounded-full size-6" />
                            <Skeleton className="w-32 h-5" />

                            <ChevronRight size={20} />

                            <Skeleton className="rounded-full size-6" />
                            <Skeleton className="w-32 h-5" />
                        </div>
                    </div>
                </div>

                <button
                    className="flex items-center p-1 px-2 border border-foreground-300 rounded-lg font-medium"
                    disabled
                >
                    <Skeleton className="rounded-md w-16 h-4" />
                    <span className="mx-1 text-foreground-400">|</span>
                    <Skeleton className="rounded-md w-8 h-4" />
                </button>
            </div>
        </header>

        <div className="bg-[#FAFAFA] w-full h-1"></div>

        <div className="flex flex-col lg:gap-10 lg:grid lg:grid-cols-12 mx-auto md:pt-10 max-w-6xl">
            <div id="checkout-payment" className="space-y-4 lg:col-span-7 p-4">
                <Skeleton className="w-96 max-w-full h-10" />

                <div className="space-y-2">
                    <Skeleton className="rounded w-32 h-7" />
                    <Skeleton className="rounded w-96 max-w-full h-6" />

                    <Skeleton className="mt-4 rounded-lg h-52" />
                </div>

                <div className="space-y-2">
                    <Skeleton className="rounded w-32 h-7" />
                    <Skeleton className="rounded w-96 max-w-full h-6" />

                    <Skeleton className="mt-4 rounded-lg h-52" />
                </div>

                <Skeleton className="rounded-lg h-14" />
            </div>

            <div className="space-y-2 md:space-y-4 lg:col-span-5 px-4">
                <Skeleton className="rounded-2xl h-103.75" />

                <Skeleton className="rounded-2xl h-85.75" />
            </div>
        </div>
    </div>
);

export default CheckoutLayoutSkeleton;
