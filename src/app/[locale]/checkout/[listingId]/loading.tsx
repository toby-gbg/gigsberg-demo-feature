'use client';

import { useEffectOnce } from 'react-use';

import CheckoutLayoutSkeleton from './_components/CheckoutLayoutSkeleton';

export default function Loading() {
    // Auto scroll to top
    useEffectOnce(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
    });

    return <CheckoutLayoutSkeleton />;
}
