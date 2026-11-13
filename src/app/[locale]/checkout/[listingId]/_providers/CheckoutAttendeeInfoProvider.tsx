'use client';

import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';
import { useTranslations } from 'next-intl';

import { AttendeeFormValue, EventGuestDataResponse } from '@/interfaces/AttendeeDetails';
import { isValidationError, isValidationErrorStatus } from '@/utils/api';
import { fallbackTranslation } from '@/utils/common';
import { useSubmitAttendeeDetailsByLeadIdMutation } from '@/swr/features/lead';
import { XS2EVENT_ID } from '@/constants/affiliates';

import { toast } from '@/components/ui/Toast';

import { useCheckoutData } from './CheckoutDataProvider';

interface CheckoutAttendeeInfoContextValue {
    attendeeSchema: EventGuestDataResponse | null;
    hasAttendeeStep: boolean;
    submitAttendeeInfo: (leadId: number, guests: Record<string, AttendeeFormValue>[]) => void;
    attendeeFormData: Record<string, string>[] | null;
    setAttendeeFormData: Dispatch<SetStateAction<Record<string, string>[] | null>>;
    fieldErrors: Record<string, string>;
    setFieldErrors: Dispatch<SetStateAction<Record<string, string>>>;
    isSubmitting: boolean;
    setIsSubmitting: Dispatch<SetStateAction<boolean>>;
}

const CheckoutAttendeeInfoContext = createContext<CheckoutAttendeeInfoContextValue | null>(null);

export function CheckoutAttendeeInfoProvider({
    children,
    attendeeSchema,
}: {
    children: ReactNode;
    attendeeSchema: EventGuestDataResponse | null;
}) {
    const t = useTranslations();

    // External providers
    const { data } = useCheckoutData();

    const isXS2Event = data.affiliateId === XS2EVENT_ID;
    const hasAttendeeStep =
        isXS2Event && attendeeSchema ? attendeeSchema.attendersData.length > 0 : false;

    // State
    const [attendeeFormData, setAttendeeFormData] = useState<Record<string, string>[] | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // API
    const { trigger: submitAttendeeDetailsMutation } = useSubmitAttendeeDetailsByLeadIdMutation({
        onError: async (error) => {
            const validation = error?.data?.validation || [];

            if (
                isValidationErrorStatus(error?.data?.errorKey, error?.response?.status) &&
                validation.length > 0
            ) {
                const mapped: Record<string, string> = {};
                for (const fieldErr of validation.filter((item) => isValidationError(item))) {
                    const translatedMessage = fallbackTranslation(
                        t(fieldErr.message),
                        fieldErr.message,
                        'Invalid format, please input again.'
                    );
                    // Format instancePath = "fieldName_guestIdx"
                    mapped[fieldErr.instancePath] = translatedMessage;
                }
                setFieldErrors(mapped);
            }

            setIsSubmitting(false);

            toast.add({ title: t(error.data.errorKey), type: 'error' });
        },
    });

    const submitAttendeeInfo = async (
        leadId: number,
        guests: Record<string, AttendeeFormValue>[]
    ) => {
        await submitAttendeeDetailsMutation({
            leadId,
            body: { guests },
        });
    };

    return (
        <CheckoutAttendeeInfoContext.Provider
            value={{
                attendeeSchema,
                submitAttendeeInfo,
                hasAttendeeStep,
                attendeeFormData,
                setAttendeeFormData,
                fieldErrors,
                setFieldErrors,
                isSubmitting,
                setIsSubmitting,
            }}
        >
            {children}
        </CheckoutAttendeeInfoContext.Provider>
    );
}

export function useCheckoutAttendeeInfo() {
    const ctx = useContext(CheckoutAttendeeInfoContext);
    if (!ctx) {
        throw new Error('useCheckoutAttendeeInfo must be used within CheckoutAttendeeInfoProvider');
    }
    return ctx;
}
