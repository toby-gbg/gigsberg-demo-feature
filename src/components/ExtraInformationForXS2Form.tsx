'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { EventGuestDataResponse } from '@/interfaces/AttendeeDetails';
import { isValidationError, isValidationErrorStatus } from '@/utils/api';
import { AppErrorKey } from '@/utils/api/api-error-codes';
import { fallbackTranslation } from '@/utils/common';
import { useSubmitAttendeeDetailsByOrderIdMutation } from '@/swr/features/orders';
import { ErrorResponse } from '@/swr/types';
import { AttendeeXS2Scope } from '@/constants/attendee';

import AttendeeFormFields from '@/components/AttendeeFormFields';
import { toast } from '@/components/ui/Toast';

interface Props {
    additionalInformation: EventGuestDataResponse;
    eventId: number;
    orderId: number;
    ticketQuantity?: number;
    onSuccess?: () => void;
}

export default function ExtraInformationForXS2Form({
    additionalInformation,
    orderId,
    ticketQuantity = 1,
    onSuccess,
}: Props) {
    const t = useTranslations();

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmitDetailsError = (error: ErrorResponse) => {
        const validation = error?.data?.validation || [];
        const errorKey = error?.data?.errorKey || AppErrorKey.VALIDATION_ERROR;
        const errorStatus = error?.response?.status || 422;
        const errorMessage = error.message || 'Missing affiliate booking id';

        if (isValidationErrorStatus(errorKey, errorStatus) && validation.length > 0) {
            const mapped: Record<string, string> = {};
            for (const fieldErr of validation.filter((item) => isValidationError(item))) {
                // Format instancePath = "fieldName_guestIdx"
                const translatedMessage = fallbackTranslation(
                    t(fieldErr.message),
                    fieldErr.message,
                    'Invalid format, please input again.'
                );

                mapped[fieldErr.instancePath] = translatedMessage;
            }
            setFieldErrors(mapped);
            return;
        }

        // THIS CASE TO HANDLE FRAUD ACCOUNT PAYMENT --> SUPPOSE TO BE SUCCESS
        if (errorStatus === 400 && errorMessage === 'Missing affiliate booking id') {
            setIsSubmitted(true);
            onSuccess?.();
            return;
        }

        toast.add({ title: t('generic_error'), type: 'error' });
    };

    const { trigger: submitAttendeeDetails, isMutating: isSubmitting } =
        useSubmitAttendeeDetailsByOrderIdMutation({
            onSuccess: () => {
                setIsSubmitted(true);
                onSuccess?.();
            },
            onError: (error) => handleSubmitDetailsError(error),
        });

    const activeGuestCount =
        additionalInformation?.scope === AttendeeXS2Scope.ALL_PERSONS ? ticketQuantity : 1;

    const onSubmit = (guests: Record<string, string>[]) => {
        setFieldErrors({});
        submitAttendeeDetails({ orderId, body: { guests } });
    };

    if (isSubmitted) return null;
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <h2 className="font-bold text-black text-2xl">
                    {fallbackTranslation(
                        t('additional_info_title'),
                        'additional_info_title',
                        'We Need A Few More Details'
                    )}
                </h2>
                <p className="text-gray-500 text-sm">
                    {fallbackTranslation(
                        t('additional_info_subtitle'),
                        'additional_info_subtitle',
                        'Please fill in the details below to continue'
                    )}
                </p>
            </div>
            <AttendeeFormFields
                schema={additionalInformation}
                activeGuestCount={activeGuestCount}
                isSubmitting={isSubmitting}
                fieldErrors={fieldErrors}
                onSubmit={onSubmit}
            />
        </div>
    );
}
