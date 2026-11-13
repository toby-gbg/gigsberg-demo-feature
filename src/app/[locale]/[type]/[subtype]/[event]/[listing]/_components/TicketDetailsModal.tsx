'use client';

import { Fragment, useMemo, useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { useStore } from '@nanostores/react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Info, Users } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useUnmount, useUpdateEffect } from 'react-use';

import { fallbackTranslation, getTranslation, isRTL } from '@/utils/common';
import { formatPrice } from '@/utils/currency.util';
import { getImgsFromMap } from '@/utils/listing.util';
import { isStanding } from '@/utils/listingCard';
import { renderIconByName } from '@/utils/ticketType.util';
import { FTN_AFFILIATE_ID } from '@/constants/affiliates';
import { CAT_KEY_PREFIX } from '@/constants/translation';

import { useListing } from '@/providers/ListingProvider';
import { useSite } from '@/providers/SiteProvider';
import { useSlide } from '@/hooks/useSlide';

import Guarentee from '@/components/Guarentee';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogBody, DialogContent } from '@/components/ui/Dialog';
import { Spinner } from '@/components/ui/Spinner';

import { $ticketDetailModal, $ticketListing } from '../_stores';
import CheckoutButton from './CheckoutButton';
import ListingQuantitySelector from './ListingQuantitySelector';

interface Props {
    currencyCode: string;
}

export default function TicketDetailsModal({ currencyCode = 'USD' }: Props) {
    const t = useTranslations();
    const locale = useLocale();

    // Listing provider
    const { filters, eventDetails, listings, mapUrls, ipCountry } = useListing();
    const { allInclusive } = listings;

    // State
    const [quantity, setQuantity] = useState(0);
    const { config } = useSite().domainInfo || {};

    const isOpen = useStore($ticketDetailModal);
    const listing = useStore($ticketListing);

    // Update quantity select
    useUpdateEffect(() => {
        if (filters.number_of_tickets) {
            setQuantity(filters.number_of_tickets?.[0] || 0);
        } else {
            if (listing && listing.quantity_options && listing.quantity_options.length > 0) {
                setQuantity(listing.quantity_options[0]);
            }
        }
    }, [filters, listing, isOpen]);

    const showFullSellerInfo = useMemo(() => {
        // WLB-1991
        return ipCountry?.code === 'DE' && eventDetails.countryCode === 'DE';
    }, [ipCountry, eventDetails]);

    const isFtnFootballEvent = listing?.affiliate_id === FTN_AFFILIATE_ID;

    const standingSeat = isStanding({
        restrictions: listing?.restrictions || [],
        category: listing?.category_name,
        block: listing?.block,
    });

    listing?.restrictions.some((restriction) =>
        restriction.name.toLowerCase().includes('standing')
    );

    // Image sliders
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, direction: isRTL(locale) ? 'rtl' : 'ltr' },
        []
    );

    const { onNext, onPrev } = useSlide(emblaApi);

    const viewImgs = getImgsFromMap(mapUrls, listing?.category_name, listing?.block);

    useUnmount(() => {
        $ticketDetailModal.set(false);
        $ticketListing.set(null);
    });

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(isOpen) => {
                $ticketDetailModal.set(isOpen);
                if (!isOpen) {
                    setQuantity(filters.number_of_tickets?.[0] as number);
                }
            }}
        >
            <DialogContent classNames={{ popup: 'overflow-hidden p-0' }}>
                <DialogBody className="py-0! overflow-hidden">
                    <div className="relative max-h-[90vh] overflow-y-auto [scrollbar-color:color-mix(in_srgb,var(--foreground)_50%,transparent)_transparent]">
                        {viewImgs.length > 0 && (
                            <div>
                                <div
                                    className="relative overflow-hidden pointer-events-none"
                                    ref={emblaRef}
                                >
                                    <div className="flex">
                                        {viewImgs.map((img, index) => (
                                            <SeatViewImage key={img + index} img={img} />
                                        ))}
                                    </div>
                                </div>

                                {viewImgs.length > 1 && (
                                    <>
                                        <Button
                                            type="button"
                                            className="top-1/2 left-1 z-999 absolute bg-white rounded-full pointer-events-auto"
                                            onClick={onPrev}
                                        >
                                            <ChevronLeft size={20} />
                                        </Button>

                                        <Button
                                            type="button"
                                            className="top-1/2 right-1 z-999 absolute bg-white rounded-full pointer-events-auto"
                                            onClick={onNext}
                                        >
                                            <ChevronRight size={20} />
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                        {listing && (
                            <div className="space-y-4 sm:space-y-6 px-4 pt-4">
                                <div>
                                    {listing?.category_name && (
                                        <h2 className="font-bold text-black sm:text-lg sm:text-left text-center">
                                            {getTranslation(
                                                t,
                                                listing.category_name,
                                                CAT_KEY_PREFIX
                                            )}
                                        </h2>
                                    )}
                                    {listing?.block && (
                                        <p className="text-gray-500 text-sm sm:text-base sm:text-left text-center">
                                            {t('block')} : {listing.block}
                                        </p>
                                    )}
                                    {listing?.row && (
                                        <p className="text-gray-500 text-sm sm:text-base sm:text-left text-center">
                                            {t('row')} : {listing.row}
                                        </p>
                                    )}
                                    {listing?.seat_info && (
                                        <p className="text-gray-500 text-sm sm:text-base sm:text-left text-center">
                                            {t('seat_number')} : {listing.seat_info}
                                        </p>
                                    )}

                                    {showFullSellerInfo ? (
                                        <>
                                            <p className="text-gray-500 sm:text-left text-center">
                                                {t('seller_name')} : {listing.seller_name}
                                            </p>
                                            <p className="text-gray-500 sm:text-left text-center">
                                                {t('seller_address')} : {listing.seller_address}
                                            </p>
                                            {!!listing?.company_number && (
                                                <p className="text-gray-500 sm:text-left text-center">
                                                    {t('company_number ')} :{' '}
                                                    {listing.company_number}
                                                </p>
                                            )}
                                        </>
                                    ) : config?.features?.showSellerName ? (
                                        <>
                                            <p className="text-gray-500 sm:text-left text-center">
                                                {t('seller_name')} : {listing.seller_name}
                                            </p>
                                        </>
                                    ) : null}
                                </div>

                                <div className="flex md:flex-row flex-col justify-center md:justify-between items-center gap-y-5 pt-2 sm:pt-4 border-gray-300 border-t">
                                    <div className="flex flex-col items-center md:items-start">
                                        <p className="text-gray-500 text-sm">{t('ticket_price')}</p>
                                        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-1 sm:gap-3">
                                            <p className="font-bold text-green-500 text-2xl">
                                                {allInclusive
                                                    ? formatPrice(
                                                          listing.price,
                                                          locale,
                                                          currencyCode
                                                      )
                                                    : formatPrice(
                                                          listing.proceeds,
                                                          locale,
                                                          currencyCode
                                                      )}
                                                <span className="font-normal text-gray-500 text-lg">
                                                    {' '}
                                                    {t('each')}
                                                </span>
                                            </p>
                                        </div>

                                        {allInclusive ? (
                                            <Fragment>
                                                <p className="text-gray-500 text-xs">
                                                    {t('include_booking_fee')}
                                                </p>
                                                {!isFtnFootballEvent && (
                                                    <p className="mt-1 text-gray-500 text-xs">
                                                        {fallbackTranslation(
                                                            t('face_value'),
                                                            'face_value',
                                                            'Face Value'
                                                        )}{' '}
                                                        -{' '}
                                                        {formatPrice(
                                                            listing.face_value,
                                                            locale,
                                                            listing.face_value_currency_code
                                                        )}
                                                    </p>
                                                )}
                                            </Fragment>
                                        ) : (
                                            <p className="text-gray-500 text-xs text-center">
                                                {t('price_exclude_fees')}
                                            </p>
                                        )}
                                    </div>

                                    {eventDetails?.tour.nameUrl !== 'soccer-world-cup' && (
                                        <Guarentee />
                                    )}
                                </div>

                                <div className="flex md:flex-row flex-col md:justify-between gap-6 pt-4 border-gray-300 border-t text-sm sm:text-base">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            {renderIconByName({
                                                name: listing.ticket_type_label,
                                                className: 'text-gray-500 text-lg',
                                            })}
                                            <p className="text-primary">
                                                {t(listing.ticket_type_label.toLowerCase())}
                                            </p>
                                        </div>
                                        {listing.quantity >= 2 && !standingSeat && (
                                            <div className="flex items-center gap-2">
                                                <Users className="text-gray-500" size={18} />
                                                <p className="text-primary">
                                                    {isFtnFootballEvent
                                                        ? t('pairs_guaranteed_only')
                                                        : t('you_will_seated_together')}
                                                </p>
                                            </div>
                                        )}
                                        {listing.restrictions.map((r) => (
                                            <div key={r.id} className="flex gap-2">
                                                <Info
                                                    className="mt-0.75 text-gray-500 shrink-0"
                                                    size={18}
                                                />
                                                <p className="text-primary">{r.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bottom-0 sticky flex items-center gap-2 bg-white pb-4 w-full">
                                    <ListingQuantitySelector
                                        quantityOptions={listing.quantity_options}
                                        value={quantity}
                                        onChange={setQuantity}
                                    />

                                    <div className="w-2/3">
                                        <CheckoutButton
                                            quantity={quantity}
                                            listing={listing}
                                            currencyCode={currencyCode}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}

type SeatViewImageProps = Omit<ImageProps, 'src' | 'alt'> & {
    img: ImageProps['src'];
    alt?: string;
};

function SeatViewImage({ img, alt = 'Seat view', ...imageProps }: SeatViewImageProps) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="relative flex justify-center items-center bg-gray-100 w-full aspect-video overflow-hidden shrink-0">
            {isLoading && (
                <div className="z-10 absolute inset-0 flex justify-center items-center">
                    <Spinner className="text-primary" />
                </div>
            )}
            <Image
                src={img}
                alt={alt}
                fill
                sizes="(min-width: 832px) 768px, (min-width: 768px) calc(100vw - 64px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
                onLoad={() => setIsLoading(false)}
                data-loading={isLoading}
                className="opacity-100 data-[loading=true]:opacity-0 transition-opacity"
                {...imageProps}
            />
        </div>
    );
}
