import { ReactNode } from 'react';

import Address from '@/interfaces/Address';
import { EventGuestDataResponse } from '@/interfaces/AttendeeDetails';
import { CheckoutPaymentProvider as CheckoutPaymentProviderType } from '@/interfaces/Checkout';
import Country from '@/interfaces/Country';
import { ExternalDigitalVenueBlocks, ListingCheckout, ListingMetadata } from '@/interfaces/Listing';

import { CheckoutAttendeeInfoProvider } from './CheckoutAttendeeInfoProvider';
import { CheckoutCouponProvider } from './CheckoutCouponProvider';
import { CheckoutDataProvider } from './CheckoutDataProvider';
import { CheckoutLeadProvider } from './CheckoutLeadProvider';
import { CheckoutPaymentProvider } from './CheckoutPaymentProvider';

export interface CheckoutExtraParams {
    listingId: string;
}

interface CheckoutProviderProps {
    listing: ListingCheckout;
    paymentProvider: CheckoutPaymentProviderType;
    extraParams: CheckoutExtraParams;
    metadata: ListingMetadata | null;
    children: ReactNode;
    addresses: Address[];
    external_3ddv_id?: string | null;
    external_3ddv_blocks?: ExternalDigitalVenueBlocks[];
    attendeeSchema: EventGuestDataResponse | null;
    ipCountry: Country;
    currencyCode: string;
}

export default function CheckoutProvider({
    listing,
    extraParams,
    metadata,
    addresses,
    children,
    paymentProvider,
    external_3ddv_id,
    external_3ddv_blocks,
    attendeeSchema,
    ipCountry,
    currencyCode,
}: CheckoutProviderProps) {
    // Lead provider: lead lifecycle & persistence (cookies)
    // Coupon provider: coupon state & validation
    // Data provider: checkout data listing & pricing
    // UI provider: modals visibility
    // Payment provider: payment flow & steps

    return (
        <CheckoutLeadProvider listing={listing}>
            <CheckoutCouponProvider>
                <CheckoutDataProvider
                    listing={listing}
                    extraParams={extraParams}
                    metadata={metadata}
                    addresses={addresses}
                    external_3ddv_id={external_3ddv_id}
                    external_3ddv_blocks={external_3ddv_blocks}
                    ipCountry={ipCountry}
                    currencyCode={currencyCode}
                >
                    <CheckoutPaymentProvider paymentProvider={paymentProvider}>
                        <CheckoutAttendeeInfoProvider attendeeSchema={attendeeSchema}>
                            {children}
                        </CheckoutAttendeeInfoProvider>
                    </CheckoutPaymentProvider>
                </CheckoutDataProvider>
            </CheckoutCouponProvider>
        </CheckoutLeadProvider>
    );
}
