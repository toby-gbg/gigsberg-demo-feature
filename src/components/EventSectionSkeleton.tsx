'use client';

import { cn } from '@/lib/cn';

import { Skeleton } from './ui/Skeleton';

interface EventSectionSkeletonProps {
    className?: string;
}

export default function EventSectionSkeleton({ className }: EventSectionSkeletonProps) {
    return <Skeleton className={cn('', className)} />;
}
