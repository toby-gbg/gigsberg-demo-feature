'use client';

import { FC } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { C } from '@/interfaces/Currency';
import { EventDetail } from '@/interfaces/Event';
import { SellForm } from '@/interfaces/Sell';
import { isFifaTour } from '@/utils/url';

import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

import SellTicketLastDetails from './SellTicketLastDetails';
import SellTicketMainDetails from './SellTicketMainDetails';
import SellTicketPriceDetails from './SellTicketPriceDetails';
import SellTicketSeatingDetails from './SellTicketSeatingDetails';

interface SellTicketFormProps {
    onNextStep?: () => void;
    event: EventDetail;
    currencies: C;
}

const SellTicketForm: FC<SellTicketFormProps> = ({ onNextStep, event, currencies }) => {
    const t = useTranslations();
    const { trigger, watch } = useFormContext<SellForm>();

    const block = watch('block');
    const seatFrom = watch('seat_from');
    const seatTo = watch('seat_to');
    const row = watch('row');

    const _onNextStep = async () => {
        const isValid = await trigger([
            'quantity',
            'presented_quantity',
            'ticket_type',
            'mobile_ticket_app_id',
            'split_type',
            'seat_from',
            'seat_to',
            'category',
            // 'block',
            'row',
            'face_value',
            'face_value_currency',
            'ticket_price',
            'ticket_price_currency',
            'additional_relevant_information',
            'is_seller_connected_to_event',
            'bought_tickets',
            'is_seller_confirmed_ticket_price',
        ]);
        if (isValid) {
            // WLB-1323 7d: Check if no seating details for UK events (no block, row, seatFrom, seatTo)
            if (!block && !row && (!seatFrom || !seatTo) && event?.countryCode === 'GB') {
                toast.add({
                    title: t('warning-no-seating-details-for-uk-events'),
                    type: 'warning',
                });
            }

            const tourUrl = event?.tour?.nameUrl || event.tourNameUrl || '';

            // WLB-1557: prevent saving seat number with TBD row
            if (isFifaTour(tourUrl)) {
                if (row?.toUpperCase() === 'TBD' && (seatFrom || seatTo)) {
                    return toast.add({ title: t('fifa_sell_ticket_rule_error'), type: 'error' });
                }
            }
            onNextStep?.();
        }
    };

    return (
        <div className="gap-4 grid grid-cols-12">
            <SellTicketMainDetails event={event} />
            <SellTicketSeatingDetails seatingPlanCategories={event.seatingPlanCategories ?? []} />
            <SellTicketPriceDetails currencies={currencies ?? {}} />
            <SellTicketLastDetails />
            <Button className="col-span-12 ms-auto h-12" onClick={_onNextStep}>
                {t('continue')}
            </Button>
        </div>
    );
};

export default SellTicketForm;
