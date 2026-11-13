import { all } from 'better-all';

import type Website from '@/interfaces/Website';
import { languageApi } from '@/services/server/languages';

import MainCountryClient from './MainCountryClient';

interface Props {
    mode?: 'burger' | 'normal';
    mobileOnly?: boolean;
    website?: Website | null;
}

export default async function MainCountry({ website, ...props }: Props) {
    const { languages } = await all({
        async languages() {
            if (!website) return {};
            return languageApi.getLanguagesOfWebsite(website);
        },
    });

    return <MainCountryClient {...props} languages={languages ?? {}} />;
}
