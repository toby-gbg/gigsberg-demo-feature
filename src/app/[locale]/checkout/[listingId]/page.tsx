import { notFound } from 'next/navigation';
import { all } from 'better-all';

import CheckoutUtil from '@/lib/checkout';
import { checkoutApi } from '@/services/server/checkout';
import { currencyApi, getCurrencyFromCookies } from '@/services/server/currencies';
import { eventApi } from '@/services/server/events';
import { ipApi } from '@/services/server/ip';
import { languageApi } from '@/services/server/languages';
import { listingApi } from '@/services/server/listing';
import { userApi } from '@/services/server/users';
import { websiteApi } from '@/services/server/website';
import { XS2EVENT_ID } from '@/constants/affiliates';
import { SubmitXS2Condition } from '@/constants/attendee';

import CheckoutAttendeeDetails from './_components/CheckoutAttendeeDetails';
import CheckoutContactForm from './_components/CheckoutContactForm';
import CheckoutEffects from './_components/CheckoutEffects';
import CheckoutEventSummary from './_components/CheckoutEventSummary';
import CheckoutGuarantee from './_components/CheckoutGuarantee';
import CheckoutHeader from './_components/CheckoutHeader';
import CheckoutInvalidQuantity from './_components/CheckoutInvalidQuantity';
import CheckoutPaymentDetail from './_components/CheckoutPaymentDetails';
import CheckoutPaymentMethod from './_components/CheckoutPaymentMethods';
import CheckoutTitle from './_components/CheckoutTitle';
import CheckoutProvider from './_providers/CheckoutProvider';
import StripeProvider from './_providers/StripeProvider';
import { checkoutSearchParamsCache } from './_searchParams';

export default async function CheckoutPage({
    params,
    searchParams,
}: PageProps<'/[locale]/checkout/[listingId]'>) {
    // Validate referer URL
    const isValid = await CheckoutUtil.validateUrl();
    if (!isValid) notFound();

    const {
        params: { listingId },
        s,
        currencyCode,
        languages,
    } = await all({
        async params() {
            return params;
        },
        async s() {
            return checkoutSearchParamsCache.parse(searchParams);
        },
        async currencyCode() {
            return getCurrencyFromCookies();
        },
        async website() {
            return websiteApi.getWebsite();
        },
        async languages() {
            const website = await this.$.website;
            return languageApi.getLanguagesOfWebsite(website);
        },
    });

    const { quantity, affiliate_id: affiliateId, event_id: eventId } = s || {};

    const listing = await checkoutApi.getCheckoutListing(
        listingId,
        quantity || '1',
        affiliateId || undefined,
        eventId || undefined
    );

    // If invalid quantity, show message with a link back to the event page
    if (listing?.error) {
        return (
            <CheckoutInvalidQuantity
                error={listing.error}
                eventUrl={listing.eventUrl}
                fallbackUrl={listing.fallbackUrl}
                type={listing.type}
            />
        );
    }

    if (!listing || !listing.data) return notFound();

    const queryParams = {
        eventId: listing?.data?.listing.event_id,
        affiliateId: listing?.data?.affiliateId,
    };

    const [
        metadata,
        paymentProvider,
        addresses,
        { external_3ddv_id, external_3ddv_blocks },
        attendeeSchema,
        ipCountry,
    ] = await Promise.all([
        listingApi.getListingMetadata(`show-${queryParams?.eventId}`),
        CheckoutUtil.getPaymentProviderForUser(
            listing.data.listingCurrencyCode,
            listing.data.eventCountryCode
        ),
        userApi.getUserAddresses(),
        listingApi.getVenueFrom3DDV(Number(queryParams?.eventId)),
        // Only call this API if it is XS2 affiliate
        queryParams?.affiliateId === XS2EVENT_ID
            ? eventApi.getEventGuestData({
                  eventId: Number(queryParams?.eventId),
                  condition: SubmitXS2Condition.PRE_CHECKOUT,
                  affiliateId: XS2EVENT_ID,
              })
            : null,
        ipApi.getCountryIp(),
    ]);

    const data = listing.data;

    const extraParams = { listingId };

    const currencies = await currencyApi.getCurrencies();

    return (
        <StripeProvider listing={listing.data}>
            <CheckoutProvider
                listing={data}
                paymentProvider={paymentProvider}
                extraParams={extraParams}
                metadata={metadata}
                addresses={addresses}
                external_3ddv_id={external_3ddv_id}
                external_3ddv_blocks={external_3ddv_blocks}
                attendeeSchema={attendeeSchema}
                ipCountry={ipCountry}
                currencyCode={currencyCode ?? 'USD'}
            >
                <div className="relative bg-white min-h-screen font-normal">
                    <CheckoutHeader currencies={currencies ?? {}} languages={languages ?? {}} />

                    <div className="flex md:flex-col flex-col-reverse lg:gap-10 lg:grid lg:grid-cols-12 mx-auto md:pt-10 max-w-6xl">
                        <div id="checkout-payment" className="space-y-4 lg:col-span-7 p-4">
                            <div className="hidden md:block">
                                <CheckoutTitle />
                            </div>
                            {/* Step 1 */}
                            <CheckoutContactForm />

                            {/* Step 2 - Attendee Details (only when required by XS2Event) */}
                            <CheckoutAttendeeDetails />

                            {/* Step 3 / Step 2 - Confirm & Pay */}
                            <CheckoutPaymentMethod />
                        </div>
                        <div className="space-y-2 md:space-y-4 lg:col-span-5 px-4">
                            <CheckoutEventSummary />

                            <CheckoutPaymentDetail />

                            <div className="hidden md:block pt-4 pb-10">
                                <CheckoutGuarantee />
                            </div>
                        </div>
                    </div>
                </div>
                <CheckoutEffects />
            </CheckoutProvider>
        </StripeProvider>
    );
}
