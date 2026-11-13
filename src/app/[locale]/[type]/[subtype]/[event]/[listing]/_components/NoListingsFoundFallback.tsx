'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import { EventDetail } from '@/interfaces/Event';
import { EventSaleTime } from '@/interfaces/Listing';
import { NewsletterForm } from '@/interfaces/Newsletter';
import { NotifyMeClickData, NotifyMeRegisteredData } from '@/interfaces/trackers/GoogleAnalystic';
import { cn } from '@/lib/cn';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { fallbackTranslation, formatSaleDateTime, getDateTimeWithTimezone } from '@/utils/common';
import { getOpenSaleDateTime } from '@/utils/event';
import { getNotifyMeTriggerState } from '@/utils/notifyMeAnalytics.util';
import { FrontSubtypeData } from '@/services/server/subtype';
import { useRegisterListingNotifyMutation } from '@/swr/features/newsletter';
import { GOOGLE_ANALYTICS_EVENT_KEYS } from '@/constants/trackers';

import { useSite } from '@/providers/SiteProvider';
import { useUser } from '@/providers/UserProvider';

import Link from '@/components/Link';
import MainContainer from '@/components/MainContainer';
import NotifyEmailInput from '@/components/NotifyEmailInput';
import SubTitle from '@/components/SubTitle';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';

import Suggestion from './Suggestion';

interface Props {
    eventId: number;
    eventDetail: EventDetail;
    subtype: string;
    availableForSale?: boolean;
    openSaleDateTime?: EventSaleTime;
    subTypeData?: FrontSubtypeData;
}
const NoListingsFoundFallback = ({
    eventId,
    eventDetail,
    availableForSale,
    openSaleDateTime,
    subTypeData: frontSubTypeData,
}: Props) => {
    const t = useTranslations();
    const locale = useLocale();
    const { type, subtype, event } = useParams<{ type: string; subtype: string; event: string }>();

    const [isSubscribed, setIsSubscribed] = useState(eventDetail.isSubscribed || false);
    const { config, domain } = useSite().domainInfo || {};
    const user = useUser();
    const useBrandStyling = config?.features?.useBrandStyling || false;
    const useThemeBackground = config?.features?.useThemeBackground || false;

    const methods = useForm<NewsletterForm>();
    const { control, reset, handleSubmit } = methods;

    const { trigger: registerListingNotify, isMutating: isLoading } =
        useRegisterListingNotifyMutation({
            onSuccess: () => {
                trackNotifyMeRegistered();
                setIsSubscribed(true);
                reset();
                toast.add({ title: t('thank_you_for_subscribing'), type: 'success' });
            },
            onError: (e) => {
                if (e.response.status === 409) {
                    setIsSubscribed(true);
                }
                toast.add({ title: t(e.data.errorKey), type: 'error' });
            },
        });

    const triggerState = getNotifyMeTriggerState({ isSaleInFuture: !availableForSale });

    const trackNotifyMeClick = useCallback(() => {
        GoogleAnalyticsTracker.triggerGA4Event<NotifyMeClickData>({
            event: GOOGLE_ANALYTICS_EVENT_KEYS.NOTIFY_ME_CLICK,
            key: GOOGLE_ANALYTICS_EVENT_KEYS.NOTIFY_ME_CLICK,
            data: {
                performer_id: '',
                event_id: String(eventId),
                trigger_state: triggerState,
                domain: domain ?? '',
                user_logged_in: !!user?.id,
            },
        });
    }, [domain, eventId, triggerState, user?.id]);

    const trackNotifyMeRegistered = useCallback(() => {
        GoogleAnalyticsTracker.triggerGA4Event<NotifyMeRegisteredData>({
            event: GOOGLE_ANALYTICS_EVENT_KEYS.NOTIFY_ME_REGISTERED,
            key: GOOGLE_ANALYTICS_EVENT_KEYS.NOTIFY_ME_REGISTERED,
            data: {
                performer_id: '',
                event_id: String(eventId),
                trigger_state: triggerState,
                domain: domain ?? '',
            },
        });
    }, [domain, eventId, triggerState]);

    const handleNotifySubmit: SubmitHandler<NewsletterForm> = useCallback(
        async (data) => {
            trackNotifyMeClick();

            registerListingNotify({ email: data.email, eventId });
        },
        [eventId, registerListingNotify, reset, t, trackNotifyMeClick, trackNotifyMeRegistered]
    );

    useEffect(() => {
        setIsSubscribed(eventDetail.isSubscribed || false);
    }, [eventDetail.isSubscribed]);

    const openSaleDateTimeObj = getOpenSaleDateTime({
        openSaleTimestamp: openSaleDateTime?.open_sale_timestamp,
        openSaleDate: openSaleDateTime?.open_sale_date,
        openSaleTime: openSaleDateTime?.open_sale_time,
        openSaleTimezone: eventDetail?.ianaZone,
    });

    const defaultSubTitle = !availableForSale
        ? t('event_is_not_available', {
              date: formatSaleDateTime(openSaleDateTimeObj, locale),
          })
        : t('get_notified_tickets_message');

    const formattedEventDateTime = formatSaleDateTime(
        getDateTimeWithTimezone(eventDetail.date, eventDetail.time, eventDetail.ianaZone),
        locale
    );

    return (
        <div className={cn('px-5 py-1 lg:py-5', useThemeBackground && 'bg-gray-100')}>
            <div className="flex flex-col justify-center items-center">
                <div className="px-4 py-16 xl:py-20 w-full max-w-125 xl:max-w-208">
                    <div className="mb-4 text-center">
                        <div className="flex justify-center items-center mx-auto mb-6">
                            <div className="flex justify-center items-center p-4 border rounded-full text-gray-500">
                                <Image
                                    alt="icon"
                                    src={
                                        isSubscribed ? '/icons/bell_checked.svg' : '/icons/bell.svg'
                                    }
                                    width={24}
                                    height={24}
                                    className="mx-auto"
                                />
                            </div>
                        </div>
                        <SubTitle
                            title={isSubscribed ? t('on_the_list') : defaultSubTitle}
                            level="h4"
                            className={cn(
                                'mb-2 font-semibold',
                                useBrandStyling && 'text-[#1565C0]'
                            )}
                        />
                        {!isSubscribed ? (
                            <div className="text-[#616161] text-base">
                                {!availableForSale && (
                                    <p>{t('event_is_not_available_description')}</p>
                                )}
                                {availableForSale && (
                                    <div>
                                        <p>
                                            {t.rich('no_tickets_for_event_date_available', {
                                                eventName: eventDetail.name,
                                                formattedDate: formattedEventDateTime,
                                                highlight: (chunks) => (
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
                                        <p>
                                            {fallbackTranslation(
                                                t('add_email_notification_message'),
                                                'add_email_notification_message',
                                                'Add your email and we’ll notify you as soon as they become available.'
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-[#616161] text-base">
                                {t.rich('ticket_announcement_message', {
                                    eventName: eventDetail.name,
                                    highlight: (chunks) => (
                                        <span
                                            className={cn(
                                                'font-semibold text-primary',
                                                useBrandStyling && 'text-[#1565C0]'
                                            )}
                                        >
                                            {chunks}
                                        </span>
                                    ),
                                })}
                            </p>
                        )}
                    </div>
                    {!isSubscribed && (
                        <FormProvider {...methods}>
                            <div>
                                {isSubscribed ? (
                                    <div className="mb-4">
                                        <Button
                                            className="w-full text-base capitalize font-semibold"
                                            disabled
                                        >
                                            {eventDetail.isSubscribed
                                                ? t('subscribed', {
                                                      defaultValue: 'Subscribed',
                                                  })
                                                : t('subscribe')}
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit(handleNotifySubmit)} noValidate>
                                        <div className="flex flex-col justify-center items-center gap-4 mx-auto rounded-lg w-full max-w-106">
                                            <NotifyEmailInput
                                                control={control}
                                                inputWrapperClassName={cn(
                                                    useBrandStyling &&
                                                        'has-[input:focus]:border-[#1E6BB8]'
                                                )}
                                            />
                                            <Button
                                                type="submit"
                                                disabled={isLoading}
                                                className={cn(
                                                    'bg-solid px-4 py-2 min-h-11 w-full',
                                                    useBrandStyling && 'bg-[#1565C0]'
                                                )}
                                            >
                                                {isLoading ? (
                                                    <Spinner className="text-white" />
                                                ) : (
                                                    <span
                                                        className={cn(
                                                            'font-bold text-white text-lg'
                                                        )}
                                                    >
                                                        {fallbackTranslation(
                                                            t('notify_me'),
                                                            'notify_me',
                                                            'Notify me'
                                                        )}
                                                    </span>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </FormProvider>
                    )}
                    <div className="mt-4 text-center">
                        <Link
                            prefetch={false}
                            href={`/${type}/${subtype}/${event}`}
                            className={cn(
                                'font-bold text-lg hover:underline normal-case!',
                                useBrandStyling && 'text-[#1565C0]'
                            )}
                        >
                            {fallbackTranslation(
                                t('check_other_dates'),
                                'check_other_dates',
                                'Find other dates for this event'
                            )}
                        </Link>
                    </div>
                </div>
            </div>
            <MainContainer>
                <Suggestion subTypeData={frontSubTypeData} />
            </MainContainer>
        </div>
    );
};

export default NoListingsFoundFallback;
