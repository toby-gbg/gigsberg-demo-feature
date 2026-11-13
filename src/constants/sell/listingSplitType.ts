import { TranslatableOption } from '@/interfaces/Select';

const LISTING_SPLIT_TYPES: TranslatableOption<string>[] = [
    { key: 'any_split', label: 'Any Split', value: 'any' },
    { key: 'dont_leave_one', label: "Don't leave one", value: 'dont_leave_one' },
    { key: 'none', label: 'None', value: 'none' },
    { key: 'only_pairs', label: 'Only Pairs', value: 'pairs' },
];

export default LISTING_SPLIT_TYPES;
