'use client';

import { Fragment, useEffect, useMemo } from 'react';
import { format, parse } from 'date-fns';
import { useLocale, useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { useUpdateEffect } from 'react-use';
import { KeyedMutator } from 'swr';

import { C } from '@/interfaces/Currency';
import { AccountSettingListing, ListingUpdate } from '@/interfaces/Listing';
import MobileTicketApp from '@/interfaces/MobileTicketApp';
import { fallbackTranslation, getTranslation, translateOptions } from '@/utils/common';
import { getEventDiffDaysFromNow, getTranslatedEventName } from '@/utils/event';
import ListingMapper from '@/utils/mappers/listing/listing.mapper';
import { TicketTypeEnum } from '@/utils/ticketType.util';
import { useLazyGetEventDetailQuery } from '@/swr/features/events';
import { useUpdateListingMutation } from '@/swr/features/listings';
import { AccountListingsPage } from '@/swr/types/listings';
import { BASE_CAP_EUR } from '@/constants/currencies';
import { DATE_LOCALES } from '@/constants/locales';
import LISTING_SPLIT_TYPES from '@/constants/sell/listingSplitType';
import { CITY_KEY_PREFIX, COUNTRY_KEY_PREFIX } from '@/constants/translation';

import useTicketTypes from '@/hooks/useTicketType';

import FallbackImage from '@/components/FallbackImage';
import FloatingInput from '@/components/FloatingInput';
import FloatingSelect from '@/components/FloatingSelect';
import { Button } from '@/components/ui/Button';
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Dialog';
import { toast } from '@/components/ui/Toast';

import { $editListing, $editListingModal } from '../_stores';

interface Props {
    mobileTicketApp: MobileTicketApp[];
    isOpen: boolean;
    listing: AccountSettingListing | null;
    mutate: KeyedMutator<AccountListingsPage[]>;
    currencies: C;
}

export default function AccountSettingsEditListingModal({
    mobileTicketApp,
    isOpen,
    listing,
    mutate,
    currencies,
}: Props) {
    const t = useTranslations();
    const locale = useLocale();

    const splitTypes = translateOptions(t, LISTING_SPLIT_TYPES);
    const getMaximumValue = (currencyCode: string) => {
        const exchangeRate = currencies[currencyCode]?.eur_to_currency_rate;

        if (!Number.isFinite(exchangeRate)) return;

        return Math.round(BASE_CAP_EUR * exchangeRate * 100) / 100;
    };

    useUpdateEffect(() => {
        if (!isOpen || !listing) return;

        reset(ListingMapper.toEditForm(listing));
        fetchEventDetail({ eventId: listing.eventId.toString() });
    }, [isOpen, listing]);

    const seatingPlanCategories = listing?.seatingPlanCategories || [];
    const {
        trigger: fetchEventDetail,
        isMutating: isFetchingEventDetail,
        data: eventDetail,
    } = useLazyGetEventDetailQuery();
    const diffDays = eventDetail ? getEventDiffDaysFromNow(eventDetail) : 0;

    const ticketTypes = useTicketTypes(eventDetail?.ticketTypes);
    const checkIsValidTicketType = (ticketValue: TicketTypeEnum) => {
        if (ticketValue === TicketTypeEnum.PAPER_TICKET) {
            return diffDays >= 7;
        }
        if (ticketValue === TicketTypeEnum.E_TICKET) {
            return diffDays >= 1;
        }
        return true;
    };

    const {
        control,
        handleSubmit,
        reset,
        formState: { isDirty },
        watch,
        setValue,
        clearErrors,
    } = useForm<ListingUpdate>({
        mode: 'onChange',
        defaultValues: { currency: 'EUR' },
        values: listing ? ListingMapper.toEditForm(listing) : undefined,
    });

    // eslint-disable-next-line react-hooks/incompatible-library
    const categoryId = watch('category_id');

    const blocks = useMemo(() => {
        return (
            seatingPlanCategories
                .find((c) => String(c.id) === categoryId)
                ?.blocks?.split(',')
                .map((item) => ({
                    label: item,
                    value: item,
                })) || []
        );
    }, [categoryId]);

    const ticketTypeOptions = useMemo(
        () => ticketTypes.filter((item) => checkIsValidTicketType(item.value)),
        [ticketTypes, diffDays]
    );

    const {
        trigger: mutateAsync,
        isMutating: isLoading,
        error,
    } = useUpdateListingMutation({
        onSuccess: () => {
            toast.add({ title: t('success'), type: 'success' });
            mutate();
        },
        onError: (error) => {
            toast.add({ title: t(error.data.errorKey), type: 'error' });
        },
    });

    const isSuccess = !error;

    const onSubmit = handleSubmit(
        async ({ currency, quantity: _quantity, ticketsRemaining, presentedQuantity, ...data }) => {
            mutateAsync({
                id: listing?.id,
                ...data,
                currency_id: currencies?.[currency!]?.id,
                ticketsRemaining,
                ...(presentedQuantity != null && {
                    presentedQuantity,
                }),
            });
        }
    );

    useUpdateEffect(() => {
        if (!isLoading && isSuccess) {
            $editListing.set(null);
            $editListingModal.set(false);
        }
    }, [isLoading, isSuccess]);

    // Auto-compute seat_to (Seat End) based on seat_from + quantity - 1
    const seatFrom = watch('seat_start');
    const quantity = watch('ticketsRemaining');

    useEffect(() => {
        const hasSeatFrom = !!seatFrom;
        const hasQuantity = !!quantity;

        if (hasSeatFrom && hasQuantity) {
            const nFrom = Number(seatFrom);
            const nQty = Number(quantity);
            if (!Number.isNaN(nFrom) && !Number.isNaN(nQty)) {
                const computed = nFrom + nQty - 1;
                setValue('seat_end', computed.toString(), {
                    shouldValidate: true,
                    shouldDirty: true,
                });
                clearErrors?.('seat_end');
                return;
            }
        }
        // clear when missing dependencies or invalid
        setValue('seat_end', '', {
            shouldValidate: false,
        });
    }, [seatFrom, quantity]);

    const translatedCity = getTranslation(t, listing?.cityName, CITY_KEY_PREFIX);
    const translatedCountry = getTranslation(t, listing?.countryName, COUNTRY_KEY_PREFIX);
    if (!listing) return null;
    const { image } = listing;

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    $editListing.set(null);
                    if (isDirty) reset();
                }
                $editListingModal.set(isOpen);
            }}
        >
            <DialogContent classNames={{ popup: 'max-w-lg px-0', portal: 'z-99999' }}>
                <DialogHeader className="px-3 md:px-4 pb-2">
                    <DialogTitle>{t('edit_listing')}</DialogTitle>
                </DialogHeader>

                <DialogBody className="pb-0 pt-0 pr-3 pl-3 md:pl-4 text-black max-h-[80vh] overflow-x-hidden overflow-y-auto overscroll-contain">
                    <form onSubmit={onSubmit} noValidate>
                        <div className="flex gap-x-4">
                            {image && (
                                <div className="hidden md:block w-45 h-29.5 shrink-0">
                                    <FallbackImage
                                        alt="Event image"
                                        className="rounded-xl w-45 h-29.5 object-cover"
                                        height={118}
                                        width={180}
                                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/performers/${image}`}
                                    />
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold text-lg">
                                    {listing && getTranslatedEventName(t, listing)}
                                </h3>
                                <p className="text-sm">
                                    {listing &&
                                        format(
                                            parse(
                                                `${listing.eventDate} ${listing.eventTime}`,
                                                'yyyy-MM-dd HH:mm:ss',
                                                new Date()
                                            ),
                                            'PPPPp',
                                            {
                                                locale:
                                                    DATE_LOCALES[locale] ?? DATE_LOCALES['en-GB'],
                                            }
                                        )}
                                </p>
                                <p className="text-sm">{listing?.venueName}</p>
                                <p className="text-sm">{`${translatedCity} - ${translatedCountry}`}</p>
                            </div>
                        </div>

                        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 mt-4">
                            <Controller
                                control={control}
                                name="ticketsRemaining"
                                rules={{
                                    required: t('field_required'),
                                    deps: ['presentedQuantity'],
                                    min: {
                                        value: 0,
                                        message: fallbackTranslation(
                                            t('invalid_tickets_remaining'),
                                            'invalid_tickets_remaining',
                                            'Tickets remaining cannot be negative'
                                        ),
                                    },
                                    max: {
                                        value: 70,
                                        message: fallbackTranslation(
                                            t('listing_quantity_limit'),
                                            'listing_quantity_limit',
                                            'Tickets remaining cannot exceed 70'
                                        ),
                                    },
                                    validate: (value) =>
                                        Number.isInteger(Number(value)) ||
                                        fallbackTranslation(
                                            t('quantity_must_be_integer'),
                                            'quantity_must_be_integer',
                                            'Ticket quantity must be a whole number'
                                        ),
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <FloatingInput
                                        {...field}
                                        label={t('tickets_remaining')}
                                        type="number"
                                        required
                                        min={0}
                                        max={70}
                                        step={1}
                                        errorMessage={error?.message}
                                        classNames={{ wrapper: 'col-span-12 lg:col-span-6' }}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name="presentedQuantity"
                                rules={{
                                    required: t('field_required'),
                                    validate: {
                                        range: (value) =>
                                            value == null ||
                                            (Number.isInteger(value) &&
                                                value >= 1 &&
                                                value <= 12) ||
                                            fallbackTranslation(
                                                t('invalid_presented_quantity'),
                                                'invalid_presented_quantity',
                                                'Presented quantity must be between 1 and 12'
                                            ),
                                        quantity: (value) =>
                                            !quantity ||
                                            Number(value) <= Number(quantity) ||
                                            fallbackTranslation(
                                                t('presented_quantity_exceeds_quantity'),
                                                'presented_quantity_exceeds_quantity',
                                                'Presented quantity cannot exceed listing quantity'
                                            ),
                                    },
                                }}
                                render={({ field: { value, onChange }, fieldState: { error } }) => (
                                    <FloatingSelect
                                        label={fallbackTranslation(
                                            t('presented_quantity'),
                                            'presented_quantity',
                                            'Presented quantity'
                                        )}
                                        options={Array.from({ length: 12 }, (_, index) => ({
                                            label: String(index + 1),
                                            value: index + 1,
                                        }))}
                                        value={value ?? undefined}
                                        onChange={onChange}
                                        isHideSearchInput
                                        isRequired
                                        errorMessage={error?.message}
                                        classNames={{ wrapper: 'col-span-12 lg:col-span-6' }}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name="split_type"
                                rules={{ required: t('field_required') }}
                                render={({ field: { value, onChange }, fieldState: { error } }) => (
                                    <FloatingSelect
                                        label={t('split_type')}
                                        options={splitTypes}
                                        classNames={{ wrapper: 'col-span-12' }}
                                        value={value}
                                        onChange={onChange}
                                        errorMessage={error?.message}
                                        isRequired
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name="ticket_type"
                                rules={{
                                    required: t('field_required'),
                                }}
                                render={({ field: { value, onChange }, fieldState: { error } }) => (
                                    <Fragment>
                                        <FloatingSelect
                                            isLoading={isFetchingEventDetail}
                                            isDisabled={isFetchingEventDetail}
                                            classNames={{
                                                wrapper:
                                                    value === TicketTypeEnum.MOBILE_TICKET
                                                        ? 'col-span-12 lg:col-span-6'
                                                        : 'col-span-12',
                                            }}
                                            options={ticketTypeOptions}
                                            label={t('ticket_type')}
                                            errorMessage={error?.message}
                                            value={value}
                                            onChange={onChange}
                                            isRequired
                                        />
                                        {value === TicketTypeEnum.MOBILE_TICKET && (
                                            <Controller
                                                control={control}
                                                name="mobile_ticket_app_id"
                                                rules={{
                                                    required: t('field_required'),
                                                }}
                                                render={({
                                                    field: { value, onChange },
                                                    fieldState: { error },
                                                }) => (
                                                    <FloatingSelect
                                                        classNames={{
                                                            wrapper: 'col-span-12 lg:col-span-6',
                                                        }}
                                                        options={mobileTicketApp.map((item) => ({
                                                            value: String(item.id),
                                                            label: item.name,
                                                        }))}
                                                        label="Mobile Application"
                                                        errorMessage={error?.message}
                                                        value={value ?? undefined}
                                                        onChange={onChange}
                                                        isRequired
                                                    />
                                                )}
                                            />
                                        )}
                                    </Fragment>
                                )}
                            />

                            <hr className="col-span-12 text-zinc-300" />
                            <h2 className="col-span-12 text-lg">{t('seating_details')}</h2>
                            <Controller
                                control={control}
                                name="category_id"
                                rules={{
                                    required: t('field_required'),
                                }}
                                render={({ field: { value, onChange }, fieldState: { error } }) => (
                                    <FloatingSelect
                                        classNames={{ wrapper: 'col-span-12' }}
                                        options={
                                            listing?.seatingPlanCategories.map((item) => ({
                                                value: String(item.id),
                                                label: item.name,
                                            })) ?? []
                                        }
                                        label={t('category')}
                                        errorMessage={error?.message}
                                        value={value ?? undefined}
                                        onChange={onChange}
                                        isRequired
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name="block"
                                render={({ field: { value, onChange }, fieldState: { error } }) => (
                                    <FloatingSelect
                                        label={t('block')}
                                        options={blocks}
                                        classNames={{ wrapper: 'col-span-12 lg:col-span-6' }}
                                        value={value}
                                        onChange={(nextValue) => onChange(nextValue ?? '')}
                                        errorMessage={error?.message}
                                        isClearable
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name="row"
                                render={({ field, fieldState: { error } }) => (
                                    <FloatingInput
                                        {...field}
                                        label={t('row')}
                                        errorMessage={error?.message}
                                        classNames={{ wrapper: 'col-span-12 lg:col-span-6' }}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name="seat_start"
                                rules={{
                                    validate: (v) => {
                                        if (v === undefined || v === null || v === '') return true;
                                        const n = Number(v);
                                        if (Number.isNaN(n)) return 'Invalid seat start';
                                        if (n < 1) return 'Seat start must be at least 1';
                                        return true;
                                    },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <FloatingInput
                                        {...field}
                                        label={fallbackTranslation(
                                            t('seat_start'),
                                            'seat_start',
                                            'Seat Start'
                                        )}
                                        type="number"
                                        min={1}
                                        errorMessage={error?.message}
                                        classNames={{ wrapper: 'col-span-12 lg:col-span-6' }}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name="seat_end"
                                // rules={{
                                //     required: t('field_required'),
                                // }}
                                render={({ field, fieldState: { error } }) => (
                                    <FloatingInput
                                        {...field}
                                        label={fallbackTranslation(
                                            t('seat_end'),
                                            'seat_end',
                                            'Seat End'
                                        )}
                                        disabled
                                        errorMessage={error?.message}
                                        classNames={{ wrapper: 'col-span-12 lg:col-span-6' }}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name="currency"
                                render={({ field: { value: currency = 'EUR', onChange } }) => (
                                    <Controller
                                        control={control}
                                        name="price"
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
                                                    const maximumValue = getMaximumValue(currency);

                                                    return (
                                                        maximumValue === undefined ||
                                                        Number(value) <= maximumValue ||
                                                        fallbackTranslation(
                                                            t('price_maximum_exceeded', {
                                                                maximum: maximumValue,
                                                                currency,
                                                            }),
                                                            'price_maximum_exceeded',
                                                            `Price cannot exceed ${maximumValue} ${currency}`
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
                                        render={({ field, fieldState: { error } }) => (
                                            <FloatingInput
                                                {...field}
                                                label={t('price')}
                                                type="number"
                                                min={0}
                                                max={getMaximumValue(currency)}
                                                step="any"
                                                onKeyDown={(e) => {
                                                    if (
                                                        !e.ctrlKey &&
                                                        !e.metaKey &&
                                                        /^[eE]$/.test(e.key)
                                                    ) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onPaste={(e) => {
                                                    if (
                                                        /[eE]/.test(e.clipboardData.getData('text'))
                                                    ) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                required
                                                errorMessage={error?.message}
                                                currency={currency}
                                                onCurrencyChange={onChange}
                                                disabledCurrency
                                                classNames={{ wrapper: 'col-span-12' }}
                                                currencies={currencies}
                                            />
                                        )}
                                    />
                                )}
                            />
                            <Button
                                disabled={isFetchingEventDetail || isLoading}
                                isLoading={isLoading}
                                type="submit"
                                className="col-span-12 bg-gradient hover:opacity-90 min-w-24 h-11 text-on-main text-lg"
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
