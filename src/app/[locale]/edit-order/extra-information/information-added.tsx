'use client';

import { useTranslations } from 'next-intl';

import Link from '@/components/Link';
import { Button } from '@/components/ui/Button';

// import { toast } from '@/components/ui/Toast';
// import { useEffectOnce } from 'react-use';

export default function InfoAdded() {
    const t = useTranslations();

    // useEffectOnce(() => {
    //     toast.add({ title: t('info_added_title'), type: 'success' });
    // });

    return (
        <div className="flex flex-col justify-center items-center p-6 h-97.25 text-center">
            <h1 className="font-bold text-primary text-3xl">{t('info_added_title')}</h1>
            <p className="mt-4 text-gray-500">{t('info_added_description')}</p>
            <Link href={'/'}>
                <Button className="mt-6">{t('back_to_homepage')}</Button>
            </Link>
        </div>
    );
}
