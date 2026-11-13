'use client';

import { useTranslations } from 'next-intl';

import Tour from '@/interfaces/Tour';
import { fallbackTranslation } from '@/utils/common';

import FloatingSelect from '@/components/FloatingSelect';

interface EventTourSelectorProps {
    tours: Tour[];
    value: number | null;
    onChange: (tourId: number | null) => void;
}

const EventTourSelector = ({ tours, value, onChange }: EventTourSelectorProps) => {
    const t = useTranslations();

    const options: { value: number; label: string }[] = tours.map((tour) => ({
        value: tour.id,
        label: tour.name,
    }));

    return (
        <FloatingSelect
            hideErrorMessage
            isClearable
            placeholder={fallbackTranslation(
                t('all_tours_capitalize'),
                'all_tours_capitalize',
                'All Tours'
            )}
            value={value ?? undefined}
            options={options}
            onChange={(tourId) => onChange(tourId ? Number(tourId) : null)}
            classNames={{ trigger: 'bg-white' }}
        />
    );
};

export default EventTourSelector;
