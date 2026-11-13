import { MouseEventHandler, ReactNode } from 'react';

import { cn } from '@/lib/cn';

import Link from '@/components/Link';

interface Props {
    href: string;
    children: ReactNode;
    variant: 'primary' | 'secondary';
    onClickCapture?: MouseEventHandler<HTMLAnchorElement>;
}

export default function HeroCtaLink({ href, children, variant, onClickCapture }: Props) {
    return (
        <Link
            prefetch={false}
            href={href}
            onClickCapture={onClickCapture}
            className={cn(
                'cursor-pointer rounded-xl p-4 text-base backdrop-blur-md transition-all duration-300 hover:scale-105 md:p-5 md:text-2xl text-white w-fit flex justify-center items-center',
                variant === 'primary' &&
                    'text-on-main bg-gradient shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:shadow-[0_0_35px_rgba(255,255,255,0.4)]',
                variant === 'secondary' &&
                    'border-2 border-white/70 bg-black/30 hover:bg-white/16 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]'
            )}
        >
            <span
                className={cn(
                    'text-center leading-tight',
                    variant === 'secondary' && 'whitespace-nowrap'
                )}
            >
                {children}
            </span>
        </Link>
    );
}
