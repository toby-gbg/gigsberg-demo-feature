import { Fragment, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { fallbackTranslation, getTranslation } from '@/utils/common';
import { TicketTypeEnum } from '@/utils/ticketType.util';
import { CAT_KEY_PREFIX } from '@/constants/translation';

import { useSite } from '@/providers/SiteProvider';

import { useCheckoutData } from '../../_providers/CheckoutDataProvider';
import { useCheckoutPayment } from '../../_providers/CheckoutPaymentProvider';

const DetailRow = ({ label, value }: { label: string; value: ReactNode }) => (
    <Fragment>
        <p className="text-foreground-600 capitalize">{label}</p>
        <p className="capitalize font-medium text-foreground-800 ltr:text-right rtl:text-left">
            {value}
        </p>
    </Fragment>
);

export default function CheckoutTicketDetails() {
    const t = useTranslations();
    const { data } = useCheckoutData();
    const { paymentProvider } = useCheckoutPayment();
    const domainInfo = useSite().domainInfo;

    const { category, block, row, ticketType, listing } = data;

    const detailItems = [
        {
            show: domainInfo?.isStage,
            label: 'Payment System',
            value: paymentProvider,
        },
        {
            show: true,
            label: t('type'),
            value: t(ticketType?.toLowerCase()),
        },
        {
            show: true,
            label: t('category'),
            value: getTranslation(t, category, CAT_KEY_PREFIX),
        },
        {
            show: !!block,
            label: t('block'),
            value: block,
        },
        {
            show: !!row,
            label: t('row'),
            value: row,
        },
        {
            show: !!listing.seat_info,
            label: t('seat_number'),
            value: listing.seat_info,
        },
    ];
    const isMobileTicket = ticketType?.toUpperCase() === TicketTypeEnum.MOBILE_TICKET;

    return (
        <>
            <div className="grid grid-cols-2 gap-2 text-sm md:text-base">
                {detailItems
                    .filter((item) => item.show)
                    .map((item, index) => (
                        <DetailRow key={index} {...item} />
                    ))}
            </div>

            {isMobileTicket && (
                <div>
                    <div className="bg-dash-line my-3 h-px w-full" />
                    <div className="col-span-2">
                        <p className="text-foreground-400 mb-1 text-[10px] tracking-wider uppercase">
                            {t('delivery')}
                        </p>
                        <p className="text-foreground-800 mb-1 text-sm font-semibold">
                            {t('mobile_ticket')}
                        </p>
                        <p className="text-foreground-500 text-sm leading-snug">
                            {listing?.mobile_ticket_app_name
                                ? fallbackTranslation(
                                      t('delivery_mobile_app_known', {
                                          app: listing?.mobile_ticket_app_name,
                                      }),
                                      'delivery_mobile_app_known',
                                      `${listing?.mobile_ticket_app_name} is required to access your ticket, we'll send the details`
                                  )
                                : fallbackTranslation(
                                      t('delivery_mobile_app_unknown'),
                                      'delivery_mobile_app_unknown',
                                      "Mobile app required — we'll send the details."
                                  )}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
