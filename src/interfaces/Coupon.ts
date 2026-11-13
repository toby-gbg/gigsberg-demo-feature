import { TAppErrorKey } from '@/utils/api/api-error-codes';

export interface CouponInfo {
    id: number;
    amount: number;
    original_amount: number;
    code: string;
    comment: string;
    currency_id: number;
    currency_code: string;
    discount: string;
    type: string;
    use_limit: number;
    uses: 0;
    created_at: string;
    deleted_at: string | null;
    from_date: string | null;
    to_date: string | null;
}

export interface CouponForm {
    couponCode: string;
    currencyCode: string;
    totalAmount: number;
    vat: number;
}

export type CouponResult = { ok: true } | { ok: false; code: TAppErrorKey; message?: string };
