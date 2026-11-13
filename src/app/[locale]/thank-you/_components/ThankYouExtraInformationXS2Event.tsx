'use client';

import { useState } from 'react';
import { useEffectOnce } from 'react-use';

import { EventGuestDataResponse } from '@/interfaces/AttendeeDetails';
import Order from '@/interfaces/Order';

import useIntlRouter from '@/hooks/useIntlRouter';

import ExtraInformationXS2EventModal from '@/components/modals/ExtraInformationXS2EventModal';

interface Props {
    order: Order;
    additionalInformation: EventGuestDataResponse | null;
}

export default function ThankYouExtraInformationXS2Event({ order, additionalInformation }: Props) {
    const [isOpenExtraInformationXS2EventModal, setIsOpenExtraInformationXS2EventModal] =
        useState(false);
    const router = useIntlRouter();

    useEffectOnce(() => {
        if (
            additionalInformation?.attendersData &&
            additionalInformation.attendersData.length > 0
        ) {
            setIsOpenExtraInformationXS2EventModal(true);
        }
    });

    return (
        <ExtraInformationXS2EventModal
            isOpen={isOpenExtraInformationXS2EventModal}
            onOpenModal={setIsOpenExtraInformationXS2EventModal}
            additionalInformation={additionalInformation}
            eventId={order.eventId}
            orderId={order.id}
            ticketQuantity={order.quantity}
            callback={() => {
                router.refresh();
            }}
        />
    );
}
