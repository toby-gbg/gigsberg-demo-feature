'use client';

import { ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';

import Link from '@/components/Link';
import { Button } from '@/components/ui/Button';

const NoSalesFoundFallback = () => {
    const t = useTranslations();

    return (
        <div className="flex flex-col justify-center items-center gap-3 col-span-12 py-4 w-full min-h-[50vh]">
            <div className="p-3 border border-primary rounded-full text-primary">
                <ShoppingCart />
            </div>
            <h1 className="font-semibold">{t('no_sales_found_title')}</h1>
            <h3 className="text-center">{t('no_sales_found_description')}</h3>
            <Link href="/account-settings/listings">
                <Button>{t('no_sales_found_cta')}</Button>
            </Link>
        </div>
    );
};

export default NoSalesFoundFallback;
