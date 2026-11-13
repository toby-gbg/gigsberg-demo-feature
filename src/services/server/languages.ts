import Language, { L } from '@/interfaces/Language';
import Website from '@/interfaces/Website';
import Cache from '@/constants/cache';

import { apiService } from './base';
import { apiEndpoints } from './config';

export const languageApi = {
    async getLanguagesOfWebsite(website: Website): Promise<L> {
        let languages: Language[] = [];

        if (website.languages.length > 0) languages = website?.languages;
        else languages = await this.getLanguages();

        return this.getLfromLanguages(languages);
    },

    async getLanguages(): Promise<Language[]> {
        return apiService.get<Language[]>(apiEndpoints.languages, {
            next: {
                tags: ['languages:all'],
                revalidate: Cache.MAX,
            },
            cache: 'force-cache',
        });
    },
    getLfromLanguages(languages: Language[]): L {
        return languages.reduce((acc, language) => {
            acc[language.iso_code.toLowerCase()] = language;
            return acc;
        }, {} as L);
    },
};
