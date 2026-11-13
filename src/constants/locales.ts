import type { Locale } from 'date-fns';
import { ar, de, enGB, enUS, es, fr, he, hr, hu, it, nl, pl, pt, ru, sv } from 'date-fns/locale';

export const DATE_LOCALES: Record<string, Locale> = {
    ar,
    de,
    'en-GB': enGB,
    'en-US': enUS,
    en: enGB,
    us: enUS,
    'es-ES': es,
    'es-AR': es,
    fr,
    he,
    hr,
    hu,
    it,
    nl,
    pl,
    pt,
    ru,
    sv,
};

const locales = [
    'en-GB',
    'fr',
    'en-US',
    'us',
    'es-ES',
    'es-AR',
    'de',
    'it',
    'ru',
    'he',
    'ar',
    'hu',
    'pl',
    'hr',
    'pt',
    'sv',
    'nl',
];

const defaultWLBLocales = [
    'en-GB',
    'fr',
    'es-ES',
    'de',
    'it',
    'ru',
    'he',
    'ar',
    'hu',
    'pl',
    'hr',
    'pt',
    'sv',
    'nl',
];

export const prefixes: Record<string, string> = {
    'en-GB': '/en',
    'en-US': '/en',
    'es-ES': '/es',
    'es-AR': '/es',
};

export const defaultLocales: Record<string, string[]> = {
    'tickets.marca.com': ['en-US', 'es-AR'],
    'entradas.marca.com': ['es-ES', 'en-GB'],
    'metropoli-dev.gigsberg.com': ['en-GB', 'es-AR'],
    'entradas.elmundo.es': ['es-ES', 'en-GB'],
    'boletoconfirmado.com': ['es-ES', 'en-GB'],
    'bilhetes.abola.pt': [
        'pt',
        'en-GB',
        'fr',
        'es-ES',
        'de',
        'it',
        'ru',
        'he',
        'ar',
        'hu',
        'pl',
        'hr',
        'sv',
        'nl',
    ],
    'abola.gigsberg.com': [
        'pt',
        'en-GB',
        'fr',
        'es-ES',
        'de',
        'it',
        'ru',
        'he',
        'ar',
        'hu',
        'pl',
        'hr',
        'sv',
        'nl',
    ],
    'www.boletoconfirmado.com': ['es-ES', 'en-GB'],
    'gigsberg.com': defaultWLBLocales,
    'www.gigsberg.com': defaultWLBLocales,
    'gigsberg.co.uk': ['en-GB'],
    'www.gigsberg.co.uk': ['en-GB'],
    'gigsberg.ch': defaultWLBLocales,
    'www.gigsberg.ch': defaultWLBLocales,
    'pre-marketplace.gigsberg.co.uk': ['en-GB'],
    'www.pre-marketplace.gigsberg.co.uk': ['en-GB'],
};

export const getDefaultLocaleForDomain = (hostname: string): string => {
    return defaultLocales[hostname]?.[0] || 'en-GB';
};

export default locales;

export const LOCALE_EXCEPTION_PATHS = ['/checkout', '/thank-you'];

export const RTL_LOCALES = ['he', 'ar'];
