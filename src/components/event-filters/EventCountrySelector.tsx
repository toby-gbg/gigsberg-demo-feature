'use client';

import { useTranslations } from 'next-intl';

import Country from '@/interfaces/Country';
import { fallbackTranslation } from '@/utils/common';

import useLocalizedCountry from '@/hooks/useLocalizedCountry';

import FloatingSelect from '@/components/FloatingSelect';

interface EventCountrySelectorProps {
    countries: Country[];
    value: number | null;
    onChange: (countryId: number | null) => void;
}

const EventCountrySelector = ({ countries, value, onChange }: EventCountrySelectorProps) => {
    const t = useTranslations();

    const { getLocalizedCountryName } = useLocalizedCountry();

    const options = countries.map((country) => ({
        value: country.id,
        label: getLocalizedCountryName(country),
    }));

    return (
        <FloatingSelect
            hideErrorMessage
            isClearable
            placeholder={fallbackTranslation(
                t('all_countries_capitalize'),
                'all_countries_capitalize',
                'All Countries'
            )}
            value={value ?? undefined}
            options={options}
            onChange={(countryId) => onChange(countryId ? Number(countryId) : null)}
            classNames={{ trigger: 'bg-white' }}
        />
    );
};

export default EventCountrySelector;
