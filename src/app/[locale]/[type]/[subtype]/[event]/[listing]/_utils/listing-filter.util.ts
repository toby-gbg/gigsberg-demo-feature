export const QUANTITY_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);
export const VIP_CATEGORY_KEYWORDS = ['vip', 'premium', 'hospitality', 'lounge', 'vvip'];

export function toggleValue<T>(values: T[] = [], value: T): T[] {
    return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}
