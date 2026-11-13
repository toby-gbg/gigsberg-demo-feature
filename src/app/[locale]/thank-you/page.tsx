import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { all } from 'better-all';

import Order from '@/interfaces/Order';
import { isPaymentProvider } from '@/utils/typeGuards';
import { getCurrencyFromCookies } from '@/services/server/currencies';
import { eventApi } from '@/services/server/events';
import { ipApi } from '@/services/server/ip';
import { orderApi } from '@/services/server/orders';
import { XS2EVENT_ID } from '@/constants/affiliates';
import { SubmitXS2Condition } from '@/constants/attendee';

import ThankYouDataLayer from '@/components/ThankYouDataLayer';

import ThankYouExtraInformation from './_components/ThankYouExtraInformation';
import ThankYouExtraInformationXS2Event from './_components/ThankYouExtraInformationXS2Event';
import ThankYouHelp from './_components/ThankYouHelp';
import ThankYouListingDetails from './_components/ThankYouListingDetails';
import ThankYouMap from './_components/ThankYouMap';
import ThankYouOrderDetails from './_components/ThankYouOrderDetails';
import ThankYouTitle from './_components/ThankYouTitle';
import { thankYouSearchParamsCache } from './_searchParams';

const ThankyouExtraInformationFetcher = async ({ order }: { order: Order }) => {
    if (order.affiliateId === XS2EVENT_ID) {
        const additionalInformation = await eventApi.getEventGuestData({
            eventId: order.eventId,
            condition: SubmitXS2Condition.PRE_DOWNLOAD,
            affiliateId: XS2EVENT_ID,
        });
        return (
            <ThankYouExtraInformationXS2Event
                order={order}
                additionalInformation={additionalInformation}
            />
        );
    }
    const additionalInformation = await orderApi.getAdditionalInformation(order.id);
    return <ThankYouExtraInformation order={order} additionalInformation={additionalInformation} />;
};

const ThankYouPage = async ({ searchParams, params }: PageProps<'/[locale]/thank-you'>) => {
    const {
        search: { payment_intent },
        params: { locale },
        order,
        currencyCode,
    } = await all({
        async search() {
            return thankYouSearchParamsCache.parse(searchParams);
        },
        async params() {
            return params;
        },
        async paymentProvider() {
            const cookieStore = await cookies();
            return cookieStore.get('payment_provider')?.value;
        },
        async order() {
            const { payment_intent } = await this.$.search;
            if (!payment_intent) return null;

            const paymentProvider = await this.$.paymentProvider;
            const isValidProvider = isPaymentProvider(paymentProvider);

            return orderApi.getOrderDetails(
                payment_intent as string,
                isValidProvider ? paymentProvider : undefined
            );
        },
        async currencyCode() {
            return getCurrencyFromCookies();
        },
    });

    if (!payment_intent || !order) notFound();

    const ipCountry = await ipApi.getCountryIp();

    return (
        <>
            <ThankYouDataLayer key={order.id} order={order} paymentIntent={payment_intent} />

            <ThankyouExtraInformationFetcher order={order} />

            <div className="bg-white">
                <div className="gap-20 lg:grid grid-cols-12 mx-auto px-4 py-10 md:py-16 max-w-6xl">
                    <div className="space-y-8 col-span-12 lg:col-span-7">
                        <ThankYouTitle order={order} />
                        <ThankYouMap
                            currentCountry={ipCountry}
                            currencyCode={currencyCode ?? 'USD'}
                        />
                        <div className="hidden lg:block my-8 border-border border-t" />
                        <div className="hidden lg:block">
                            <ThankYouHelp eventId={order.eventId} />
                        </div>
                    </div>

                    <div className="lg:hidden my-8 border-border border-t" />

                    <div className="space-y-4 col-span-12 lg:col-span-5">
                        <ThankYouOrderDetails order={order} locale={locale} />
                        <ThankYouListingDetails order={order} locale={locale} />
                    </div>

                    <div className="lg:hidden col-span-12 pt-4">
                        <ThankYouHelp eventId={order.eventId} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ThankYouPage;
