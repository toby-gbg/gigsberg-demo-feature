import Language, { L } from '@/interfaces/Language';

const getLfromLanguages = (languages: Language[]): L => {
    return languages.reduce((acc, language) => {
        acc[language.iso_code] = language;
        return acc;
    }, {} as L);
};

export { getLfromLanguages };
