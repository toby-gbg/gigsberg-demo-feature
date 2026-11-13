'use client';

import { useTranslations } from 'next-intl';

import ToursSkeleton from '@/components/skeleton/ToursSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Error() {
    const t = useTranslations();
    return (
        <div className="mb-14">
            <Skeleton className="mb-8 h-[1.5em] w-80 text-[24px] md:text-[28px] xl:text-heading" />

            <ToursSkeleton messageError={t('section_load_error')} />
        </div>
    );
}
