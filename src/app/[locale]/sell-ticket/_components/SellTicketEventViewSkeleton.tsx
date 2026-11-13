'use client';

import { FC } from 'react';

import MainContainer from '@/components/MainContainer';
import { Skeleton } from '@/components/ui/Skeleton';

const SellTicketEventViewSkeleton: FC = () => {
    return (
        <div className="bg-white py-6">
            <MainContainer>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left Side - Summary Skeleton */}
                    <div className="col-span-1 h-fit rounded-lg bg-white shadow-md lg:col-span-4">
                        {/* Header */}
                        <Skeleton className="rounded-t-lg">
                            <div className="bg-default-300 h-10 rounded-t-lg" />
                        </Skeleton>
                        {/* Image */}
                        <Skeleton className="">
                            <div className="bg-default-300 h-56 2xl:h-100" />
                        </Skeleton>
                        {/* Content */}
                        <div className="space-y-4 p-6">
                            <Skeleton className="w-1/3 rounded-lg">
                                <div className="bg-default-200 h-4 w-full rounded-lg" />
                            </Skeleton>
                            <div className="grid grid-cols-2 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="contents">
                                        <Skeleton className="w-2/3 rounded-lg">
                                            <div className="bg-default-200 h-4 w-full rounded-lg" />
                                        </Skeleton>
                                        <Skeleton className="w-1/2 justify-self-end rounded-lg">
                                            <div className="bg-default-200 h-4 w-full rounded-lg" />
                                        </Skeleton>
                                    </div>
                                ))}
                            </div>
                            <hr className="border-gray-200" />
                            <div className="mt-6 grid grid-cols-2 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="contents">
                                        <Skeleton className="w-2/3 rounded-lg">
                                            <div className="bg-default-200 h-4 w-full rounded-lg" />
                                        </Skeleton>
                                        <Skeleton className="w-1/2 justify-self-end rounded-lg">
                                            <div className="bg-default-200 h-4 w-full rounded-lg" />
                                        </Skeleton>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form Skeleton */}
                    <div className="col-span-1 lg:col-span-8">
                        {/* Stepper Header */}
                        <div className="mb-6 flex flex-col">
                            <Skeleton className="w-48 rounded-t-lg">
                                <div className="bg-default-200 h-10 w-48 rounded-t-lg" />
                            </Skeleton>
                            <div className="rounded-b-lg border border-gray-100 bg-white pb-6">
                                <div className="flex gap-5 p-5">
                                    <Skeleton className="flex-1 rounded-lg">
                                        <div className="bg-default-200 h-27.5 w-full rounded-lg" />
                                    </Skeleton>
                                    <Skeleton className="flex-1 rounded-lg">
                                        <div className="bg-default-200 h-27.5 w-full rounded-lg" />
                                    </Skeleton>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 gap-4 px-6 sm:grid-cols-2 lg:grid-cols-12">
                                    {/* Mimic SellTicketMainDetails */}
                                    <Skeleton className="col-span-12 rounded-lg">
                                        <div className="bg-default-200 h-14 w-full rounded-lg" />
                                    </Skeleton>
                                    <Skeleton className="col-span-12 rounded-lg">
                                        <div className="bg-default-200 h-14 w-full rounded-lg" />
                                    </Skeleton>

                                    {/* Mimic SellTicketSeatingDetails */}
                                    <Skeleton className="col-span-12 rounded-lg sm:col-span-6">
                                        <div className="bg-default-200 h-14 w-full rounded-lg" />
                                    </Skeleton>
                                    <Skeleton className="col-span-12 rounded-lg sm:col-span-6">
                                        <div className="bg-default-200 h-14 w-full rounded-lg" />
                                    </Skeleton>
                                    <Skeleton className="col-span-12 rounded-lg sm:col-span-6">
                                        <div className="bg-default-200 h-14 w-full rounded-lg" />
                                    </Skeleton>
                                    <Skeleton className="col-span-12 rounded-lg sm:col-span-6">
                                        <div className="bg-default-200 h-14 w-full rounded-lg" />
                                    </Skeleton>

                                    {/* Mimic SellTicketPriceDetails */}
                                    <Skeleton className="col-span-12 rounded-lg">
                                        <div className="bg-default-200 h-14 w-full rounded-lg" />
                                    </Skeleton>
                                    <Skeleton className="col-span-12 rounded-lg">
                                        <div className="bg-default-200 h-14 w-full rounded-lg" />
                                    </Skeleton>

                                    {/* Mimic SellTicketLastDetails */}
                                    <Skeleton className="col-span-12 rounded-lg">
                                        <div className="bg-default-200 h-32 w-full rounded-lg" />
                                    </Skeleton>

                                    {/* Button */}
                                    <Skeleton className="col-span-12 ms-auto w-32 rounded-lg">
                                        <div className="bg-default-300 h-12 w-32 rounded-lg" />
                                    </Skeleton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </MainContainer>
        </div>
    );
};

export default SellTicketEventViewSkeleton;
