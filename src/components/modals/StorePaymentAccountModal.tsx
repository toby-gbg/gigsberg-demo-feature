'use client';

import {
    $paymentAccount,
    $paymentAccountModal,
} from '@/app/[locale]/account-settings/payment-accounts/_stores';
import { useStore } from '@nanostores/react';
import { ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useUpdateEffect } from 'react-use';
import { mutate } from 'swr';
import { isBIC, isEmail, isIBAN } from 'validator';

import { C } from '@/interfaces/Currency';
import { PaymentMethodForm, PaymentMethodFormSubmit } from '@/interfaces/PaymentMethod';
import { cn } from '@/lib/cn';
import { toCapitalizeWords } from '@/lib/string';
import {
    getPaymentAccountRules,
    getRoutingDetailsError,
    mapPaymentMethodForm,
} from '@/utils/paymentAccount';
import {
    useStorePaymentMethodMutation,
    useUpdatePaymentMethodMutation,
} from '@/swr/features/paymentMethod';

import CountrySelect from '@/components/CountrySelect';
import FloatingInput from '@/components/FloatingInput';
import FloatingSelect from '@/components/FloatingSelect';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { toast } from '@/components/ui/Toast';

const DEFAULT_VALUES = {
    isDefault: 0,
    bankType: { label: 'Default', value: 1 },
    comments: '',
};

interface StorePaymentAccountModalProps {
    hasExistingPaymentAccounts: boolean;
    userId?: number;
    currencies: C;
}

export default function StorePaymentAccountModal({
    hasExistingPaymentAccounts,
    userId,
    currencies,
}: StorePaymentAccountModalProps) {
    const t = useTranslations();

    const formDefaultValues = {
        ...DEFAULT_VALUES,
        isDefault: hasExistingPaymentAccounts ? 0 : 1,
    };

    const currencyOptions = currencies
        ? Object.keys(currencies).map((item) => ({
              value: item,
              label: item,
          }))
        : [];

    const { formState, control, getValues, handleSubmit, reset, watch } =
        useForm<PaymentMethodForm>({
            defaultValues: formDefaultValues,
        });
    const isOpen = useStore($paymentAccountModal);
    const paymentAccount = useStore($paymentAccount);

    const currentBankCountryId = watch('bankCountryId');
    const currentCurrency = watch('currency');
    const isEdit = paymentAccount !== null;

    const resetFormState = () => {
        reset(formDefaultValues);
        $paymentAccount.set(null);
        $paymentAccountModal.set(false);
    };

    const { trigger: addPaymentMethod, isMutating: isLoading } = useStorePaymentMethodMutation({
        userId,
        onSuccess: () => {
            toast.add({ title: t('add_payment_method_success'), type: 'success' });
            mutate(['/payment-method', userId]);
            resetFormState();
        },
        onError: () => toast.add({ title: t('add_payment_method_error'), type: 'error' }),
    });
    const { trigger: updatePaymentMethod, isMutating: isUpdating } = useUpdatePaymentMethodMutation(
        {
            userId,
            onSuccess: () => {
                toast.add({ title: t('update_payment_method_success'), type: 'success' });
                mutate(['/payment-method', userId]);
                resetFormState();
            },
            onError: () => toast.add({ title: t('submit_form_error'), type: 'error' }),
        }
    );

    useUpdateEffect(() => {
        if (paymentAccount) {
            reset({
                ...DEFAULT_VALUES,
                ...mapPaymentMethodForm(paymentAccount),
            });
        } else {
            reset(formDefaultValues);
        }
    }, [paymentAccount, isOpen, hasExistingPaymentAccounts]);

    const onSubmit: SubmitHandler<PaymentMethodForm> = async ({ bankType, ...data }) => {
        const payload: PaymentMethodFormSubmit = {
            ...data,
            bankType: bankType?.value ?? 1,
            isDefault: !isEdit && !hasExistingPaymentAccounts ? 1 : data.isDefault,
            methodType: 'bank',
            comments: data?.comments ?? '',
            iban: data.iban,
        };

        if (paymentAccount) {
            updatePaymentMethod({ id: paymentAccount.id, body: payload });
        } else {
            addPaymentMethod(payload);
        }
    };
    const isDisableDefaultCheckbox =
        !hasExistingPaymentAccounts || Boolean(paymentAccount?.is_default);

    const { iban, accountNumber, bic, sortCode, required } = getPaymentAccountRules(
        currentBankCountryId,
        currentCurrency
    );

    const renderFields = () => {
        return (
            <>
                <Controller
                    control={control}
                    name="institution"
                    rules={{
                        required: t('field_required'),
                        pattern: {
                            value: /^[A-Za-z0-9.,&\-\s]+$/,
                            message: t('field_invalid_format'),
                        },
                        maxLength: {
                            value: 100,
                            message: t('field_max_length', { length: 100 }),
                        },
                        minLength: {
                            value: 2,
                            message: t('field_min_length', { length: 2 }),
                        },
                    }}
                    render={({ field, fieldState: { error } }) => (
                        <FloatingInput
                            {...field}
                            label={t('payment_bank_institution')}
                            required
                            errorMessage={error?.message}
                            classNames={{ wrapper: 'col-span-12' }}
                        />
                    )}
                />
                {iban && (
                    <Controller
                        control={control}
                        name="iban"
                        shouldUnregister
                        rules={{
                            required: required.iban ? t('field_required') : false,
                            validate: (value) =>
                                !value || isIBAN(value) || t('field_invalid_format'),
                        }}
                        render={({ field, fieldState: { error } }) => (
                            <FloatingInput
                                {...field}
                                label={t('payment_iban')}
                                required={required.iban}
                                errorMessage={error?.message}
                                classNames={{ wrapper: 'col-span-12 md:col-span-6' }}
                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                        )}
                    />
                )}
                {bic && (
                    <Controller
                        control={control}
                        name="bic"
                        shouldUnregister
                        rules={{
                            required: required.bic ? t('field_required') : false,
                            validate: (value) => {
                                if (required.bicOrSortCode) {
                                    const sortCodeValue = getValues('ukSortCode');
                                    const routingDetailsError = getRoutingDetailsError(
                                        value,
                                        sortCodeValue
                                    );

                                    if (routingDetailsError === 'required') {
                                        return t('field_required');
                                    }
                                    if (routingDetailsError === 'exclusive') {
                                        return t('field_invalid_format');
                                    }
                                }

                                return !value || isBIC(value) || t('field_invalid_format');
                            },
                        }}
                        render={({ field, fieldState: { error } }) => (
                            <FloatingInput
                                {...field}
                                label={t('payment_bic_swift')}
                                errorMessage={error?.message}
                                required={required.bic}
                                classNames={{
                                    wrapper: cn(
                                        'col-span-12',
                                        iban ? 'md:col-span-6' : 'md:col-span-12'
                                    ),
                                }}
                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                        )}
                    />
                )}
                {accountNumber && (
                    <Controller
                        control={control}
                        name="accountNumber"
                        shouldUnregister
                        rules={{
                            required: required.accountNumber ? t('field_required') : false,
                            pattern: {
                                value: /^[0-9a-zA-Z]+$/,
                                message: t('field_invalid_format'),
                            },
                            maxLength: {
                                value: 34,
                                message: t('field_max_length', { length: 34 }),
                            },
                        }}
                        render={({ field, fieldState: { error } }) => (
                            <FloatingInput
                                {...field}
                                label={t('account_number')}
                                errorMessage={error?.message}
                                required={required.accountNumber}
                                classNames={{ wrapper: 'col-span-12' }}
                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                        )}
                    />
                )}

                {sortCode && (
                    <Controller
                        control={control}
                        name="ukSortCode"
                        shouldUnregister
                        rules={{
                            required: required.sortCode ? t('field_required') : false,
                            validate: (value) => {
                                if (!required.bicOrSortCode) return true;

                                const bicValue = getValues('bic');
                                const routingDetailsError = getRoutingDetailsError(bicValue, value);

                                if (routingDetailsError === 'required') return t('field_required');
                                if (routingDetailsError === 'exclusive') {
                                    return t('field_invalid_format');
                                }
                                return true;
                            },
                            pattern: {
                                value: /^\d{2}[-\s]?\d{2}[-\s]?\d{2}$/,
                                message: t('field_invalid_format'),
                            },
                        }}
                        render={({ field, fieldState: { error } }) => (
                            <FloatingInput
                                {...field}
                                label={t('sort_code')}
                                required={required.sortCode}
                                value={field.value?.replace(/(\d{2})(?=\d)/g, '$1-') || ''}
                                errorMessage={error?.message}
                                classNames={{ wrapper: 'col-span-12' }}
                            />
                        )}
                    />
                )}

                <Controller
                    control={control}
                    name="comments"
                    rules={{
                        maxLength: {
                            value: 300,
                            message: t('field_max_length', { length: 300 }),
                        },
                    }}
                    render={({ field, fieldState: { error } }) => (
                        <FloatingInput
                            {...field}
                            label={t('comments')}
                            errorMessage={error?.message}
                            classNames={{ wrapper: 'col-span-12' }}
                        />
                    )}
                />
            </>
        );
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    reset(DEFAULT_VALUES);
                    $paymentAccount.set(null);
                }
                $paymentAccountModal.set(isOpen);
            }}
        >
            <DialogContent
                classNames={{
                    popup: 'max-h-[80dvh] overflow-y-auto',
                }}
            >
                <DialogHeader>
                    <DialogTitle>
                        {t(isEdit ? 'edit_payment_method_title' : 'add_payment_method_title')}
                    </DialogTitle>
                    <DialogDescription>{t('add_payment_method_description')}</DialogDescription>
                </DialogHeader>
                <DialogBody className="pb-0 text-black">
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                    >
                        <div className="col-span-12">
                            <div className="mb-2 font-medium">{t('contact_information')}</div>
                            <div className="gap-4 grid md:grid-cols-2">
                                <Controller
                                    control={control}
                                    name="fullname"
                                    rules={{
                                        required: t('field_required'),
                                        pattern: {
                                            value: /^[\p{L}\p{M}'’\-\s]+$/u,
                                            message: t('field_invalid_format'),
                                        },
                                        maxLength: {
                                            value: 100,
                                            message: t('field_max_length', { length: 100 }),
                                        },
                                        minLength: {
                                            value: 2,
                                            message: t('field_min_length', { length: 2 }),
                                        },
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FloatingInput
                                            {...field}
                                            label={t('legal_name')}
                                            required
                                            errorMessage={error?.message}
                                            onChange={(e) =>
                                                field.onChange(toCapitalizeWords(e.target.value))
                                            }
                                        />
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="email"
                                    rules={{
                                        required: t('field_required'),
                                        validate: (email) => isEmail(email) || t('invalid_email'),
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FloatingInput
                                            {...field}
                                            label={t('email_address')}
                                            type="email"
                                            required
                                            errorMessage={error?.message}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="mb-2 font-medium">
                                {t('payment_account_information')}
                            </div>
                            <div className="gap-4 grid grid-cols-12">
                                <Controller
                                    control={control}
                                    name="bankCountryId"
                                    rules={{ required: t('field_required') }}
                                    render={({
                                        field: { onChange, value },
                                        fieldState: { error },
                                    }) => (
                                        <div className="col-span-12 md:col-span-6">
                                            <CountrySelect
                                                isRequired
                                                onChange={(selectedCountry) => {
                                                    onChange(selectedCountry?.id);
                                                }}
                                                value={value}
                                                errorMessage={error?.message}
                                                classNames={{
                                                    trigger: 'h-13.5',
                                                    skeleton: 'h-13.5',
                                                }}
                                            />
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="currency"
                                    rules={{ required: t('field_required') }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FloatingSelect
                                            label={t('currency')}
                                            value={field.value ?? undefined}
                                            options={currencyOptions}
                                            onChange={(value) => field.onChange(value ?? null)}
                                            errorMessage={error?.message}
                                            isRequired
                                            classNames={{ wrapper: 'col-span-12 md:col-span-6' }}
                                        />
                                    )}
                                />
                                {renderFields()}
                            </div>
                        </div>
                        <Controller
                            control={control}
                            name="isDefault"
                            render={({ field: { value, onChange } }) => (
                                <div className="flex items-center gap-3 bg-bg-subtle mt-2 p-3 border border-neutral-400 rounded-lg">
                                    <Checkbox
                                        id="payment-account-default"
                                        checked={Boolean(value)}
                                        disabled={isDisableDefaultCheckbox}
                                        onCheckedChange={(checked) => onChange(checked ? 1 : 0)}
                                        className="size-5"
                                    />
                                    <Label
                                        htmlFor="payment-account-default"
                                        className={cn(
                                            isDisableDefaultCheckbox &&
                                                'cursor-not-allowed opacity-50'
                                        )}
                                    >
                                        {t('set_as_default_payment_account')}
                                    </Label>
                                </div>
                            )}
                        />
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 max-w-50 text-xs">
                                <ShieldCheck className="min-w-6 text-[#00A53F]" />
                                {t('payment_account_is_safe')}
                            </div>
                            <Button
                                type="submit"
                                className="col-span-12 rtl:mr-auto ltr:ml-auto min-w-40"
                                disabled={!formState.isDirty || isLoading || isUpdating}
                                aria-busy={isLoading || isUpdating}
                                isLoading={isLoading || isUpdating}
                            >
                                {t('save')}
                            </Button>
                        </div>
                    </form>
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}
