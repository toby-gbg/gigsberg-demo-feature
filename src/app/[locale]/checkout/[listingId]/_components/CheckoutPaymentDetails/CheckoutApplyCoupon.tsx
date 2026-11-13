import { Fragment, useState } from 'react';
import { AlertCircle, Info, Loader2, Ticket, X } from 'lucide-react';
import { DateTime } from 'luxon';
import { useLocale, useTranslations } from 'next-intl';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useUpdateEffect } from 'react-use';

import { CheckoutStep } from '@/interfaces/Checkout';
import { $isApplyingCoupon } from '@/stores/checkout';
import { formatPrice } from '@/utils/currency.util';
import { useGetCouponQuery } from '@/swr/features/checkout';

import { useUser } from '@/providers/UserProvider';
import useCookie from '@/hooks/useCookie';
import useIntlRouter from '@/hooks/useIntlRouter';

import { Button } from '@/components/ui/Button';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from '@/components/ui/InputGroup';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';

import { useCheckoutCoupon } from '../../_providers/CheckoutCouponProvider';
import { useCheckoutData } from '../../_providers/CheckoutDataProvider';
import { useCheckoutPayment } from '../../_providers/CheckoutPaymentProvider';

interface Props {
    currencyCode: string;
}

export default function CheckoutApplyCoupon({ currencyCode = 'USD' }: Props) {
    const t = useTranslations();
    const locale = useLocale();
    const router = useIntlRouter();
    const { existsCookie, deleteCookie } = useCookie('gc');

    const [isOpenCoupon, setIsOpenCoupon] = useState(false);

    const { trigger: getCouponTrigger, data: couponData } = useGetCouponQuery({
        onSuccess: (coupon) => {
            setCouponCode(coupon.code);
            reset();
            if (existsCookie()) deleteCookie();
        },
        onError: (payload) => {
            setError('coupon_code', {
                message: t(payload.data.errorKey),
            });
        },
    });

    const user = useUser();

    // Coupon provider
    const { couponCode, setCouponCode } = useCheckoutCoupon();

    // Payment provider
    const { currentStep, isSubmittingInformation } = useCheckoutPayment();

    // Data provider
    const { data } = useCheckoutData();

    // Original total amount before applying coupon
    const totalAmount = Number(((data?.totalPrice || 0) + (data?.couponAmount || 0)).toFixed(2));
    const vat = data?.vat ?? 0;

    const couponFeeParams = { vat };

    const {
        control,
        handleSubmit,
        reset,
        setError,
        formState: { isSubmitting, errors },
    } = useForm<{ coupon_code: string }>({
        defaultValues: { coupon_code: '' },
        mode: 'onChange',
    });
    const enteredCouponCode = useWatch({ control, name: 'coupon_code' });

    const openLoginModal = (email?: string) => {
        if (email) sessionStorage.setItem('storage-email', email);
        // WLB-3503: login falls back to the homepage when this page is not passed along.
        const returnPath = `${window.location.pathname}${window.location.search}`;
        router.push(`/login?redirectUrl=${encodeURIComponent(returnPath)}`);
    };

    const onSubmit = handleSubmit((data) => {
        getCouponTrigger({
            couponCode: data.coupon_code,
            currencyCode,
            totalAmount,
            ...couponFeeParams,
        });
    });

    const onRemove = () => {
        reset();
        setCouponCode('');
    };

    const openCouponInput = () => {
        if (!user) {
            openLoginModal();
            return;
        }
        setIsOpenCoupon(true);
    };

    // Normalize coupon input
    const normalizeCouponInput = (value: string) => {
        return value
            .toUpperCase() // Uppercase Normalization
            .replace(/\s+/g, '') // No Spaces Allowed
            .replace(/[^A-Z0-9-_]/g, '') // Allowed Special Character
            .slice(0, 35); // Character Limit (Max 35)
    };

    // Re-fetch coupon info when total amount changes
    useUpdateEffect(() => {
        if (!couponCode) return;

        getCouponTrigger({
            couponCode,
            currencyCode,
            totalAmount,
            ...couponFeeParams,
        }).finally(() => $isApplyingCoupon.set(false));
    }, [totalAmount, vat]);

    // Not show if don't have apply any coupon yet in step 2
    if (!couponCode && currentStep !== CheckoutStep.YOUR_INFORMATION) return;

    return (
        <div className="space-y-2 my-2">
            {!isOpenCoupon ? (
                <button
                    className="font-semibold hover:text-main-start text-sm md:text-base underline capitalize transition-colors cursor-pointer"
                    onClick={openCouponInput}
                    disabled={isSubmittingInformation}
                >
                    {t('add_coupon_code')}
                </button>
            ) : (
                <Fragment>
                    {currentStep === CheckoutStep.YOUR_INFORMATION && !couponCode && (
                        <>
                            <button
                                onClick={() => setIsOpenCoupon(false)}
                                className="font-medium text-sm md:text-base underline cursor-pointer"
                                disabled={isSubmittingInformation}
                            >
                                {t('close')}
                            </button>
                            <form onSubmit={onSubmit} className="flex items-center gap-x-2">
                                <Controller
                                    name="coupon_code"
                                    control={control}
                                    render={({ field }) => (
                                        <InputGroup
                                            className="bg-zinc-100 border-none rounded-md w-full min-h-10"
                                            data-disabled={!!couponCode || isSubmitting}
                                        >
                                            <InputGroupInput
                                                name="coupon_code"
                                                type="text"
                                                placeholder={t('enter_coupon_code')}
                                                value={field.value}
                                                onChange={(e) => {
                                                    const normalized = normalizeCouponInput(
                                                        e.target.value
                                                    );
                                                    field.onChange(normalized);
                                                }}
                                                disabled={
                                                    !!couponCode ||
                                                    isSubmitting ||
                                                    isSubmittingInformation
                                                }
                                                className="h-10"
                                            />
                                            {field.value && !couponCode && !isSubmitting && (
                                                <InputGroupAddon
                                                    align="inline-end"
                                                    className="pe-3 h-10"
                                                >
                                                    <InputGroupButton
                                                        aria-label="Clear input"
                                                        onClick={() => field.onChange('')}
                                                        className="size-5 [&_svg:not([class*=size-])]:size-5"
                                                    >
                                                        <X />
                                                    </InputGroupButton>
                                                </InputGroupAddon>
                                            )}
                                        </InputGroup>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-26"
                                    disabled={
                                        !enteredCouponCode ||
                                        enteredCouponCode.length < 3 ||
                                        isSubmitting ||
                                        isSubmittingInformation ||
                                        !!couponCode
                                    }
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        t('apply')
                                    )}
                                </Button>
                            </form>

                            {errors.coupon_code && (
                                <div className="flex gap-1 text-red-500 text-sm">
                                    <AlertCircle size={14} className="mt-1 shrink-0" />
                                    {errors.coupon_code?.message}
                                </div>
                            )}
                        </>
                    )}

                    {couponCode && couponData && (
                        <Fragment>
                            <div className="flex justify-between items-center gap-2 bg-white p-2 md:p-3 border rounded-lg">
                                <div className="place-items-center grid bg-linear-to-br from-white to-main-end p-2 rounded-full">
                                    <Ticket className="text-main-end" size={20} />
                                </div>

                                <div className="grow">
                                    <p className="font-semibold">
                                        {couponData.discount === 'percentage'
                                            ? `${couponData.amount}%`
                                            : formatPrice(
                                                  couponData.original_amount ?? couponData.amount,
                                                  locale,
                                                  couponData.currency_code
                                              )}{' '}
                                        {t('coupon_off')}
                                    </p>
                                    <p className="text-gray-500 text-sm leading-4">
                                        {couponData?.code} &middot; {t('expires_on')}{' '}
                                        {couponData?.to_date &&
                                            DateTime.fromISO(couponData?.to_date)
                                                .setLocale(locale)
                                                .toFormat('LLLL d, yyyy')}
                                    </p>
                                </div>

                                {currentStep === CheckoutStep.YOUR_INFORMATION ? (
                                    <X
                                        className="hover:scale-110 transition-transform cursor-pointer shrink-0"
                                        onClick={isSubmittingInformation ? undefined : onRemove}
                                        size={24}
                                    />
                                ) : (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="text-gray-600 shrink-0" size={20} />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div className="p-1">
                                                <p className="font-semibold">
                                                    {t('coupon_deal_locked')}
                                                </p>
                                                <p>{t('coupon_change_description')}</p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>

                            {/* Show info if coupon currency is different from selected currency */}
                            {couponData &&
                                couponData.discount === 'amount' &&
                                couponData.currency_code !== currencyCode && (
                                    <div className="flex gap-1 text-blue-600 text-sm">
                                        <Info className="mt-1 shrink-0" size={16} />
                                        {t('coupon_code_different_currency')}
                                    </div>
                                )}
                        </Fragment>
                    )}
                </Fragment>
            )}
        </div>
    );
}
