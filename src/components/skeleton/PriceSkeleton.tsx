'use client';

import { FC } from 'react';

import { Skeleton } from '@/components/ui/Skeleton';

const PriceSkeleton: FC = () => {
    return <Skeleton className="h-5 w-16 md:h-6 md:w-20 rounded-lg ml-auto" />;
};

export default PriceSkeleton;
