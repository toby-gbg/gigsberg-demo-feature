'use client';

import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';

interface Props {
    onAddClick: () => void;
}

const NoAddressesFoundFallback = ({ onAddClick }: Props) => {
    const t = useTranslations();

    return (
        <div className="col-span-12 flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 py-4">
            <div className="border-primary text-primary rounded-full border p-3">
                <MapPin />
            </div>
            <h1 className="font-semibold">{t('no_addresses_found_title')}</h1>
            <h3 className="text-center">{t('no_addresses_found_description')}</h3>
            <Button className="bg-gradient h-11 min-w-24 hover:opacity-90" onClick={onAddClick}>
                {t('no_addresses_found_cta')}
            </Button>
        </div>
    );
};

export default NoAddressesFoundFallback;
