import { useMemo } from 'react';
import { Check, Clock2, PartyPopper } from 'lucide-react';
import { DateTime } from 'luxon';
import { useTranslations } from 'next-intl';

import Order from '@/interfaces/Order';
import { getInternationalNumber } from '@/lib/phone';
import { formatPrice } from '@/utils/currency.util';

import { CopyToClipboard } from '@/components/CopyToClipboard';
import WaveFooter from '@/components/WaveFooter';

interface Props {
    locale: string;
    order: Order;
}

const DEFAULT_STEPS = [
    { id: '1', label: 'order_submitted', status: 'completed', icon: Check },
    { id: '2', label: 'order_under_review', status: 'inprogress', icon: Clock2 },
    { id: '3', label: 'get_your_ticket_and_enjoy', status: 'pending', icon: PartyPopper },
];

export default function ThankYouOrderDetails({ order, locale }: Props) {
    const t = useTranslations();

    const {
        id,
        totalPrice,
        orderCurrencyCode,
        orderUserEmail,
        orderUserPhone,
        orderUserFullname,
        eventDate,
        eventTime,
        orderUserPhonePrefix,
    } = order;

    // Memoized logic for event status
    const steps = useMemo(() => {
        const eventDateTime = DateTime.fromFormat(
            `${eventDate} ${eventTime}`,
            'yyyy-MM-dd HH:mm:ss'
        );
        const isEventPassed = DateTime.now() > eventDateTime;

        return DEFAULT_STEPS.map((step) =>
            isEventPassed
                ? {
                      ...step,
                      status: 'completed',
                      icon: Check,
                  }
                : step
        );
    }, [eventDate, eventTime]);

    // Data configuration for the details grid
    const detailItems = [
        {
            label: t('order_number'),
            value: (
                <div className="flex items-center justify-end gap-1">
                    <span className="font-medium text-gray-800">#{id}</span>
                    <CopyToClipboard text={id?.toString()} />
                </div>
            ),
        },
        { label: t('total_price'), value: formatPrice(totalPrice, locale, orderCurrencyCode) },
        { label: t('name'), value: orderUserFullname, className: 'break-words min-w-0' },
        { label: t('email_address'), value: orderUserEmail, className: 'break-words min-w-0' },
        {
            label: t('phone_number'),
            value: getInternationalNumber(orderUserPhone, orderUserPhonePrefix),
        },
    ];

    return (
        <div className="rounded-2xl shadow-xs border overflow-hidden bg-white border-border">
            <div className="p-4">
                <p className="text-xl font-semibold capitalize">{t('order_details')}</p>
                <div className="grid grid-cols-[150px_1fr] gap-2 mt-4 text-sm md:text-base">
                    {detailItems.map((item, idx) => (
                        <div key={idx} className="contents">
                            <p className="text-gray-600 capitalize">{item.label}</p>
                            <div
                                className={`font-medium text-gray-800 ltr:text-right rtl:text-left ${item.className || ''}`}
                            >
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <WaveFooter>
                <div className="bg-[#FAFAFA] px-4 py-5 space-y-3">
                    <p className="font-semibold">{t('what_happen_next')}</p>

                    <div>
                        {steps.map((step, index) => (
                            <div
                                data-status={step.status}
                                key={step.id}
                                className="flex gap-2 group"
                            >
                                <div className="relative flex flex-col items-center">
                                    {/* Icon */}
                                    <div className="bg-white rounded-full border-green-500 border-2 p-1 group-data-[status=completed]:bg-green-500">
                                        <step.icon
                                            size={15}
                                            className="stroke-green-500 group-data-[status=completed]:stroke-white"
                                        />
                                    </div>

                                    {index < steps.length - 1 && (
                                        <div className="w-0.5 h-3 bg-green-600"></div>
                                    )}
                                </div>

                                {/* Label */}
                                <p className="text-foreground-600 text-sm pt-0.5 group-data-[status=inprogress]:font-semibold group-data-[status=inprogress]:text-black capitalize">
                                    {t(step.label)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </WaveFooter>
        </div>
    );
}
