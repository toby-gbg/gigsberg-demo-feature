'use client';

import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

import Link from '@/components/Link';
import { Button } from '@/components/ui/Button';

const NoListingsFoundFallback = () => {
    const t = useTranslations();

    return (
        <div className="flex flex-col justify-center items-center gap-3 col-span-12 py-4 w-full min-h-[50vh]">
            <div className="p-3 border border-primary rounded-full text-primary">
                <Star />
            </div>
            <h1 className="font-semibold">{t('no_listings_found_title')}</h1>
            <h3 className="text-center">{t('no_listings_found_description')}</h3>
            <Link href="/sell-ticket">
                <Button>{t('no_listings_found_cta')}</Button>
            </Link>
        </div>
    );
};

export default NoListingsFoundFallback;
