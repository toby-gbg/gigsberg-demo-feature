'use client';

import { Fragment, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useUpdateEffect } from 'react-use';

import { C } from '@/interfaces/Currency';
import { SellForm } from '@/interfaces/Sell';
import { cn } from '@/lib/cn';
import { fallbackTranslation, translateOptions } from '@/utils/common';
import { BASE_CAP_EUR } from '@/constants/currencies';

import { useUser } from '@/providers/UserProvider';

import FloatingInput from '@/components/FloatingInput';

import SELLER_RELEVANT_ADDITIONAL_INFORMATIONS from '../../_constants/sellerAdditionalInformations';
import SellTicketMultiSelectOption from './SellTicketMultiSelectOption';

interface Props {
    currencies: C;
}

const SellTicketPriceDetails = ({ currencies }: Props) => {
    const t = useTranslations();
    const { control, trigger } = useFormContext<SellForm>();
    const user = useUser();
    const additionalInformations = translateOptions(t, SELLER_RELEVANT_ADDITIONAL_INFORMATIONS);
    const supportedCurrencies = useMemo(() => currencies, [currencies]);
    const faceValueCurrency = useWatch({ control, name: 'face_value_currency' });
    const ticketPriceCurrency = useWatch({ control, name: 'ticket_price_currency' });
    const getMaximumValue = (currencyCode: string) => {
        const exchangeRate = supportedCurrencies[currencyCode]?.eur_to_currency_rate;

        if (!Number.isFinite(exchangeRate)) return;

        return Math.round(BASE_CAP_EUR * exchangeRate * 100) / 100;
    };

    useUpdateEffect(() => {
        if (faceValueCurrency) {
            trigger('face_value');
        }
    }, [faceValueCurrency, trigger]);

    useUpdateEffect(() => {
        if (ticketPriceCurrency) {
            trigger('ticket_price');
        }
    }, [ticketPriceCurrency, trigger]);

    return (
        <Fragment>
            <hr className="col-span-12 my-1 text-neutral-400" />
            <Controller
                control={control}
                name="face_value"
                rules={{
                    required: t('field_required'),
                    validate: {
                        validNumber: (value) =>
                            Number.isFinite(Number(value)) ||
                            fallbackTranslation(
                                t('invalid_face_value'),
                                'invalid_face_value',
                                'Face value must be a valid number'
                            ),
                        maximumValue: (value) => {
                            const maximumValue = getMaximumValue(faceValueCurrency);

                            return (
                                maximumValue === undefined ||
                                Number(value) <= maximumValue ||
                                fallbackTranslation(
                                    t('face_value_maximum_exceeded', {
                                        maximum: maximumValue,
                                        currency: faceValueCurrency,
                                    }),
                                    'face_value_maximum_exceeded',
                                    `Face value cannot exceed ${maximumValue} ${faceValueCurrency}`
                                )
                            );
                        },
                    },
                    min: {
                        value: 0,
                        message: fallbackTranslation(
                            t('face_value_can_not_be_negative'),
                            'face_value_can_not_be_negative',
                            'Face value can not be negative'
                        ),
                    },
                }}
                render={({ field: { value, onChange, ...field }, fieldState: { error } }) => (
                    <Controller
                        control={control}
                        name="face_value_currency"
                        rules={{
                            required: t('field_required'),
                        }}
                        render={({ field: { value: currency, onChange: onCurrencyChange } }) => (
                            <FloatingInput
                                type="number"
                                min={0}
                                max={getMaximumValue(currency)}
                                step="any"
                                errorMessage={error?.message}
                                label={t('face_value')}
                                onKeyDown={(e) => {
                                    if (!e.ctrlKey && !e.metaKey && /^[eE]$/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                onPaste={(e) => {
                                    if (/[eE]/.test(e.clipboardData.getData('text'))) {
                                        e.preventDefault();
                                    }
                                }}
                                classNames={{
                                    wrapper: 'col-span-12 md:col-span-6',
                                    input: 'ps-2',
                                }}
                                required
                                value={value ?? ''}
                                onChange={(e) => {
                                    if (Number.isNaN(e.target.valueAsNumber)) {
                                        onChange(null);
                                        return;
                                    }
                                    onChange(e.target.valueAsNumber);
                                }}
                                currency={currency}
                                onCurrencyChange={onCurrencyChange}
                                currencies={supportedCurrencies ?? {}}
                                {...field}
                            />
                        )}
                    />
                )}
            />
            <Controller
                control={control}
                name="ticket_price"
                rules={{
                    required: t('field_required'),
                    validate: {
                        validNumber: (value) =>
                            Number.isFinite(Number(value)) ||
                            fallbackTranslation(
                                t('invalid_price'),
                                'invalid_price',
                                'Price must be a valid number'
                            ),
                        maximumValue: (value) => {
                            const maximumValue = getMaximumValue(ticketPriceCurrency);

                            return (
                                maximumValue === undefined ||
                                Number(value) <= maximumValue ||
                                fallbackTranslation(
                                    t('ticket_price_maximum_exceeded', {
                                        maximum: maximumValue,
                                        currency: ticketPriceCurrency,
                                    }),
                                    'ticket_price_maximum_exceeded',
                                    `Ticket price cannot exceed ${maximumValue} ${ticketPriceCurrency}`
                                )
                            );
                        },
                    },
                    min: {
                        value: 0,
                        message: fallbackTranslation(
                            t('price_can_not_be_negative'),
                            'price_can_not_be_negative',
                            'Price can not be negative'
                        ),
                    },
                }}
                render={({ field: { value, onChange, ...field }, fieldState: { error } }) => (
                    <Controller
                        control={control}
                        name="ticket_price_currency"
                        rules={{
                            required: t('field_required'),
                        }}
                        render={({ field: { value: currency, onChange: onCurrencyChange } }) => (
                            <FloatingInput
                                type="number"
                                min={0}
                                max={getMaximumValue(currency)}
                                step="any"
                                errorMessage={error?.message}
                                label={t('ticket_price')}
                                onKeyDown={(e) => {
                                    if (!e.ctrlKey && !e.metaKey && /^[eE]$/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                onPaste={(e) => {
                                    if (/[eE]/.test(e.clipboardData.getData('text'))) {
                                        e.preventDefault();
                                    }
                                }}
                                classNames={{
                                    wrapper: 'col-span-12 md:col-span-6',
                                    inputGroup: 'has-disabled:bg-zinc-100 has-disabled:opacity-100',
                                    input: 'ps-2',
                                }}
                                required
                                value={value ?? ''}
                                onChange={(e) => {
                                    if (Number.isNaN(e.target.valueAsNumber)) {
                                        onChange(null);
                                        return;
                                    }
                                    onChange(e.target.valueAsNumber);
                                }}
                                disabledCurrency={!!user?.seller_per_ticket_currency?.code}
                                currency={currency}
                                onCurrencyChange={onCurrencyChange}
                                currencies={supportedCurrencies ?? {}}
                                {...field}
                            />
                        )}
                    />
                )}
            />
            {!user?.seller_per_ticket_currency?.code && (
                <Controller
                    control={control}
                    name="is_seller_confirmed_ticket_price"
                    rules={{
                        required: t('field_required'),
                    }}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <div className="flex col-span-12 sm:col-span-6 sm:col-start-7">
                            <div className="flex items-start gap-2">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    className="mt-0.5 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 size-4"
                                    checked={value}
                                    onChange={onChange}
                                />
                                <label
                                    htmlFor="terms"
                                    className={cn(
                                        'flex items-center text-gray-600 text-xs md:text-sm',
                                        {
                                            'text-red-600': error,
                                        }
                                    )}
                                >
                                    {t('choose_currency_for_all_your_sells')}
                                    <span className="font-bold text-red-600">*</span>
                                </label>
                            </div>
                        </div>
                    )}
                />
            )}
            <Controller
                control={control}
                name="additional_relevant_information"
                render={({ field: { onChange, value } }) => (
                    <SellTicketMultiSelectOption
                        label={t('additional_info')}
                        value={value}
                        options={additionalInformations}
                        onChange={(payload) =>
                            onChange(
                                additionalInformations.filter((item) =>
                                    payload.map((item) => item.value).includes(item.value)
                                )
                            )
                        }
                        classNames={{
                            wrapper: 'z-50 col-span-12 w-full',
                        }}
                    />
                )}
            />
        </Fragment>
    );
};

export default SellTicketPriceDetails;
