import { ComponentPropsWithoutRef } from 'react';
import type { MDXComponents } from 'mdx/types';

import { cn } from '@/lib/cn';

export const mdxComponents = {
    h2: ({ className, ...props }: ComponentPropsWithoutRef<'h2'>) => (
        <h2
            className={cn(
                'mt-8 scroll-mt-24 border-t border-[#e1e7f0] pt-8 text-lg leading-tight font-bold text-[#0c1524] first:mt-0 first:border-0 first:pt-0 md:text-xl',
                className
            )}
            {...props}
        />
    ),
    h3: ({ className, ...props }) => (
        <h3
            className={cn('mt-6 mb-3 text-base font-bold text-[#0c1524] md:text-lg', className)}
            {...props}
        />
    ),
    h4: ({ className, ...props }) => (
        <h4 className={cn('mt-6 mb-3 font-bold text-[#0c1524]', className)} {...props} />
    ),
    p: ({ className, ...props }) => (
        <p className={cn('text-sm mt-4 text-[#4c596e]', className)} {...props} />
    ),
    a: ({ className, ...props }) => (
        <a
            className={cn('text-sm text-main-end underline underline-offset-2', className)}
            {...props}
        />
    ),
    ul: ({ className, ...props }) => (
        <ul
            className={cn('text-sm mt-4 list-disc space-y-2 pl-6 text-[#4c596e]', className)}
            {...props}
        />
    ),
    ol: ({ className, ...props }) => (
        <ol
            className={cn('text-sm mt-4 list-decimal space-y-2 pl-6 text-[#4c596e]', className)}
            {...props}
        />
    ),
} satisfies MDXComponents;
