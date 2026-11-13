import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { CheckoutPaymentProvider, PaymentProviderEnum } from '@/interfaces/Checkout';
import { checkoutApi } from '@/services/server/checkout';
import { ipApi } from '@/services/server/ip';
import { userApi } from '@/services/server/users';
import {
    paymentProviders as defaultPaymentProviders,
    isSpreedlyEnabled,
} from '@/constants/paymentProvider';

import Headers from './headers';

export default class CheckoutUtil {
    static async getPaymentProviderForUser(
        currencyCode: string,
        eventCountryCode?: string
    ): Promise<CheckoutPaymentProvider> {
        const currentUser = await userApi.getCurrentUser();

        const userSession = currentUser
            ? {
                  payload: {
                      id: String(currentUser.id),
                      email: currentUser.email,
                  },
              }
            : undefined;

        return this.getPaymentProvider(currencyCode, eventCountryCode, userSession);
    }

    static async getPaymentProvider(
        currencyCode: string,
        eventCountryCode?: string,
        session?: { payload?: { id: string; email: string } }
    ): Promise<CheckoutPaymentProvider> {
        const { config } = await Headers.getDomainInfo();
        let paymentProviders = [...defaultPaymentProviders];

        const countryIp = await ipApi.getCountryIp();
        const userCountryCode = countryIp?.code;

        // Check for test user email override first
        if (session?.payload?.email) {
            const userEmail = session.payload.email.toLowerCase();
            // Check if email is in format <paymentProvider><optional digits>-test@gigsberg.com
            const match = userEmail.match(/^([a-zA-Z]+)\d*-test@gigsberg\.com$/);
            if (match) {
                const emailPrefix = match[1];
                // Return the payment provider from test email directly
                return emailPrefix as CheckoutPaymentProvider;
            }
        }

        // When Spreedly is enabled, it's the only provider
        console.log('isSpreedlyEnabled', isSpreedlyEnabled);
        if (isSpreedlyEnabled) return 'spreedly';

        // Stripe only
        if (config.payment?.providerStrategy === 'STRIPE_ONLY') return 'stripe';

        // Fibonatix priority
        if (config.payment?.providerStrategy === 'FIBONATIX_PRIORITY') {
            if (eventCountryCode === 'IT' || userCountryCode === 'IT') {
                return 'stripe';
            }

            return 'fibonatix';
        }

        // Filter out Fibonatix for Italy
        if (userCountryCode === 'IT') {
            paymentProviders = paymentProviders.filter((p) => p !== 'fibonatix');
        }

        // Default behavior: currency-based logic with random selection
        // For unsupported currencies, always use Stripe
        if (!['EUR', 'USD', 'GBP'].includes(currencyCode.toUpperCase())) {
            return 'stripe';
        }

        // For supported currencies, randomly select from available providers
        const randomIndex = Math.floor(Math.random() * paymentProviders.length);
        return paymentProviders[randomIndex];
    }

    static async signUrl(pathName: string) {
        const hostName = await Headers.getHostname();

        const rawUrl = `https://${hostName}${pathName}`;
        const encodedUrl = encodeURI(rawUrl);

        const url = (await checkoutApi.signUrl(encodedUrl.toString(), ['error_message'])) || '/';
        return url;
    }

    static async validateUrl() {
        const url = await Headers.getCurrentUrl();
        const referer = await Headers.getReferer();

        const { valid, redirectUrl } = await checkoutApi.validateUrl(
            url,
            ['error_message', 'currency'],
            referer
        );

        // Redirect checkout page from affiliate (not valid but have redirectUrl)
        if (!valid) {
            if (redirectUrl) {
                return redirect(redirectUrl);
            }
            return false;
        }

        return true;
    }

    // Set payment provider to cookies when payment success for get order details later
    static async setSuccessPaymentProvider(provider: PaymentProviderEnum) {
        const cookieStore = await cookies();
        cookieStore.set('payment_provider', provider);
    }
}
