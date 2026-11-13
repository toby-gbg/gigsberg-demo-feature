'use client';

import Country from '@/interfaces/Country';
import User from '@/interfaces/User';
import { getInternationalNumber } from '@/lib/phone';

import {
    IUserToAccountDetails,
    IUserToCheckoutForm,
    IUserToPhoneDetails,
} from './user.mapper.types';

export default class UserMapper {
    static toCheckoutForm(user: User, defaultCountry?: Country | null): IUserToCheckoutForm {
        return {
            first_name: user.first_name,
            last_name: user.last_name,
            email: {
                error: false,
                value: user.email,
            },
            is_update_news: user.is_update_news,
            phone: this.toPhoneDetails(user),
            // address: user.default_address,
            country: user.default_address?.country ?? defaultCountry ?? undefined,
        };
    }

    static toAccountDetails(user: User): IUserToAccountDetails {
        return {
            first_name: user?.first_name,
            last_name: user?.last_name,
            email: user?.email,
            company_name: user?.company_name,
            phone: this.toPhoneDetails(user),
        };
    }

    private static toPhoneDetails(user: User): IUserToPhoneDetails {
        if (!user.phone) return;

        return {
            isValid: Boolean(user.phone && user.phone_prefix),
            forceChange: true,
            internationalNumber: getInternationalNumber(user.phone, user.phone_prefix),
            ...(user.phone_prefix && { prefix: user.phone_prefix }),
        };
    }
}
