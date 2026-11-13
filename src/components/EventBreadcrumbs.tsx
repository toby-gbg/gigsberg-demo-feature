'use client';

import { FC, Fragment, memo } from 'react';
import { useParams } from 'next/navigation';
import classNames from 'classnames';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { generateBreadcrumbs } from '@/utils/common';

import Link from '@/components/Link';

const BREADCRUMB_ICON_SIZE = 14;

const EventBreadcrumbs: FC = () => {
    const t = useTranslations();
    const { type, subtype, event } = useParams<{
        type?: string;
        subtype?: string;
        event?: string;
    }>();

    if (!type) return null;

    const breadcrumbs = generateBreadcrumbs(t, { type, subtype, event });

    return (
        <nav aria-label="Breadcrumb" className="mx-auto xl:px-5 min-w-0 min-[1475px]:max-w-384">
            <ol className="inline-flex items-center m-0 p-0 overflow-x-auto overflow-y-hidden text-on-main text-sm leading-normal list-none scrollbar-none!">
                {breadcrumbs.map((item, index) => {
                    const isDestination = breadcrumbs.length === index + 1;

                    return (
                        <Fragment key={index}>
                            <li className="inline min-w-fit align-middle">
                                <Link
                                    prefetch={false}
                                    href={item?.href || '/'}
                                    aria-current={isDestination ? 'page' : undefined}
                                    className={classNames(
                                        'inline p-0.75 align-middle hover:underline md:p-1.5 text-on-main',
                                        {
                                            'pointer-events-none font-bold': isDestination,
                                        }
                                    )}
                                >
                                    <span className="wrap-break-word">{item.name}</span>
                                </Link>
                            </li>

                            {index < breadcrumbs.length - 1 && (
                                <li
                                    className="inline font-bold text-on-main align-middle"
                                    aria-hidden="true"
                                >
                                    <ChevronRight
                                        size={BREADCRUMB_ICON_SIZE}
                                        className="inline-block mx-0.5 text-on-main align-middle"
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

export default memo(EventBreadcrumbs);
