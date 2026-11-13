import { useLocale } from 'next-intl';

import Country from '@/interfaces/Country';

const useLocalizedCountry = () => {
    const locale = useLocale();

    const getLocalizedCountryName = (country: Country) => {
        const nameKey = `name_${locale}` as keyof Country;
        return (country[nameKey] as string) || country.name;
    };

    return { getLocalizedCountryName };
};

export default useLocalizedCountry;
