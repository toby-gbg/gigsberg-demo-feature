export interface ConstCurrency {
    symbol: string;
    name: string;
}

const currencies: ConstCurrency[] = [
    {
        symbol: '£',
        name: 'Pound Sterling',
    },
    {
        symbol: '€',
        name: 'Euro',
    },
    {
        symbol: '$',
        name: 'US Dollars',
    },
    {
        symbol: 'AU$',
        name: 'Australian Dollar',
    },
    {
        symbol: 'lz',
        name: 'Polish Zloty',
    },
    {
        symbol: 'Kc',
        name: 'Czech Koruna',
    },
    {
        symbol: '₪',
        name: 'New Israeli Shekel',
    },
    {
        symbol: 'SFr',
        name: 'Swiss Franc',
    },
    {
        symbol: '$',
        name: 'Argentine Pesos',
    },
    {
        symbol: 'Øre',
        name: 'Danish Krone',
    },
];

export const BASE_CAP_EUR = 10_000;

export default currencies;
