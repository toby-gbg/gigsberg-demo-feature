'use client';

import { FC, HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';
import { capitalizeWords, REGEXP_PREPOSITIONS_MATCH } from '@/utils/common';

import useFont from '@/hooks/useFont';

interface MainTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    title?: string;
    hidden?: boolean;
    fontClassName?: string; // Pass className instead of font object
}

const MainTitle: FC<MainTitleProps> = ({
    children,
    title,
    className,
    hidden = false,
    fontClassName,
    ...props
}) => {
    const { sectionTitleFont } = useFont();
    return (
        <h1
            className={cn(
                'font-semibold text-[40px] text-4xl leading-12 2xl:leading-14',
                {
                    'absolute overflow-hidden h-px w-px p-0 border-0': hidden,
                },
                sectionTitleFont?.className,
                fontClassName,
                className
            )}
            style={{
                clipPath: hidden ? 'inset(0px 0px 99.9% 99.9%)' : 'none',
                clip: hidden ? 'rect(1px, 1px, 1px, 1px)' : 'auto',
                WebkitClipPath: hidden ? 'inset(0px 0px 99.9% 99.9%)' : 'none',
            }}
            {...props}
        >
            {capitalizeWords(title || '', REGEXP_PREPOSITIONS_MATCH)}
            {children}
        </h1>
    );
};

export default MainTitle;
