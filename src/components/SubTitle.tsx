'use client';

import { createElement, FC, HTMLAttributes } from 'react';

import { WebsiteFonts } from '@/interfaces/Website';
import { cn } from '@/lib/cn';

import useFont from '@/hooks/useFont';

type HeadingLevel = 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface SubTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    title: string;
    websiteFont?: WebsiteFonts;
    level?: HeadingLevel;
    fontClassName?: string;
}

const SubTitle: FC<SubTitleProps> = ({
    title,
    level = 'h2',
    className,
    fontClassName,
    ...props
}) => {
    const { sectionTitleFont } = useFont();
    return createElement(
        level,
        {
            className: cn(
                {
                    'text-2xl md:text-[28px] font-heading xl:text-heading': level === 'h2',
                    'text-[22px] font-heading xl:text-2xl': level === 'h3',
                    'text-2xl xl:text-3xl': level === 'h4',
                    'text-xl xl:text-2xl': level === 'h5',
                    'text-lg xl:text-xl': level === 'h6',
                },
                'text-gray-800',
                sectionTitleFont,
                fontClassName,
                className
            ),
            ...props,
        },
        title
    );
};

export default SubTitle;
