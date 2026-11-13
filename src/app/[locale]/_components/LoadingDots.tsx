import { ClassValue } from 'clsx';

import { cn } from '@/lib/cn';

export default function LoadingDots({
    className,
    dotClassName,
}: {
    className?: ClassValue;
    dotClassName?: ClassValue;
}) {
    return (
        <span className={cn('flex items-center gap-1', className)} aria-label="Loading">
            {[0, 1, 2].map((index) => (
                <span
                    key={index}
                    className={cn(
                        'bg-current opacity-60 rounded-full size-1 animate-bounce',
                        dotClassName
                    )}
                    style={{ animationDelay: `${index * 120}ms` }}
                />
            ))}
        </span>
    );
}
