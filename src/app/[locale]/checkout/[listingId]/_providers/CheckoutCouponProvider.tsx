'use client';

import { createContext, ReactNode, useContext, useState } from 'react';
import { useUpdateEffect } from 'react-use';

import { useUser } from '@/providers/UserProvider';

interface CheckoutCouponContextValue {
    couponCode: string;
    setCouponCode: (v: string) => void;
}

const CheckoutCouponContext = createContext<CheckoutCouponContextValue | null>(null);

export function CheckoutCouponProvider({ children }: { children: ReactNode }) {
    const [couponCode, setCouponCode] = useState('');

    const user = useUser();

    // Clear coupon when user logs out
    useUpdateEffect(() => {
        if (!user) {
            setCouponCode('');
        }
    }, [user]);

    return (
        <CheckoutCouponContext.Provider
            value={{
                couponCode,
                setCouponCode,
            }}
        >
            {children}
        </CheckoutCouponContext.Provider>
    );
}

export function useCheckoutCoupon() {
    const ctx = useContext(CheckoutCouponContext);
    if (!ctx) {
        throw new Error('useCheckoutCoupon must be used within CheckoutCouponProvider');
    }
    return ctx;
}
