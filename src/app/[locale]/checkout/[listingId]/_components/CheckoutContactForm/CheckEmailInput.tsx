'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import isEmail from 'validator/lib/isEmail';

import { CheckoutStep1Form } from '@/interfaces/Checkout';
import { AppErrorKey } from '@/utils/api/api-error-codes';
import { useLazyCheckEmailQuery } from '@/swr/features/auth';

import { useUser } from '@/providers/UserProvider';

import FloatingInput from '@/components/FloatingInput';

export type EmailCheckStatus =
    'idle' | 'invalid_format' | 'already_registered' | 'check_failed' | 'available';

export type CheckEmailValue = {
    value: string;
    status?: EmailCheckStatus;
    error?: boolean;
};

interface Props {
    value?: CheckEmailValue;
    onChange?: (value: CheckEmailValue) => void;
}

const CheckEmailInput = ({ onChange, value }: Props) => {
    const t = useTranslations();
    const user = useUser();
    const isReadOnly = Boolean(user);

    const {
        formState: { errors },
    } = useFormContext<CheckoutStep1Form>();

    const { trigger: triggerEmailCheck, isMutating: isFetching } = useLazyCheckEmailQuery({
        // success here means the email already belongs to an account
        onSuccess: () => {
            onChange?.({ value: value?.value ?? '', status: 'already_registered' });
        },
        onError: (error) => {
            onChange?.({
                value: value?.value ?? '',
                status:
                    error.data.errorKey === AppErrorKey.EMAIL_NOT_FOUND
                        ? 'available'
                        : 'check_failed',
            });
        },
    });

    const _onChangeText = useCallback(
        (text: string) => {
            if (isReadOnly || !text) return;
            if (!isEmail(text)) {
                onChange?.({ value: text, status: 'invalid_format' });
                return;
            }
            triggerEmailCheck(text);
        },
        [isReadOnly, onChange, triggerEmailCheck]
    );

    const normalizeEmail = (email: string) => email.trimStart().toLowerCase();

    return (
        <FloatingInput
            label={t('email')}
            type="email"
            inputMode="email"
            value={value?.value}
            isLoading={isFetching}
            readOnly={isReadOnly}
            errorMessage={errors.email?.message}
            required
            onBlur={(e) => _onChangeText(normalizeEmail(e.target.value))}
            onChange={(e) => onChange?.({ value: e.target.value, status: 'idle' })}
        />
    );
};

export default CheckEmailInput;
