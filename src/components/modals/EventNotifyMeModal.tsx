'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
    $eventNotifiyMe,
    $eventNotifyMeModal,
} from '@/app/[locale]/[type]/[subtype]/[event]/_stores';
import { useStore } from '@nanostores/react';
import { useTranslations } from 'next-intl';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useUnmount } from 'react-use';

import { EventTicket } from '@/interfaces/Event';
import { NewsletterForm } from '@/interfaces/Newsletter';
import { NotifyMeRegisteredData } from '@/interfaces/trackers/GoogleAnalystic';
import { cn } from '@/lib/cn';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { fallbackTranslation } from '@/utils/common';
import { getNotifyMeTriggerStateFromOpenSale } from '@/utils/notifyMeAnalytics.util';
import { useRegisterListingNotifyMutation } from '@/swr/features/newsletter';
import { GOOGLE_ANALYTICS_EVENT_KEYS } from '@/constants/trackers';

import { useSite } from '@/providers/SiteProvider';

import NotifyEmailInput from '@/components/NotifyEmailInput';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogBody, DialogContent } from '@/components/ui/Dialog';
import { Spinner } from '@/components/ui/Spinner';

const DEFAULT_SECOND_VALUE = 5;

export default function EventNotifyMeModal() {
    const t = useTranslations();

    const [currentEvent, setCurrentEvent] = useState<EventTicket | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [secondVal, setSecondVal] = useState(DEFAULT_SECOND_VALUE);
    const secondValRef = useRef(secondVal);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { domain, config } = useSite().domainInfo || {};
    const useBrandStyling = config?.features?.useBrandStyling || false;

    const { control, reset, handleSubmit } = useForm<NewsletterForm>();

    const { trigger: registerListingNotify, isMutating: isLoading } =
        useRegisterListingNotifyMutation({
            onSuccess: () => handleSuccess(),
            onError: (err) => {
                console.error('Failed to send ticket notification', err);
                handleSetDefaultValues();
            },
        });

    const eventName = currentEvent?.eventName;
    const eventId = currentEvent?.eventId || currentEvent?.id;

    const handleClearTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const handleSetDefaultValues = () => {
        handleClearTimeout();
        setIsSuccess(false);
        setSecondVal(DEFAULT_SECOND_VALUE);
        secondValRef.current = DEFAULT_SECOND_VALUE;
    };

    const handleCloseModal = () => {
        $eventNotifyMeModal.set(false);
    };

    const handleTimeout = () => {
        handleClearTimeout();

        timeoutRef.current = setTimeout(() => {
            const nextSecondVal =
                secondValRef.current >= 0 ? secondValRef.current - 1 : secondValRef.current;

            secondValRef.current = nextSecondVal;
            if (nextSecondVal >= 0) {
                setSecondVal((prev) => prev - 1);
                handleTimeout();
            } else {
                handleCloseModal();
                secondValRef.current = DEFAULT_SECOND_VALUE;
                handleClearTimeout();
            }
        }, 1000);
    };

    const handleSuccess = () => {
        if (currentEvent && eventId) {
            GoogleAnalyticsTracker.triggerGA4Event<NotifyMeRegisteredData>({
                event: GOOGLE_ANALYTICS_EVENT_KEYS.NOTIFY_ME_REGISTERED,
                key: GOOGLE_ANALYTICS_EVENT_KEYS.NOTIFY_ME_REGISTERED,
                data: {
                    performer_id: currentEvent.performerId?.toString() ?? '',
                    event_id: String(eventId),
                    trigger_state: getNotifyMeTriggerStateFromOpenSale(
                        currentEvent.openSaleDate,
                        currentEvent.openSaleTime,
                        currentEvent.openSaleTimezone,
                        currentEvent.openSaleTimestamp
                    ),
                    domain: domain ?? '',
                },
            });
        }

        reset();
        setIsSuccess(true);
        handleTimeout();
    };

    const onSubmit: SubmitHandler<NewsletterForm> = async (data) => {
        if (!eventId) return;

        registerListingNotify({ email: data.email, eventId });
    };

    useUnmount(() => {
        handleClearTimeout();
        $eventNotifyMeModal.set(false);
        $eventNotifiyMe.set(null);
    });

    const highlightClassName = cn(
        'font-semibold text-primary',
        useBrandStyling && 'text-[#1565C0]'
    );

    const isOpenEventNotifyMeModal = useStore($eventNotifyMeModal);
    const eventNotifiyMe = useStore($eventNotifiyMe);

    useEffect(() => {
        if (eventNotifiyMe && isOpenEventNotifyMeModal) {
            reset();
            handleSetDefaultValues();
            setCurrentEvent(eventNotifiyMe);
        }
    }, [eventNotifiyMe, isOpenEventNotifyMeModal]);

    return (
        <Dialog
            open={isOpenEventNotifyMeModal}
            onOpenChange={(value) => {
                if (!value) handleClearTimeout();
                $eventNotifyMeModal.set(value);
            }}
        >
            <DialogContent classNames={{ popup: 'rounded-[12px] lg:max-w-177.5' }}>
                <DialogBody className="py-2">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col items-center gap-6">
                            <div className="flex flex-col items-center gap-6 w-full">
                                <div className="flex justify-center items-center p-4 border rounded-full text-gray-500">
                                    <Image
                                        alt="icon"
                                        src={
                                            isSuccess
                                                ? '/icons/bell_checked.svg'
                                                : '/icons/bell.svg'
                                        }
                                        width={24}
                                        height={24}
                                    />
                                </div>
                                <div className="text-center">
                                    <p
                                        className={cn(
                                            'font-semibold text-[28px] text-primary text-3xl',
                                            useBrandStyling && 'text-[#1565C0]'
                                        )}
                                    >
                                        {isSuccess
                                            ? fallbackTranslation(
                                                  t('on_the_list'),
                                                  'on_the_list',
                                                  "You're on the list!"
                                              )
                                            : fallbackTranslation(
                                                  t('get_notified_tickets_message'),
                                                  'get_notified_tickets_message',
                                                  'Get notified when tickets are available'
                                              )}
                                    </p>
                                    <div className="text-[#616161] text-base">
                                        {!isSuccess && (
                                            <>
                                                <p>
                                                    {t.rich('no_tickets_for_event_available', {
                                                        eventName: eventName || '',
                                                        highlight: (chunks) => (
                                                            <span className={highlightClassName}>
                                                                {chunks}
                                                            </span>
                                                        ),
                                                    })}
                                                </p>
                                                <p>
                                                    {fallbackTranslation(
                                                        t('add_email_notification_message'),
                                                        'add_email_notification_message',
                                                        "Add your email and we'll notify you as soon as they become available."
                                                    )}
                                                </p>
                                            </>
                                        )}
                                        {isSuccess && (
                                            <p>
                                                {t.rich('ticket_announcement_message', {
                                                    eventName: eventName || '',
                                                    highlight: (chunks) => (
                                                        <span className={highlightClassName}>
                                                            {chunks}
                                                        </span>
                                                    ),
                                                })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {!isSuccess && (
                                    <div className="rounded-lg w-full overflow-hidden flex flex-col md:flex-row gap-2 max-w-106">
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
                                                'h-auto min-h-10 w-full border border-on-main px-3 py-1.5 md:max-w-25',
                                                useBrandStyling && 'border-[#1565C0] bg-[#1565C0]'
                                            )}
                                        >
                                            {isLoading ? (
                                                <Spinner className="size-5 text-white" />
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
                                )}
                            </div>
                            {isSuccess && (
                                <Button
                                    type="button"
                                    className={cn(
                                        'h-auto min-h-[38px] min-w-66.25! border border-on-main px-4 py-1.75',
                                        useBrandStyling && 'border-[#1565C0] bg-[#1565C0]'
                                    )}
                                    onClick={handleCloseModal}
                                >
                                    <span className="font-bold text-white text-base">
                                        {fallbackTranslation(
                                            t('go_back_page_countdown_message', {
                                                secondValue: secondVal,
                                            }),
                                            'go_back_page_countdown_message',
                                            `Go back to artist page in...${secondVal}s`
                                        )}
                                    </span>
                                </Button>
                            )}
                        </div>
                    </form>
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}
