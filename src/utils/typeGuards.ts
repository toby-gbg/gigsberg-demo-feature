import { PaymentProviderEnum } from '@/interfaces/Checkout';

export function isPaymentProvider(value: string | undefined): value is PaymentProviderEnum {
    return Object.values(PaymentProviderEnum).includes(value as PaymentProviderEnum);
}
