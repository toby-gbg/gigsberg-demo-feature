'use client';

import { useState } from 'react';
import { useEffectOnce } from 'react-use';

import { AdditionalInformationResponse } from '@/interfaces/AdditionalInformation';
import Order from '@/interfaces/Order';

import ExtraInformationModal from '@/components/modals/ExtraInformationModal';

interface Props {
    order: Order;
    additionalInformation: AdditionalInformationResponse | null;
}

export default function ThankYouExtraInformation({ order, additionalInformation }: Props) {
    const [isOpenExtraInformationModal, setIsOpenExtraInformationModal] = useState(false);

    useEffectOnce(() => {
        // Only show modal if there are additional information fields required
        if (
            additionalInformation?.extraInfoSchema?.fields &&
            !additionalInformation.extraInformationAdded &&
            additionalInformation.extraInfoSchema.fields.length > 0
        ) {
            setIsOpenExtraInformationModal(true);
        }
    });

    return (
        <ExtraInformationModal
            isOpen={isOpenExtraInformationModal}
            onOpenModal={setIsOpenExtraInformationModal}
            additionalInformation={additionalInformation}
            orderId={order.id}
        />
    );
}
