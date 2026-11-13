'use client';

import { RegisterBody } from '@/interfaces/Auth';
import { CheckoutStep1Form } from '@/interfaces/Checkout';
import { UpdateUser } from '@/interfaces/User';

export default class CheckoutUtil {
    private static isCompleteAddress(
        form: Partial<CheckoutStep1Form>
    ): form is Required<
        Pick<
            CheckoutStep1Form,
            | 'address_line1'
            | 'address_line2'
            | 'city'
            | 'postcode'
            | 'country'
            | 'fullname'
            | 'state'
        >
    > {
        return (
            form.address_line1 !== undefined &&
            form.city !== undefined &&
            form.postcode !== undefined &&
            form.country?.id !== undefined
        );
    }

    private static buildAddress(addressData: Partial<CheckoutStep1Form>) {
        if (this.isCompleteAddress(addressData)) {
            return {
                address_line1: addressData.address_line1,
                address_line2: addressData.address_line2,
                city: addressData.city,
                postcode: addressData.postcode,
                country_id: addressData.country.id,
                state_id: addressData.state?.id,
                fullname: addressData.fullname,
            };
        }
        return undefined;
    }

    static step1ToRegister = ({
        email: { value: email },
        password,
        first_name,
        last_name,
        phone,
        address_line1,
        address_line2,
        city,
        postcode,
        country,
        state,
        fullname,
        is_update_news,
    }: CheckoutStep1Form): RegisterBody => {
        const address = this.buildAddress({
            address_line1,
            address_line2,
            city,
            postcode,
            country,
            state,
            fullname,
        });

        return {
            email,
            password,
            phone: phone.internationalNumber,
            phone_prefix: phone.prefix,
            first_name,
            last_name,
            is_update_news,
            ...(address && { address }),
        };
    };

    static step1ToUpdateUser = ({
        first_name,
        last_name,
        phone,
        address_line1,
        address_line2,
        fullname,
        postcode,
        city,
        country,
        state,
        is_update_news,
    }: CheckoutStep1Form): UpdateUser => {
        const newAddress = this.buildAddress({
            address_line1,
            address_line2,
            city,
            postcode,
            country,
            state,
            fullname,
        });

        return {
            phone,
            first_name,
            last_name,
            is_update_news,
            ...(newAddress ? { address: newAddress } : {}),
        };
    };
}
