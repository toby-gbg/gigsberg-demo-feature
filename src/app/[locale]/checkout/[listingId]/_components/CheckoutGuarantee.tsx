'use client';

import { Fragment, ReactNode } from 'react';
import { Handshake, LucideIcon, ShieldCheck, Ticket, TicketPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { $guaranteeModal } from '@/stores/modal';
import { TicketTypeEnum } from '@/utils/ticketType.util';

import Link from '@/components/Link';
import GuaranteeModal from '@/components/modals/GuaranteeModal';

import { useCheckoutData } from '../_providers/CheckoutDataProvider';

export default function CheckoutGuarantee() {
    const t = useTranslations();
    const { data, website } = useCheckoutData();
    const { name = '' } = website ?? {};
    const { ticketType } = data;

    const onOpen = () => $guaranteeModal.set(true);

    const onClose = () => $guaranteeModal.set(false);

    return (
        <Fragment>
            <GuaranteeModal onClose={onClose} />
            <div className="space-y-6">
                {/* Delivery Method */}
                {ticketType === TicketTypeEnum.E_TICKET && (
                    <Item
                        title={t('delivery_method')}
                        content={t('eticket_delivery_method', {
                            company: name,
                        })}
                        icon={TicketPlus}
                    />
                )}

                {/* Every Ticket Protected */}
                <Item
                    title={t.rich('every_ticket_protected', {
                        strong: (chunks) => <span className="font-black">{chunks}</span>,
                    })}
                    content={t('guarantee_ticket_on_time')}
                    icon={ShieldCheck}
                />

                <Item
                    title={t('ticket_guarantee', { company: name })}
                    content={
                        <p>
                            {t('get_your_money_back')}{' '}
                            <Link
                                href="#"
                                className="underline font-medium hover:no-underline text-black"
                                onClick={onOpen}
                            >
                                {t('learn_more')}
                            </Link>
                        </p>
                    }
                    icon={Ticket}
                />

                <Item
                    title={t('resell_anytime')}
                    content={
                        <p>
                            {t.rich('not_sure_make_to_event', {
                                name,
                                resell: (chunks) => (
                                    <Link
                                        href={`/sell-ticket/${data.listing.event_id}`}
                                        className="underline font-medium hover:no-underline text-black"
                                    >
                                        {chunks}
                                    </Link>
                                ),
                            })}
                        </p>
                    }
                    icon={Handshake}
                />
            </div>
        </Fragment>
    );
}

const Item = ({
    title,
    content,
    icon: Icon,
}: {
    title: ReactNode;
    content: ReactNode;
    icon: LucideIcon;
}) => {
    return (
        <div className="flex gap-4">
            <div className="shrink-0 mt-0.5">
                <Icon className="size-6 stroke-emerald-500" />
            </div>
            <div className="grow space-y-1">
                <h3 className="font-semibold capitalize">{title}</h3>
                <div className="text-gray-600 text-sm">{content}</div>
            </div>
        </div>
    );
};
