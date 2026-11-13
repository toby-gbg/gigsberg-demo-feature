'use client';

import Image from 'next/image';

import Link from '@/components/Link';

import { useCheckoutData } from '../../_providers/CheckoutDataProvider';

export default function CheckoutLogo() {
    const { website } = useCheckoutData();
    const { logo, logo_dark } = website ?? {};

    const logoSrc = logo_dark || logo;

    return (
        <Link prefetch={false} href="/">
            <Image
                src={logoSrc ?? ''}
                alt="Logo"
                height={40}
                width={180}
                className="object-cover"
                priority
                quality={50}
            />
        </Link>
    );
}
