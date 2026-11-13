'use client';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { AdditionalInformationResponse } from '@/interfaces/AdditionalInformation';

import { Dialog, DialogBody, DialogContent } from '@/components/ui/Dialog';

import ExtraInformationForm, { ExtraInformationState } from '../ExtraInformationForm';

export interface AdditionalInformationModalMethods {
    toggleModal: (ticketCount?: number) => void;
}

interface AdditionalInformationModalProps {
    additionalInformation: AdditionalInformationResponse | null;
    orderId: number;
    callback?: (data: ExtraInformationState) => void;
    isOpen: boolean;
    onOpenModal: Dispatch<SetStateAction<boolean>>;
}

export default function ExtraInformationModal({
    additionalInformation,
    orderId,
    callback,
    isOpen,
    onOpenModal,
}: AdditionalInformationModalProps) {
    const [ticketCount, setTicketCount] = useState<number>(1);

    const onOpenChange: React.ComponentProps<typeof Dialog>['onOpenChange'] = (
        open,
        eventDetails
    ) => {
        if (!open && eventDetails.reason === 'escape-key') {
            eventDetails.cancel();
            return;
        }

        onOpenModal(open);
    };

    useEffect(() => {
        if (isOpen && additionalInformation && additionalInformation.ticketQuantity) {
            if (additionalInformation.ticketQuantity && additionalInformation.ticketQuantity > 0)
                setTicketCount(additionalInformation.ticketQuantity);
        }
    }, [isOpen]);

    if (
        !additionalInformation?.extraInfoSchema?.fields ||
        additionalInformation.extraInfoSchema.fields.length === 0
    ) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange} disablePointerDismissal>
            <DialogContent
                classNames={{ popup: 'max-w-lg px-0', portal: 'z-99999' }}
                showCloseButton={false}
            >
                <DialogBody className="pt-0 pr-3 pl-3 md:pl-4 max-h-[80vh] overflow-x-hidden overflow-y-auto">
                    <ExtraInformationForm
                        additionalInformation={additionalInformation}
                        orderId={orderId}
                        ticketCount={ticketCount}
                        onSuccess={(data) => {
                            callback?.(data);
                            onOpenModal(false);
                        }}
                    />
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}
