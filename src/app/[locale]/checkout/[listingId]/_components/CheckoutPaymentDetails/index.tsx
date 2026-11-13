'use client';

import { Fragment, ReactNode, useEffect, useState } from 'react';
import { useQueryStates } from '@/nuqs/hooks/useQueryStates';
import { BProgress } from '@bprogress/core';
import { toNumber } from 'lodash-es';
import { useLocale, useTranslations } from 'next-intl';

import { CheckoutStep } from '@/interfaces/Checkout';
import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';
import { formatPrice } from '@/utils/currency.util';
import { TicketTypeEnum } from '@/utils/ticketType.util';

import { useUser } from '@/providers/UserProvider';

import PriceSkeleton from '@/components/skeleton/PriceSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';
import { Switch } from '@/components/ui/Switch';
import WaveFooter from '@/components/WaveFooter';

import { useCheckoutCoupon } from '../../_providers/CheckoutCouponProvider';
import { useCheckoutData } from '../../_providers/CheckoutDataProvider';
import { useCheckoutPayment } from '../../_providers/CheckoutPaymentProvider';
import { checkoutSearchParamsParsers } from '../../_searchParams';
import CheckoutApplyCoupon from './CheckoutApplyCoupon';

const PaymentRow = ({
    label,
    value,
    isFetching,
    labelClassName,
    valueClassName,
    show = true,
}: {
    label: ReactNode;
    value: ReactNode;
    isFetching?: boolean;
    labelClassName?: string;
    valueClassName?: string;
    show?: boolean;
}) => {
    if (!show) return null;
    return (
        <Fragment>
            <div className={cn('text-foreground-600 capitalize', labelClassName)}>{label}</div>
            <div className="rtl:text-left ltr:text-right">
                {isFetching ? (
                    <PriceSkeleton />
                ) : (
                    <span className={cn('font-medium text-foreground-800', valueClassName)}>
                        {value}
                    </span>
                )}
            </div>
        </Fragment>
    );
};

export default function CheckoutPaymentDetail() {
    const t = useTranslations();
    const locale = useLocale();
    const user = useUser();

    const [searchParams] = useQueryStates(checkoutSearchParamsParsers);
    const quantity = searchParams.quantity;

    // Provider
    const { couponCode } = useCheckoutCoupon();
    const { data, currencyCode, isFetching: isFetchingData } = useCheckoutData();

    const {
        currentStep,
        donateToSpecialOlympics,
        setDonateToSpecialOlympics,
        useBalance,
        setUseBalance,
        finalPrice,
        finalPriceOrigin,
        balanceUsed,
        isSubmittingInformation,
    } = useCheckoutPayment();

    const [syncedCurrency, setSyncedCurrency] = useState(currencyCode);
    const isCurrencySwitching = syncedCurrency !== currencyCode;
    const isFetching = isCurrencySwitching || isFetchingData || false;

    // Extract data
    const {
        price,
        proceedPrice,
        vat,
        bookingFees,
        handlingFees,
        sellerTax = 0,
        couponAmount = 0,
        availableBalance = 0,
        listingCurrencyCode,
        ticketType,
        specialOlympicsPrice,
    } = data;

    const format = (amount: number, code = currencyCode) =>
        formatPrice(amount, locale, code ?? 'USD');

    const ticketPrice = proceedPrice ? proceedPrice : price * toNumber(quantity);
    const totalBookingFees = bookingFees + handlingFees + sellerTax;

    // Payment breakdown structure
    const paymentItems = [
        {
            label: fallbackTranslation(t('ticket_total'), 'ticket_total', 'Ticket Total'),
            value: `${format(ticketPrice / toNumber(quantity))} × ${quantity}`,
            show: true,
        },
        {
            label: fallbackTranslation(t('service_total'), 'service_total', 'Service Total'),
            value: `${format(totalBookingFees / toNumber(quantity))} × ${quantity}`,
            show: true,
        },
        {
            label: t('vat'),
            value:
                ticketType === TicketTypeEnum.PAPER_TICKET
                    ? format(vat)
                    : `${format(vat / toNumber(quantity))} × ${quantity}`,
            show: vat > 0,
        },
        {
            label: t('round_up_price_donate'),
            value: `+${format(specialOlympicsPrice)}`,
            show: donateToSpecialOlympics && currentStep !== CheckoutStep.YOUR_INFORMATION,
        },
        {
            label: t('balance_used'),
            value: `-${format(balanceUsed)}`,
            labelClassName: 'text-green-600',
            valueClassName: 'text-green-600',
            show: !!user && balanceUsed > 0 && currentStep !== CheckoutStep.YOUR_INFORMATION,
        },
        {
            label: t('coupon'),
            value: `-${format(couponAmount)}`,
            labelClassName: 'text-green-600',
            valueClassName: 'text-green-600',
            show: !!couponCode && couponAmount > 0,
        },
    ];

    useEffect(() => {
        if (!isFetching) BProgress.done();
    }, [isFetching]);

    useEffect(() => {
        if (currencyCode !== syncedCurrency) setSyncedCurrency(currencyCode);
    }, [data]); // ONLY DATA is intentional

    return (
        <div className="md:shadow-xs -mx-4 md:mx-0 md:border border-border md:rounded-2xl overflow-hidden">
            <div className="px-4">
                <p className="pt-4 font-semibold text-xl">{t('payment_details')}</p>

                <div className="gap-2 grid grid-cols-[1fr_128px] md:grid-cols-[1fr_146px] mt-4 text-sm md:text-base">
                    {paymentItems.map((item, index) => (
                        <PaymentRow key={index} {...item} isFetching={isFetching} />
                    ))}

                    {/* Special Olympic Donate */}
                    {specialOlympicsPrice > 0 && currentStep === CheckoutStep.YOUR_INFORMATION && (
                        <Fragment>
                            <div className="text-foreground-600 capitalize">
                                {t('add')}{' '}
                                {isFetching ? (
                                    <Skeleton className="inline-block -mt-1 rounded-md w-11 h-4 align-middle" />
                                ) : (
                                    format(specialOlympicsPrice)
                                )}{' '}
                                {t('round_up_price_donate')}
                            </div>
                            <div className="flex justify-end items-center -mt-3">
                                <Switch
                                    checked={donateToSpecialOlympics}
                                    onCheckedChange={(e) => setDonateToSpecialOlympics(e)}
                                    disabled={
                                        currentStep !== CheckoutStep.YOUR_INFORMATION ||
                                        isFetching ||
                                        isSubmittingInformation
                                    }
                                />
                            </div>
                        </Fragment>
                    )}

                    {/* User balance */}
                    {user &&
                        availableBalance > 0 &&
                        currentStep === CheckoutStep.YOUR_INFORMATION && (
                            <Fragment>
                                <div className="text-foreground-600 capitalize">
                                    {t('use_balance', {
                                        amount: format(availableBalance),
                                    })}
                                </div>

                                <div className="flex justify-end items-center -mt-1">
                                    <Switch
                                        checked={useBalance}
                                        onCheckedChange={(e) => setUseBalance(e)}
                                        disabled={
                                            currentStep !== CheckoutStep.YOUR_INFORMATION ||
                                            isFetching ||
                                            isSubmittingInformation
                                        }
                                    />
                                </div>
                            </Fragment>
                        )}
                </div>

                {/* Apply Coupon */}
                <CheckoutApplyCoupon currencyCode={currencyCode} />

                <div className="bg-dash-line mt-3 w-full h-px" />

                {/* Total Price */}
                <div className="mt-3 mb-2 border-gray-300">
                    <div className="flex justify-between items-center font-bold text-gray-800 text-lg md:text-xl">
                        <span className="capitalize">
                            {fallbackTranslation(t('total_charge'), 'total_charge', 'Total Charge')}
                        </span>
                        {isFetching ? <PriceSkeleton /> : <span>{format(finalPrice)}</span>}
                    </div>

                    {finalPrice === 0 && (
                        <div className="flex gap-1 text-green-600 text-sm">
                            {t('cover_full_price')}
                        </div>
                    )}
                </div>
            </div>

            {/* Approximate conversion */}
            {listingCurrencyCode !== currencyCode && (
                <WaveFooter>
                    <div className="bg-foreground-100 px-4 pt-5 pb-4 font-medium text-gray-600 text-xs md:text-sm text-center">
                        {t('approximate_conversion')} {listingCurrencyCode}
                        {'. '}
                        {t('you_will_pay')}{' '}
                        {isFetching ? (
                            <Skeleton className="inline-block w-12 h-3 align-middle" />
                        ) : (
                            format(finalPriceOrigin, listingCurrencyCode)
                        )}
                    </div>
                </WaveFooter>
            )}
        </div>
    );
}
