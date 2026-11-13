'use client';

import { useTranslations } from 'next-intl';

import City from '@/interfaces/City';
import { fallbackTranslation } from '@/utils/common';

import FloatingSelect from '@/components/FloatingSelect';

interface EventCitySelectorProps {
    cities: City[];
    countryId: number | null;
    value: number | null;
    onChange: (cityId: number | null) => void;
}

const EventCitySelector = ({ cities, countryId, value, onChange }: EventCitySelectorProps) => {
    const t = useTranslations();

    const options = cities
        .filter((city) => city.country_id === countryId)
        .map((city) => ({ value: city.id, label: city.name }));

    return (
        <FloatingSelect
            hideErrorMessage
            isClearable
            isDisabled={!countryId}
            placeholder={fallbackTranslation(
                t('all_cities_capitalize'),
                'all_cities_capitalize',
                'All Cities'
            )}
            value={value ?? undefined}
            options={options}
            onChange={(cityId) => onChange(cityId ? Number(cityId) : null)}
            classNames={{ trigger: 'bg-white' }}
        />
    );
};

export default EventCitySelector;
