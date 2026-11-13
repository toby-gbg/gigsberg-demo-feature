'use client';

import { CheckoutStep1Form } from '@/interfaces/Checkout';
import Country from '@/interfaces/Country';
import { Lead } from '@/interfaces/Lead';

export default class LeadMapper {
    static toContactDetailsForm(lead: Lead, defaultCountry?: Country | null): CheckoutStep1Form {
        return {
            terms: false,
            email: {
                value: lead.user.email,
            },
            password: '',
            first_name: lead.user.first_name,
            last_name: lead.user.last_name,
            phone: {
                isValid: false,
                forceChange: true,
                internationalNumber: lead.user.phone,
                ...(lead.user.phone_prefix && { prefix: lead.user.phone_prefix }),
            },
            address: lead.user.default_address ?? undefined,
            country: lead.user.default_address?.country ?? defaultCountry ?? undefined,
        };
    }
}
