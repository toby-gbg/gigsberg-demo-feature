'use client';

import { FC, Fragment, useEffect } from 'react';
import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import { Controller, useFormContext } from 'react-hook-form';

import { EventDetail } from '@/interfaces/Event';
import { SellForm } from '@/interfaces/Sell';
import { fallbackTranslation, translateOptions } from '@/utils/common';
import { getEventDiffDaysFromNow } from '@/utils/event';
import { convertTicketTypeToId, TicketTypeEnum } from '@/utils/ticketType.util';
import { useMobileAppOptions } from '@/swr/features/orders';
import LISTING_SPLIT_TYPES from '@/constants/sell/listingSplitType';

import FloatingInput from '@/components/FloatingInput';
import FloatingSelect from '@/components/FloatingSelect';

interface Props {
    event: EventDetail;
}
const SellTicketMainDetails: FC<Props> = ({ event }) => {
    const t = useTranslations();
    const splitTypes = translateOptions(t, LISTING_SPLIT_TYPES);

    const { data, isValidating: isFetching } = useMobileAppOptions(event.countryId);

    let ticketTypes = event.ticketTypes.map(({ name, id }) => ({
        label: t(name),
        value: id,
    }));
    // filter out ticket type options if the event is coming within a week/day
    const diffDays = getEventDiffDaysFromNow(event);
    ticketTypes = ticketTypes.filter((item) => {
        if (item.value === convertTicketTypeToId(TicketTypeEnum.PAPER_TICKET)) {
            return diffDays >= 7;
        }
        if (item.value === convertTicketTypeToId(TicketTypeEnum.E_TICKET)) {
            return diffDays >= 1;
        }
        return true;
    });

    const {
        control,
        watch,
        setValue,
        formState: { touchedFields },
    } = useFormContext<SellForm>();
    const seatFrom = watch('seat_from');
    const quantity = watch('quantity');
    const ticketType = watch('ticket_type');
    const isMobileTicket =
        String(ticketType) === String(convertTicketTypeToId(TicketTypeEnum.MOBILE_TICKET));

    useEffect(() => {
        if (!touchedFields.presented_quantity) {
            setValue(
                'presented_quantity',
                touchedFields.quantity && quantity ? Math.min(quantity, 12) : 12
            );
        }
    }, [quantity, setValue, touchedFields.quantity, touchedFields.presented_quantity]);

    // Calculate and auto fill seat_to
    useEffect(() => {
        if (seatFrom && quantity) {
            setValue('seat_to', seatFrom + quantity - 1);
        } else {
            setValue('seat_to', null);
        }
    }, [seatFrom, quantity]);

    return (
        <Fragment>
            <div className="col-span-12 space-y-1.5 md:col-span-6">
                <Controller
                    control={control}
                    name="quantity"
                    rules={{
                        required: t('field_required'),
                        deps: ['presented_quantity'],
                        min: { value: 1, message: t('field_required') },
                        max: {
                            value: 70,
                            message: fallbackTranslation(
                                t('listing_quantity_limit'),
                                'listing_quantity_limit',
                                'Ticket quantity cannot exceed 70'
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
                    render={({ field: { value, onChange, ...field }, fieldState: { error } }) => (
                        <FloatingInput
                            label={t('sell_tickets_quantity_question')}
                            type="number"
                            errorMessage={error?.message}
                            required
                            classNames={{
                                inputGroup: 'border-none',
                            }}
                            min={1}
                            max={70}
                            value={String(value)}
                            onKeyDown={(e) => {
                                // Input number is integer and larger than 0
                                if (['-', '.', 'e', 'E'].includes(e.key)) e.preventDefault();
                            }}
                            onChange={(e) => {
                                // Distinguish entered quantity from the initial form default.
                                field.onBlur();
                                if (e.target.value && e.target.value !== '0') {
                                    onChange(e.target.valueAsNumber);
                                } else {
                                    onChange('');
                                }
                            }}
                            {...field}
                        />
                    )}
                />
                <p className="text-wrap wrap-break-word text-muted text-xs">
                    {t('seat_consecutiveness_info')}
                </p>
            </div>

            <div className="col-span-12 space-y-1.5 md:col-span-6">
                <Controller
                    control={control}
                    name="presented_quantity"
                    rules={{
                        required: t('field_required'),
                        validate: (value) =>
                            !quantity ||
                            Number(value) <= Number(quantity) ||
                            fallbackTranslation(
                                t('presented_quantity_exceeds_quantity'),
                                'presented_quantity_exceeds_quantity',
                                'Presented quantity cannot exceed listing quantity'
                            ),
                    }}
                    render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
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
                            value={value}
                            onChange={(value) => {
                                // Keep the manual-selection flag in form state across step changes.
                                onBlur();
                                onChange(value);
                            }}
                            errorMessage={error?.message}
                            isRequired
                            isHideSearchInput
                            classNames={{
                                trigger: 'border-none',
                            }}
                        />
                    )}
                />

                <p className="text-muted text-xs">
                    {fallbackTranslation(
                        t('presented_quantity_info'),
                        'presented_quantity_info',
                        'Maximum tickets shown to buyers. Set to 5: buyers see “5 left” until fewer remain (e.g. “4 left”).'
                    )}
                </p>
            </div>

            <div
                className={classNames('col-span-12 md:col-span-6', {
                    'grid grid-cols-2 gap-2': isMobileTicket,
                })}
            >
                <Controller
                    control={control}
                    name="ticket_type"
                    rules={{
                        required: t('field_required'),
                    }}
                    render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <FloatingSelect
                            label={t('ticket_type')}
                            options={ticketTypes}
                            value={value}
                            onChange={(item) => onChange(item)}
                            errorMessage={error?.message}
                            isRequired
                            classNames={{ trigger: 'border-none' }}
                        />
                    )}
                />

                {isMobileTicket ? (
                    <Controller
                        control={control}
                        name="mobile_ticket_app_id"
                        rules={{
                            required: t('field_required'),
                        }}
                        render={({ field: { value, onChange }, fieldState: { error } }) => (
                            <FloatingSelect
                                label={t('mobile_app')}
                                options={
                                    data?.rows.map((item) => ({
                                        value: item.id.toString(),
                                        label: item.name,
                                    })) || []
                                }
                                value={value}
                                onChange={(item) => onChange(item)}
                                errorMessage={error?.message}
                                isLoading={isFetching}
                                isRequired
                            />
                        )}
                    />
                ) : null}
            </div>

            <Controller
                control={control}
                name="split_type"
                rules={{ required: t('field_required') }}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <FloatingSelect
                        label={t('split_type')}
                        options={splitTypes}
                        value={value}
                        onChange={(item) => onChange(item)}
                        errorMessage={error?.message}
                        isRequired
                        classNames={{
                            wrapper: 'col-span-12 md:col-span-6',
                            trigger: 'border-none',
                        }}
                    />
                )}
            />

            <Controller
                control={control}
                name="seat_from"
                render={({ fieldState: { error }, field: { onChange, value } }) => (
                    <FloatingInput
                        label={fallbackTranslation(t('seat_start'), 'seat_start', 'Seat Start')}
                        type="number"
                        errorMessage={error?.message}
                        classNames={{
                            wrapper: 'col-span-12 md:col-span-6',
                        }}
                        min={1}
                        onKeyDown={(e) => {
                            // Input number is integer and larger than 0
                            if (e.key === '-' || e.key === '.') e.preventDefault();
                        }}
                        onChange={(e) => {
                            if (e.target.value && e.target.value !== '0') {
                                onChange(parseInt(e.target.value));
                            } else {
                                onChange('');
                            }
                        }}
                        // placeholder="1"
                        value={value ?? ''}
                    />
                )}
            />

            <Controller
                control={control}
                name="seat_to"
                render={({ fieldState: { error }, field: { onChange, value } }) => {
                    return (
                        <FloatingInput
                            label={fallbackTranslation(t('seat_end'), 'seat_end', 'Seat End')}
                            type="number"
                            errorMessage={error?.message}
                            classNames={{
                                wrapper: 'col-span-12 md:col-span-6',
                            }}
                            onChange={onChange}
                            min={2}
                            readOnly
                            // placeholder="5"
                            value={value ?? ''}
                        />
                    );
                }}
            />
        </Fragment>
    );
};

export default SellTicketMainDetails;
