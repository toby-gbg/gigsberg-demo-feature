import { atom } from 'nanostores';

import PaymentMethod from '@/interfaces/PaymentMethod';

export const $paymentAccountModal = atom<boolean>(false);
export const $paymentAccount = atom<PaymentMethod | null>(null);

export const $deletePaymentAccountModal = atom<boolean>(false);
export const $deletePaymentAccount = atom<PaymentMethod | null>(null);
