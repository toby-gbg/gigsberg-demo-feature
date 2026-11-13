import { cache } from 'react';

import { AdditionalInformationResponse } from '@/interfaces/AdditionalInformation';
import { PaymentProviderEnum } from '@/interfaces/Checkout';
import Order from '@/interfaces/Order';

import { apiService } from './base';
import { apiEndpoints } from './config';
import { getUserToken } from './users';

export const orderApi = {
    getOrderDetails: cache(
        async (
            paymentIntent: string,
            paymentProvider?: PaymentProviderEnum
        ): Promise<Order | null> => {
            const token = await getUserToken();

            if (!token) return null;

            return apiService.get(apiEndpoints.order(paymentIntent, paymentProvider), {
                headers: { Authorization: `Bearer ${token}` },
                retry: { enabled: true },
            });
        }
    ),

    async getAdditionalInformation(orderId: number): Promise<AdditionalInformationResponse | null> {
        const token = await getUserToken();

        if (!token) return null;

        try {
            return await apiService.get(apiEndpoints.additionalInformation(orderId), {
                headers: { Authorization: `Bearer ${token}` },
                retry: { enabled: true },
            });
        } catch {
            return null;
        }
    },
};
