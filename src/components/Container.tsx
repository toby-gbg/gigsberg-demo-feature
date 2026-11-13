'use client';

import { FC, HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

const Container: FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
    return <div className={cn('px-4 sm:px-6 lg:px-20', className)} {...props} />;
};

export default Container;
