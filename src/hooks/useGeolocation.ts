'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import Country from '@/interfaces/Country';
import { setUserCountry } from '@/stores';
import { useLazyGetOpenStreetMapLocationQuery } from '@/swr/features/openStreetMap';

import { toast } from '@/components/ui/Toast';

const useGeolocation = (countries: Country[]) => {
    const { trigger: getLocationLazy } = useLazyGetOpenStreetMapLocationQuery();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const t = useTranslations();

    const handleUseMyLocation = async (): Promise<Country | void> => {
        if (!navigator.geolocation) {
            toast.add({
                id: 'location',
                title: t('geolocation_is_not_supported_by_your_browser'),
                type: 'error',
            });
            return;
        }

        return new Promise((resolve, reject) => {
            setIsLoading(true);

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;

                        const locationData = await getLocationLazy({
                            latitude,
                            longitude,
                        });
                        const country = countries.find(
                            (element) =>
                                element.code.toUpperCase() ===
                                locationData.address.country_code.toUpperCase()
                        );
                        if (country) {
                            setUserCountry(country);
                            resolve(country);
                        }
                    } catch (error) {
                        toast.add({ title: t('error_determining_location'), type: 'error' });
                        reject(error);
                    } finally {
                        setIsLoading(false);
                    }
                },
                (error) => {
                    console.error(error);
                    setIsLoading(false);
                    if (error.PERMISSION_DENIED) {
                        toast.add({
                            id: 'location',
                            title: t('location_permission_denied_or_unknown'),
                            type: 'error',
                        });
                    } else if (error.POSITION_UNAVAILABLE) {
                        toast.add({
                            id: 'location',
                            title: t('unable_to_retrieve_your_location'),
                            type: 'error',
                        });
                    }
                    reject(error);
                }
            );
        });
    };

    return {
        handleUseMyLocation,
        isLoading,
    };
};

export default useGeolocation;
