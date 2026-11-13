import { CountryCode } from 'libphonenumber-js';

export default interface Country {
    id: number;
    name: string;
    code: CountryCode;
    name_fr: string;
    name_es: string;
    name_de: string;
    name_it: string;
    name_ru: string;
    name_he: string;
    name_ar: string;
    name_hu: string;
    name_pl: string;
    name_hr: string;
    name_pt: string;
    currency_code: string | null;
    language_code: string | null;
    iso_code: CountryCode;
}
