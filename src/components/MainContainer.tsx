'use client';

import { FC, HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

interface MainContainerProps extends HTMLAttributes<HTMLDivElement> {
    containerClassName?: string;
}

const MainContainer: FC<MainContainerProps> = ({ className, containerClassName, ...props }) => {
    return (
        <div className={cn('px-2 md:px-4 w-full', containerClassName)}>
            <div className={cn('mx-auto w-full max-w-350', className)} {...props} />
        </div>
    );
};

export default MainContainer;
