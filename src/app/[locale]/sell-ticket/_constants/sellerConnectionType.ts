import { TranslatableOption } from '@/interfaces/Select';

const SELLER_CONNECTION_TYPES: TranslatableOption<number>[] = [
    { key: 'seller_connection_none', label: 'No connection', value: 0 },
    {
        key: 'seller_connection_company',
        label: 'Seller is Gigsberg or a Gigsberg Group company',
        value: 1,
    },
    {
        key: 'seller_connection_organiser',
        label: 'Seller is the organiser of the event, or is acting on behalf of the event organiser',
        value: 2,
    },
];

export default SELLER_CONNECTION_TYPES;
