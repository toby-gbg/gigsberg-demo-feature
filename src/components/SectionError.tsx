'use client';

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';

interface SectionErrorProps {
    children?: ReactNode;
    className?: string;
    shouldShowErrorMessage?: boolean;
}

export default function SectionError({
    children,
    className,
    shouldShowErrorMessage = true,
}: SectionErrorProps) {
    const t = useTranslations();

    return (
        <div className={cn('relative', className)}>
            <div aria-hidden className="pointer-events-none select-none relative">
                {children}
            </div>
            {shouldShowErrorMessage && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-center text-lg text-gray-500">
                        {fallbackTranslation(
                            t('section_load_error'),
                            'section_load_error',
                            'Unable to load this section'
                        )}
                    </p>
                </div>
            )}
        </div>
    );
}
