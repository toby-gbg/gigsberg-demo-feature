import { PURCHASE_REDIRECT_KEY } from '@/constants/checkout';

export const markPurchaseRedirect = (intent?: string) => {
    // WLB-2843
    if (intent && typeof window !== 'undefined') {
        sessionStorage.setItem(PURCHASE_REDIRECT_KEY, intent);
    }
};
