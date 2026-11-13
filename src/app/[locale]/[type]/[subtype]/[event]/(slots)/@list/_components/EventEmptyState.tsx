'use client';

import { ReactNode, useState } from 'react';
import Image from 'next/image';
import { useQueryStates } from '@/nuqs/hooks/useQueryStates';
import { useTranslations } from 'next-intl';
import { SubmitHandler, useForm } from 'react-hook-form';

import { NewsletterForm } from '@/interfaces/Newsletter';
import { cn } from '@/lib/cn';
import { fallbackTranslation, generateBreadcrumbs } from '@/utils/common';
import { useRegisterPerformerNotifyMutation } from '@/swr/features/newsletter';

import { useSite } from '@/providers/SiteProvider';

import { eventFilterParsers } from '@/components/event-filters/event-filter.schema';
import Link from '@/components/Link';
import NotifyEmailInput from '@/components/NotifyEmailInput';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

import { useEntityContext } from '../../../_providers/EntityProvider';

export default function EventEmptyState() {
    const t = useTranslations();
    const [isSuccess, setIsSuccess] = useState(false);
    const [_, setSearchParams] = useQueryStates(eventFilterParsers);

    // Form
    const { control, reset, handleSubmit } = useForm<NewsletterForm>();

    // Context
    const { entityMetadata, type, subtype, hasNoFilters } = useEntityContext();
    const { config } = useSite().domainInfo || {};
    const useBrandStyling = config?.features?.useBrandStyling || false;

    const isPerformer = entityMetadata?.type === 'performer';

    // Breadcrumb
    const breadcrumbs = generateBreadcrumbs(t, {
        type,
        subtype,
    });
    const backUrl = breadcrumbs[breadcrumbs.length - 1].href;

    const { trigger: registerPerformerNotify, isMutating: isLoading } =
        useRegisterPerformerNotifyMutation({
            onSuccess: () => {
                setIsSuccess(true);
                reset();
            },
            onError: (error) => {
                console.error('Failed to send performer notification', error);
                setIsSuccess(true);
            },
        });

    const handleResetUrl = () => {
        // remove search params
        setSearchParams(null);
    };

    const onSubmit: SubmitHandler<NewsletterForm> = async (data) => {
        registerPerformerNotify({
            email: data.email,
            performerId: entityMetadata?.entity.id ?? 0,
        });
    };

    const bellIconImage = isSuccess
        ? '/icons/bell_checked.svg'
        : isPerformer
          ? '/icons/bell.svg'
          : '/icons/filter_ticket_icon.svg';
    const iconImage = hasNoFilters ? bellIconImage : '/icons/filter_ticket_icon.svg';

    const noFilterTitleKey = isSuccess ? 'on_the_list' : 'no_events_now_title';
    const noFilterDescKey = isSuccess
        ? 'event_announcement_message'
        : isPerformer
          ? 'no_events_now_desc'
          : 'no_result_message';
    const noFilterTitle =
        isSuccess && isPerformer ? 'You’re on the list!' : 'No upcoming events right now';

    return (
        <div className="flex flex-col justify-center items-center gap-6 mx-auto py-4 w-full max-w-132">
            <div className="flex justify-center items-center p-4 border rounded-full w-14.5 h-14.5 text-gray-500">
                <Image alt="icon" src={iconImage} width={24} height={24} />
            </div>
            <div className="flex flex-col gap-2">
                <p className="font-bold text-black text-2xl text-center">
                    {fallbackTranslation(
                        t(hasNoFilters ? noFilterTitleKey : 'no_events_found_title'),
                        hasNoFilters ? noFilterTitleKey : 'no_events_found_title',
                        hasNoFilters ? noFilterTitle : 'No events found for this search'
                    )}
                </p>
                <p className="text-[#A0A0A0] text-xl text-center">
                    {t.rich(hasNoFilters ? noFilterDescKey : 'no_events_found_message', {
                        name: entityMetadata?.entity?.name || '',
                        highlight: (chunks: ReactNode) => (
                            <span
                                className={cn(
                                    'font-bold text-primary',
                                    useBrandStyling && 'text-[#1565C0]'
                                )}
                            >
                                {chunks}
                            </span>
                        ),
                    })}
                </p>
            </div>
            {!isSuccess && hasNoFilters && isPerformer && (
                <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex items-start gap-2 rounded-lg w-full overflow-hidden">
                        <div className="flex flex-col gap-2 w-full">
                            <NotifyEmailInput control={control} />
                        </div>
                        <div className="flex flex-1 justify-center items-center w-full min-w-28">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className={cn(
                                    'w-full bg-solid px-4 py-2 border border-on-main min-h-10 text-on-solid',
                                    useBrandStyling && 'border-[#1565C0] bg-[#1565C0] text-white'
                                )}
                            >
                                {isLoading ? (
                                    <Spinner className="size-4 text-white" />
                                ) : (
                                    <span className="font-bold text-white text-sm">
                                        {fallbackTranslation(
                                            t('notify_me'),
                                            'notify_me',
                                            'Notify me'
                                        )}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            )}
            <div className="flex justify-center items-center gap-2">
                {!hasNoFilters && (
                    <Button
                        type="button"
                        className={cn(
                            'font-bold text-base',
                            useBrandStyling && 'bg-[#1565C0] text-white'
                        )}
                        onClick={handleResetUrl}
                    >
                        {fallbackTranslation(t('reset_search'), 'reset_search', 'Reset search')}
                    </Button>
                )}

                <Link href={backUrl} prefetch={false}>
                    <Button
                        variant="ghost"
                        className={cn(!hasNoFilters && 'rounded-lg border border-gray-300')}
                        prefixIcon={
                            hasNoFilters ? (
                                <Image
                                    src="/icons/arrow_left_icon.svg"
                                    alt=""
                                    width={16}
                                    height={16}
                                    className="size-4"
                                />
                            ) : undefined
                        }
                    >
                        <span className="text-gray-800 text-base">
                            {fallbackTranslation(t('back'), 'back', 'Back')}
                        </span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}
