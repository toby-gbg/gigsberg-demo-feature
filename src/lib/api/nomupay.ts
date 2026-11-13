import 'server-only';

import { NomupayPaymentWebhook } from '@/interfaces/nomupay/NomupayWebhook';
import Headers from '@/lib/headers';

export default class Nomupay {
    static getPaymentBody = async (resourcePath: string): Promise<NomupayPaymentWebhook> => {
        const { config } = await Headers.getDomainInfo();

        // Determine token and entity ID based on website domain
        const token = config.payment?.nomupayToken ?? process.env.NOMUPAY_TOKEN;
        const entityId =
            config.payment?.nomupayEntityId ?? process.env.NEXT_PUBLIC_NOMUPAY_ENTITY_ID;

        if (!token || !entityId) throw new Error('Nomupay configuration is missing');

        const requestUrl = `${process.env.NEXT_PUBLIC_NOMUPAY_BASE_URL + resourcePath}?entityId=${entityId}`;

        console.log(
            '[Payments][NomuPay] Fetching:',
            requestUrl,
            'Authorization:',
            `Bearer ${token}`,
            'entityId:',
            entityId
        );

        const response = await fetch(requestUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.json();
    };
}
