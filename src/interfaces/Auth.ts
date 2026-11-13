import type { PhoneValue } from '@/components/PhoneSelectInput';

import { AddressBody, AddressForm } from './Address';
import User from './User';

export interface Login {
    email: string;
    password: string;
}

export interface Register {
    email: string;
    password: string;
    phone: PhoneValue;
    first_name: string;
    last_name: string;
    address?: AddressForm;
    is_update_news?: boolean;
}

export type RegisterWithoutAddress = Omit<Register, 'address'>;

export interface RegisterBody extends Omit<Register, 'phone' | 'address'> {
    phone: string;
    phone_prefix?: string;
    address?: AddressBody;
}

export interface SendOtp {
    email: string;
}

export interface LostPassword {
    email: string;
    otp: string;
    password: string;
    confirmPassword: string;
}

export interface LoginResponse {
    message: string;
    token: string;
    user: User;
}

export interface JWTPayload {
    id: number;
    email: string;
}
