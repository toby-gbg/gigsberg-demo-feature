import locales from '@/constants/locales';

export type LanguageType = (typeof locales)[number];

export type L = { [key in LanguageType]: Language };

export default interface Language {
    id: number;
    name: string;
    local_name: string;
    image?: string | null;
    tld: string;
    flag_code: string;
    iso_code: LanguageType;
    is_ltr?: number; // 0 or 1
    is_pro: number; // 0 or 1
    locale?: string | null;
    active: number; // 0 or 1
    canonical_url?: string | null;
    languages?: L;
}
