import { CurrencyName } from '@/interfaces/Currency';

export const currencyMap: Record<string, CurrencyName> = {
    GBP: 'POUND_STERLING',
    EUR: 'EURO',
    USD: 'US_DOLLARS',
    AUD: 'AUSTRALIAN_DOLLAR',
    PLN: 'PLOLISH_ZLOTY',
    CZK: 'CZECH_KORUNA',
    ILS: 'NEW_ISRAELY_SHEKEL',
    CHF: 'SWISS_FRANC',
    ARS: 'ARGENTINE_PESOS',
    BHD: 'BAHRAINI_DINAR',
    HUF: 'HUNGARIAN_FORINT',
    SEK: 'SWEDISH_KRONA',
    NOK: 'NORWEGIAN_KRONE',
    DKK: 'DANISH_KRONE',
    BOB: 'BOLIVIAN_BOLIVIANO',
    BRL: 'BRAZILIAN_REAL',
    CAD: 'CANADIAN_DOLLAR',
    CLP: 'CHILEAN_PESO',
    CNY: 'CHINESE_YUAN_RENMINBI',
    COP: 'COLOMBIAN_PESO',
};

export const customCurrencySymbol: Record<string, string> = {
    EUR: '€',
    USD: 'US$',
    AUD: 'AU$',
    PLN: 'lz',
    CZK: 'Kc',
    ILS: '₪',
    CHF: 'SFr',
    ARS: 'Arg$',
    DKK: 'Øre',
    GBP: '£',
    INR: '₹',
};

export const formatPrice = (amount: number, locale: string, currency: string) => {
    const formater = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    });

    const symbol = customCurrencySymbol[currency];
    if (!symbol) return formater.format(amount);

    const parts = formater.formatToParts(amount);
    return parts.map((p) => (p.type === 'currency' ? symbol : p.value)).join('');
};
