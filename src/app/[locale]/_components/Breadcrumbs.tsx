'use client';

import { memo } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { useParams, useSelectedLayoutSegment } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { generateBreadcrumbs } from '@/utils/common';

import Link from '@/components/Link';

type CheckParams = { type?: string; subtype?: string; event?: string };

const Breadcrumbs = () => {
    const t = useTranslations();
    const { type, subtype, event } = useParams<CheckParams>();
    const segment = useSelectedLayoutSegment();

    const showBreadcrumbs = !segment === null || !!type || !!subtype;

    if (!showBreadcrumbs || !type) return null;

    const breadcrumbs = generateBreadcrumbs(t, { type, subtype, event });

    return (
        <nav
            aria-label="nav-breadcrumb"
            className="hidden xl:flex justify-center items-center bg-main-end w-full [border-block:var(--breadcrumb-border)]"
        >
            <ol className="inline-flex items-center m-0 p-0 xl:p-2 min-[1475px]:px-2 xl:px-5 w-full min-[1475px]:max-w-384 min-[1920px]:max-w-450 min-[2560px]:max-w-600 overflow-x-auto overflow-y-hidden text-on-main text-sm leading-normal list-none scrollbar-none!">
                {breadcrumbs.map((item, index) => {
                    const isCurrent = breadcrumbs.length === index + 1;
                    const hasNext = index < breadcrumbs.length - 1;

                    return (
                        <Fragment key={item?.href}>
                            <li className="inline min-w-fit align-middle">
                                <Link
                                    prefetch={false}
                                    href={item?.href || '/'}
                                    aria-current={isCurrent ? 'page' : undefined}
                                    className={cn(
                                        'inline text-on-main hover:underline align-middle',
                                        { 'font-bold': isCurrent }
                                    )}
                                >
                                    <span className="wrap-break-word">{item.name}</span>
                                </Link>
                            </li>

                            {hasNext && (
                                <li
                                    className="inline font-bold text-on-main align-middle"
                                    aria-hidden="true"
                                >
                                    <ChevronRight
                                        size={14}
                                        className="inline-block mx-2 text-on-main align-middle"
                                    />
                                </li>
                            )}
                        </Fragment>
                    );
                })}
            </ol>
        </nav>
    );
};

export default memo(Breadcrumbs);
