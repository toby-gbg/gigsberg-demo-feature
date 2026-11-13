export type C = { [key: string]: Currency };

export type CurrencyName =
    | 'POUND_STERLING'
    | 'EURO'
    | 'US_DOLLARS'
    | 'AUSTRALIAN_DOLLAR'
    | 'PLOLISH_ZLOTY'
    | 'CZECH_KORUNA'
    | 'NEW_ISRAELY_SHEKEL'
    | 'SWISS_FRANC'
    | 'ARGENTINE_PESOS'
    | 'BAHRAINI_DINAR'
    | 'HUNGARIAN_FORINT'
    | 'SWEDISH_KRONA'
    | 'NORWEGIAN_KRONE'
    | 'DANISH_KRONE'
    | 'POLISH_ZLOTY'
    | 'BOLIVIAN_BOLIVIANO'
    | 'BRAZILIAN_REAL'
    | 'CANADIAN_DOLLAR'
    | 'CHILEAN_PESO'
    | 'CHINESE_YUAN_RENMINBI'
    | 'COLOMBIAN_PESO';

export default interface Currency {
    id: number;
    name: string;
    symbol: string;
    code: string;
    eur_to_currency_rate: number;
}
