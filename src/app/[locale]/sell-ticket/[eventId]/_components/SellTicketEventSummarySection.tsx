'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { EventDetail } from '@/interfaces/Event';
import { SellForm } from '@/interfaces/Sell';
import { formatPrice } from '@/utils/currency.util';

import FallbackImage from '@/components/FallbackImage';

interface Props {
    event: EventDetail;
    currencyCode?: string;
}

export default function SellTicketEventSummarySection({ event, currencyCode = 'USD' }: Props) {
    const t = useTranslations();
    const locale = useLocale();
    const { watch } = useFormContext<SellForm>();

    const categories = event?.seatingPlanCategories || [];
    const category = categories?.find((c) => String(c.id) === watch('category')) || { name: '_' };
    const ticketType =
        event.ticketTypes?.find((t) => t.id === Number(watch('ticket_type')))?.name || '';

    //WLB-2518 - Consolidate ticket fees formula:
    //1. "Proceeds per ticket" is the amount of money the seller get per ticket. Formula: pricePerTicket * (10/11)
    //2. Calculate total proceeds by multiplying single proceeds amount with quantity
    //3. Then we calculate total price
    //4. Seller fee = total price - total proceeds
    const quantity = Number(watch('quantity'));
    const pricePerTicket = Number(watch('ticket_price'));
    //Round to 2nd decimal point
    const proceedsPerTicket = Number((pricePerTicket * (10 / 11)).toFixed(2));
    const totalProceeds = Number((proceedsPerTicket * quantity).toFixed(2));
    const totalPrice = quantity * pricePerTicket;
    const totalSellerFee = totalPrice - totalProceeds;

    const canShowPricePerTicket = !isNaN(pricePerTicket);

    return (
        <div className="bg-white shadow-md rounded-lg">
            <h3 className="bg-gradient px-4 py-2 rounded-t-lg font-semibold text-on-main text-lg">
                {t('summary')}
            </h3>
            {event.performerImage && (
                <div className="relative">
                    <FallbackImage
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/performers/${event.performerImage}`}
                        alt="Artist"
                        height={0}
                        width={80}
                        layout="responsive"
                        className="w-full object-cover"
                        priority
                        loading={undefined}
                        fallbackLogo={false}
                    />
                </div>
            )}
            <div className="p-6">
                <h4 className="mb-3 text-blue-600 text-sm underline">{t(ticketType)}</h4>
                <div className="gap-4 grid grid-cols-2 mb-6">
                    <div>
                        <p className="text-gray-600 text-sm">{t('number_of_tickets')}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 text-sm text-right">
                            {watch('quantity')}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">{t('category')}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 text-sm text-right">
                            {category?.name ?? '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">{t('block')}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 text-sm text-right">
                            {watch('block') ?? '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">{t('row')}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 text-sm text-right">
                            {watch('row') ?? '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">{t('seats')}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 text-sm text-right">
                            {watch('seat_from')} - {watch('seat_to')}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">{t('face_value')}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 text-sm text-right">
                            {watch('face_value')
                                ? formatPrice(
                                      watch('face_value'),
                                      locale,
                                      watch('face_value_currency') || currencyCode
                                  )
                                : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">{t('price_per_ticket')}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 text-sm text-right">
                            {canShowPricePerTicket
                                ? formatPrice(
                                      pricePerTicket,
                                      locale,
                                      watch('ticket_price_currency') || currencyCode
                                  )
                                : '-'}
                        </p>
                    </div>
                </div>
                <hr />
                <div className="gap-4 grid grid-cols-2 mt-6">
                    <div>
                        <p className="text-gray-600 text-sm">{t('website_price')}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 text-sm text-right">
                            {canShowPricePerTicket
                                ? formatPrice(
                                      pricePerTicket,
                                      locale,
                                      watch('ticket_price_currency') || currencyCode
                                  )
                                : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">{t('seller_fee')}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 text-sm text-right">
                            {canShowPricePerTicket
                                ? formatPrice(
                                      totalSellerFee,
                                      locale,
                                      watch('ticket_price_currency') || currencyCode
                                  )
                                : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">
                            {t('you_will_receive')}{' '}
                            <span className="font-semibold text-primary">({t('per_ticket')})</span>
                        </p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 text-sm text-right">
                            {canShowPricePerTicket
                                ? formatPrice(
                                      proceedsPerTicket,
                                      locale,
                                      watch('ticket_price_currency') || currencyCode
                                  )
                                : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">{t('total_procees')}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 text-sm text-right">
                            {pricePerTicket && quantity
                                ? formatPrice(
                                      totalProceeds,
                                      locale,
                                      watch('ticket_price_currency') || currencyCode
                                  )
                                : '-'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
