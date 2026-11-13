'use client';

import { ButtonHTMLAttributes, FC, ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';

type ViewMoreButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children'> & {
    children?: ReactNode;
};

const ViewMoreButton: FC<ViewMoreButtonProps> = ({
    className,
    disabled,
    onClick,
    children,
    ...props
}) => {
    const t = useTranslations();

    return (
        <div className="flex justify-center pt-2">
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                className={cn(
                    'border-primary text-primary hover:bg-primary-light inline-flex cursor-pointer items-center justify-center gap-2 self-center rounded-lg border px-6 py-2.5 text-sm font-bold transition-all disabled:cursor-not-allowed! disabled:opacity-50',
                    className
                )}
                {...props}
            >
                <span>
                    {children ??
                        fallbackTranslation(
                            t('load_more_events'),
                            'load_more_events',
                            'Load More Events'
                        )}
                </span>

                <ChevronRight className="text-primary size-4 rtl:rotate-180" strokeWidth={2} />
            </button>
        </div>
    );
};

export default ViewMoreButton;
