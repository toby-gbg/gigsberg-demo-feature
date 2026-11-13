import { ReactNode } from 'react';
import Image from 'next/image';
import { ClassValue } from 'clsx';

import SectionOverlay from '@/assets/img/Section_Overlay.png';
import { cn } from '@/lib/cn';

import MainContainer from '@/components/MainContainer';
import MainTitle from '@/components/MainTitle';
import SocialLinks from '@/components/SocialLinks';

interface PageHeaderProps {
    title?: string;
    subtitle?: string;
    eyebrow?: string;
    meta?: string;
    showSocialLinks?: boolean;
    children?: ReactNode;
    classNames?: {
        wrapper?: ClassValue;
        imageOverlay?: ClassValue;
        container?: ClassValue;
        eyebrow?: ClassValue;
        title?: ClassValue;
        subtitle?: ClassValue;
        meta?: ClassValue;
    };
}

const PageHeader = ({
    title,
    subtitle,
    eyebrow,
    meta,
    showSocialLinks = true,
    classNames,
    children,
}: PageHeaderProps) => {
    return (
        <section
            className={cn(
                'relative overflow-hidden border-y border-gray-500/50 text-on-header bg-header-start',
                classNames?.wrapper
            )}
        >
            <Image
                src={SectionOverlay}
                alt=""
                fill
                sizes="100vw"
                className={cn(
                    'object-cover object-center opacity-25 mix-blend-hard-light',
                    classNames?.imageOverlay
                )}
                priority
            />
            <MainContainer className={cn('py-0', classNames?.container)}>
                <div className={'relative lg:py-10 py-7'}>
                    <div className="flex items-end justify-between">
                        <div className="flex flex-col gap-2">
                            {eyebrow && (
                                <p
                                    className={cn(
                                        'mb-2 text-xs font-bold tracking-[0.15em] text-orange-400 uppercase',
                                        classNames?.eyebrow
                                    )}
                                >
                                    {eyebrow}
                                </p>
                            )}
                            {title && <MainTitle title={title} className={cn(classNames?.title)} />}
                            {subtitle && (
                                <p
                                    className={cn(
                                        'text-sm xl:text-lg text-on-header/55',
                                        classNames?.subtitle
                                    )}
                                >
                                    {subtitle}
                                </p>
                            )}
                            {meta && (
                                <p
                                    className={cn(
                                        'mt-2 text-xs text-on-header/80',
                                        classNames?.meta
                                    )}
                                >
                                    {meta}
                                </p>
                            )}
                        </div>
                        {showSocialLinks && (
                            <SocialLinks className="hidden text-on-header md:flex" />
                        )}
                    </div>
                    {children}
                </div>
            </MainContainer>
        </section>
    );
};

export default PageHeader;
