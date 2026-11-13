import { CountryCode } from 'libphonenumber-js';

import { StudentDiscountEmbedInfo } from '@/interfaces/StudentDiscount';

export const DEFAULT_STUDENT_DISCOUNT_EMBED_SRC = [
    {
        name: 'tab_student_discount',
        title: 'Gigsberg Student Discount UK',
        src: 'https://www.studentdiscount.co.uk/gigsberg#embed',
    },
];

export const STUDENT_DISCOUNT_EMBED_SOURCES: Partial<
    Record<CountryCode, StudentDiscountEmbedInfo[]>
> = {
    GB: [
        {
            name: 'tab_student_discount',
            title: 'Gigsberg Student Discount UK',
            src: 'https://www.studentdiscount.co.uk/gigsberg#embed',
        },
    ],
};
