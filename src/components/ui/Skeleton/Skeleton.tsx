import { type ComponentProps } from 'react';

import { cn } from '@/lib/cn';

type SkeletonAnimation = 'none' | 'pulse' | 'shimmer';

type SkeletonProps = ComponentProps<'div'> & {
    animationType?: SkeletonAnimation;
};

const animationClasses: Record<SkeletonAnimation, string> = {
    none: '',
    pulse: 'animate-pulse',
    shimmer:
        "after:absolute after:inset-0 after:-translate-x-full after:animate-skeleton after:bg-linear-to-r after:from-transparent after:via-surface-tertiary after:to-transparent after:content-['']",
};

const Skeleton = ({ animationType = 'pulse', className, ...props }: SkeletonProps) => {
    return (
        <div
            data-slot="skeleton"
            className={cn(
                'pointer-events-none relative overflow-hidden rounded-sm bg-zinc-200',
                animationClasses[animationType],
                className
            )}
            {...props}
        />
    );
};

export { Skeleton };
export type { SkeletonAnimation, SkeletonProps };
