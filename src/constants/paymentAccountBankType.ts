import Select from '@/interfaces/Select';

const PAYMENT_ACCOUNT_BANK_TYPE: Select<number>[] = [
    {
        label: 'Individual',
        value: 1,
    },
    {
        label: 'Company',
        value: 2,
    },
];

export default PAYMENT_ACCOUNT_BANK_TYPE;
