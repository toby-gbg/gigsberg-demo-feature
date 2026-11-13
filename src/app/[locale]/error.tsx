'use client';

import { useTranslations } from 'next-intl';

import Link from '@/components/Link';
import { Button } from '@/components/ui/Button';

export default function Error({ error }: { error: Error & { digest?: string } }) {
    const t = useTranslations();

    console.error('An unexpected error occurred:', error);

    return (
        <div className="flex flex-col items-center justify-center text-center p-6 h-97.25">
            <h1 className="text-3xl font-bold text-primary">{t('no_load')}</h1>
            <p className="mt-4 text-gray-500">{t('please_refresh')}</p>
            <Link href={'/'}>
                <Button className="mt-6">{t('back_to_event')}</Button>
            </Link>
        </div>
    );
}
