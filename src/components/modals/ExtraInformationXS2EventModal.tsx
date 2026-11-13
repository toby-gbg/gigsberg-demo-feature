'use client';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { EventGuestDataResponse } from '@/interfaces/AttendeeDetails';

import { Dialog, DialogBody, DialogContent } from '@/components/ui/Dialog';

import ExtraInformationForXS2Form from '../ExtraInformationForXS2Form';

export interface AdditionalInformationModalMethods {
    toggleModal: (ticketCount?: number) => void;
}

interface AdditionalInformationModalProps {
    additionalInformation: EventGuestDataResponse | null;
    eventId: number;
    orderId: number;
    ticketQuantity?: number;
    callback?: () => void;
    isOpen: boolean;
    onOpenModal: Dispatch<SetStateAction<boolean>>;
}

export default function ExtraInformationXS2EventModal({
    additionalInformation,
    eventId,
    orderId,
    ticketQuantity,
    callback,
    isOpen,
    onOpenModal,
}: AdditionalInformationModalProps) {
    const [ticketCount, setTicketCount] = useState<number>(1);

    useEffect(() => {
        if (isOpen && ticketQuantity && ticketQuantity > 0) {
            setTicketCount(ticketQuantity);
        }
    }, [isOpen, ticketQuantity]);

    if (!additionalInformation?.attendersData || additionalInformation.attendersData.length === 0) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenModal} disablePointerDismissal>
            <DialogContent
                classNames={{ popup: 'max-w-lg max-h-[80vh] overflow-auto' }}
                showCloseButton={false}
            >
                <DialogBody>
                    <ExtraInformationForXS2Form
                        additionalInformation={additionalInformation}
                        eventId={eventId}
                        orderId={orderId}
                        ticketQuantity={ticketCount}
                        onSuccess={() => {
                            callback?.();
                            onOpenModal(false);
                        }}
                    />
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}
