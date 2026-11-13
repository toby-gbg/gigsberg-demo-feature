'use client';

import { useEffect, useMemo } from 'react';
import Image from 'next/image';
import { MapViewer } from '@3ddv/dvm';
import { Armchair, Eye, Info, Medal } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import badgeIconSrc from '@/assets/gif/instant_download_badge.gif';
import Gigsberg from '@/assets/img/logoBlack.png';
import Listing from '@/interfaces/Listing';
import { cn } from '@/lib/cn';
import { LISTING_CARD_HOVERED, LISTING_CARD_UNHOVERED } from '@/lib/venue-viewer';
import { fallbackTranslation, getTranslation } from '@/utils/common';
import { formatPrice } from '@/utils/currency.util';
import { MatchResult } from '@/utils/digital-venue';
import { getImgsFromMap, getRestrictionsByGroup, restrictionHasGroup1 } from '@/utils/listing.util';
import { isStanding } from '@/utils/listingCard';
import { renderIconByName, TicketTypeEnum } from '@/utils/ticketType.util';
import { FTN_AFFILIATE_ID } from '@/constants/affiliates';
import { CAT_KEY_PREFIX } from '@/constants/translation';

import { useListing } from '@/providers/ListingProvider';
import { useSite } from '@/providers/SiteProvider';
import {
    DDV_LISTING_HOVER_SECTION_EVENT,
    DDV_LISTING_UNHOVER_SECTION_EVENT,
} from '@/hooks/digital-venue/useDigitalVenueMapInteractions';
import { useGetThumbnail } from '@/hooks/digital-venue/useGetThumbnail';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';

import PreviewVenue2DMap from './PreviewVenue2DMap';

interface Props {
    listing: Listing;
    onSelected: (thumbnailImg: HTMLImageElement | undefined) => void;
    onVisible?: () => void;
    keyMatching?: MatchResult[];
    mapViewer?: MapViewer | null;
}

export default function ListingCard({
    listing: {
        id,
        block,
        row,
        category_name,
        price,
        proceeds,
        ticket_type_label,
        quantity: available_quantity,
        seat_info,
        is_trader,
        face_value,
        face_value_currency_code,
        face_value_currency_symbol,
        currency_code,
        restrictions,
        affiliate_id,
        ext_listing_id,
        is_instant_download: instant_download,
        is_primary_seller,
        fans_side,
        mobile_ticket_app_name,
        category_id,
    },
    onSelected,
    onVisible,
    keyMatching = [],
    mapViewer = null,
}: Props) {
    const t = useTranslations();
    const locale = useLocale();

    const restrictions1 = useMemo(() => getRestrictionsByGroup(restrictions, 1), [restrictions]);
    const restrictions2 = useMemo(() => getRestrictionsByGroup(restrictions, 0), [restrictions]);

    // Listing provider
    const { listings, mapUrls, external_3ddv_id } = useListing();
    const { isStage, config } = useSite().domainInfo || {};
    const useThemeBackground = config?.features?.useThemeBackground || false;
    const { allInclusive } = listings;

    // Standing check
    const standingSeat = isStanding({ restrictions, category: category_name, block });

    const { ref, hasBeenVisible } = useIntersectionObserver({
        threshold: 0.5,
        rootMargin: '0px',
        root: null,
    });

    const isFtnFootballEvent = affiliate_id === FTN_AFFILIATE_ID;

    useEffect(() => {
        if (hasBeenVisible && onVisible) {
            onVisible();
        }
    }, [hasBeenVisible, onVisible]);

    const postMessageTo2DMap = ({
        block,
        categoryName,
        categoryId,
    }: {
        block?: string | null;
        categoryName?: string | null;
        categoryId?: string | number | null;
    }) => {
        if (!block && !categoryName) return;

        if (external_3ddv_id) {
            window.dispatchEvent(
                new CustomEvent(DDV_LISTING_HOVER_SECTION_EVENT, {
                    detail: {
                        blockKey: block,
                        categoryName,
                    },
                })
            );
            return;
        }

        window.dispatchEvent(
            new CustomEvent(LISTING_CARD_HOVERED, {
                detail: {
                    block,
                    categoryName,
                    categoryId,
                },
            })
        );
    };

    // Highlight SVG blocks on mouse enter
    const onMouseEnter = () => {
        postMessageTo2DMap({ block, categoryName: category_name, categoryId: category_id });
    };

    const onMouseLeave = () => {
        if (external_3ddv_id) {
            if (block || category_name) {
                window.dispatchEvent(new CustomEvent(DDV_LISTING_UNHOVER_SECTION_EVENT));
            }
            return;
        }

        window.dispatchEvent(new CustomEvent(LISTING_CARD_UNHOVERED));
    };

    const previewImgs = getImgsFromMap(mapUrls, category_name, block);

    const targets = keyMatching.find((key) => key.source === block)?.targets;
    const viewId = targets && targets.length > 0 ? targets[0] : '';
    const { thumbnailImg } = useGetThumbnail({
        mapViewer,
        viewId,
        venueId: external_3ddv_id ?? '',
        enabled: hasBeenVisible,
    });

    return (
        <Card
            ref={ref}
            role="article"
            data-listing-id={id === 0 ? ext_listing_id : id}
            data-affiliate-id={affiliate_id}
            data-category-name={category_name}
            data-block={block}
            className={
                'hover:border-main-start relative flex w-full flex-col gap-2 rounded-none border border-gray-300 bg-white p-3 shadow-none transition-shadow hover:shadow-lg sm:flex-row md:gap-4 md:p-6 lg:p-4 ltr:lg:rounded-r-xl rtl:lg:rounded-l-xl'
            }
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {mapUrls && (
                <div
                    className={cn(
                        'relative bg-foreground-100 shadow border rounded-lg w-full sm:w-40 @sm:h-28 aspect-video overflow-hidden shrink-0',
                        {
                            hidden: previewImgs[0] === undefined,
                            'sm:block': previewImgs[0] === undefined,
                        }
                    )}
                >
                    {previewImgs[0] ? (
                        <Image
                            src={previewImgs[0]}
                            alt={block}
                            fill
                            sizes="(max-width: 160px) 100vw, 160px"
                            className="opacity-100 data-[loading=true]:opacity-0 object-cover transition-opacity"
                        />
                    ) : (
                        <PreviewVenue2DMap
                            mapViewer={mapViewer}
                            thumbnailImgDigitalVenue={thumbnailImg}
                        />
                    )}
                </div>
            )}
            <div className="flex min-w-0 flex-1 gap-4 md:gap-6">
                <div className="flex min-w-0 flex-1 flex-col wrap-anywhere text-gray-500 ltr:text-left rtl:text-right">
                    <div className="text-primary flex flex-wrap items-center gap-x-1.5 text-sm font-semibold">
                        {category_name && (
                            <h3 className="text-primary text-sm lg:text-base">
                                {getTranslation(t, category_name, CAT_KEY_PREFIX)}
                            </h3>
                        )}

                        {block && (
                            <h3 className="text-primary text-sm lg:text-base">
                                {t('block')}: {block}
                            </h3>
                        )}
                        {row && (
                            <h3 className="text-primary text-sm lg:text-base">
                                {t('row')}: {row}
                            </h3>
                        )}
                        <span className="flex items-center gap-x-1">
                            {!isFtnFootballEvent && (
                                <Tooltip>
                                    <TooltipTrigger
                                        type="button"
                                        aria-label={`Face value per ticket (exc. fees): ${formatPrice(
                                            face_value,
                                            locale,
                                            face_value_currency_code
                                        )}`}
                                        className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-gradient px-1 pt-0.5 text-xs leading-none whitespace-nowrap break-normal text-on-main"
                                    >
                                        {face_value_currency_symbol}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Face value per ticket (exc. fees):{' '}
                                        {formatPrice(face_value, locale, face_value_currency_code)}
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            {seat_info && (
                                <Tooltip>
                                    <TooltipTrigger
                                        type="button"
                                        aria-label={`Seating Information: ${seat_info}`}
                                    >
                                        <Armchair
                                            aria-hidden="true"
                                            className="text-base"
                                            size={20}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Seating Information: {seat_info}
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            {is_trader && (
                                <Tooltip>
                                    <TooltipTrigger type="button" aria-label={t('trader')}>
                                        <Medal aria-hidden="true" size={17} />
                                    </TooltipTrigger>
                                    <TooltipContent>{t('trader')}</TooltipContent>
                                </Tooltip>
                            )}
                            {restrictions1.length > 0 && (
                                <Tooltip>
                                    <TooltipTrigger
                                        type="button"
                                        aria-label={restrictions1.map((r) => r.name).join(', ')}
                                    >
                                        <Eye aria-hidden="true" className="text-base" size={20} />
                                    </TooltipTrigger>
                                    <TooltipContent className="whitespace-pre-line">
                                        {restrictions1.map((r) => r.name).join('\n')}
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </span>
                    </div>

                    {/* Ticket left */}
                    <p className="mt-1 text-secondary text-sm">
                        {available_quantity} {t('ticket', { count: available_quantity })}{' '}
                        {t('left')}
                    </p>

                    {/* Restriction */}
                    <p className="mt-1 text-xs sm:text-sm">
                        {restrictionHasGroup1(restrictions)
                            ? t('restricted_view')
                            : t('clear_view')}{' '}
                    </p>

                    {available_quantity >= 2 && !standingSeat && (
                        <p className="text-xs sm:text-sm">
                            {isFtnFootballEvent
                                ? t('pairs_guaranteed_only')
                                : t('you_will_seated_together')}
                        </p>
                    )}

                    {isFtnFootballEvent && fans_side && (
                        <p className="text-xs sm:text-sm">
                            {t('fans_side')}: {fans_side}
                        </p>
                    )}

                    {restrictions2.length > 0 &&
                        restrictions2.map((r) => (
                            <p key={r.id} className="text-xs sm:text-sm">
                                {r.name}
                            </p>
                        ))}

                    {/* Ticket type */}
                    <div className="flex items-center gap-x-1 mt-2">
                        {renderIconByName({
                            name: ticket_type_label,
                            color: 'var(--text-primary)',
                        })}
                        <p className="text-primary text-sm">{t(ticket_type_label.toLowerCase())}</p>
                        {/* WLB-2423 */}
                        {ticket_type_label === TicketTypeEnum.MOBILE_TICKET && (
                            <Tooltip>
                                <TooltipTrigger
                                    type="button"
                                    aria-label={t(ticket_type_label.toLowerCase())}
                                >
                                    <Info
                                        aria-hidden="true"
                                        size={16}
                                        className="text-primary cursor-pointer"
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div className="break-normal">
                                        {mobile_ticket_app_name
                                            ? fallbackTranslation(
                                                  t('mobile_ticket_app_specific', {
                                                      app: mobile_ticket_app_name,
                                                  }),
                                                  'mobile_ticket_app_specific',
                                                  `${mobile_ticket_app_name} is required to access your ticket, we'll send the details`
                                              )
                                            : fallbackTranslation(
                                                  t('mobile_ticket_app_fallback'),
                                                  'mobile_ticket_app_fallback',
                                                  "Mobile app required — we'll send the details."
                                              )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>

                    {/* Affiliate id */}
                    {affiliate_id && isStage && (
                        <p className="mt-2 text-main-start text-sm">
                            Affiliate ID : {affiliate_id} | Listing ID : {ext_listing_id}
                        </p>
                    )}
                </div>

                <div className="flex max-w-1/2 shrink-0 flex-col items-end text-end wrap-anywhere">
                    {instant_download && (
                        <Tooltip>
                            <TooltipTrigger
                                type="button"
                                aria-label={t('instant_download_tooltip')}
                                className="flex items-center font-semibold text-[#0C2E58] text-sm"
                            >
                                <Image
                                    height={20}
                                    width={20}
                                    alt="Instant Download"
                                    src={badgeIconSrc}
                                />
                                <span className="ml-1">{t('instant_download')}</span>
                            </TooltipTrigger>
                            <TooltipContent>{t('instant_download_tooltip')}</TooltipContent>
                        </Tooltip>
                    )}
                    <div className="flex flex-col justify-center items-end grow">
                        <div className="font-bold text-primary text-base lg:text-lg">
                            {allInclusive
                                ? formatPrice(price, locale, currency_code)
                                : formatPrice(proceeds, locale, currency_code)}
                            <span className="font-normal text-sm"> {t('each').toLowerCase()}</span>
                        </div>
                        {allInclusive && (
                            <div className="flex items-center mt-1 text-secondary text-xs lg:text-sm">
                                <span>{t('all_fees_included')}</span>
                                <Tooltip>
                                    <TooltipTrigger
                                        type="button"
                                        aria-label={t('include_booking_fee')}
                                    >
                                        <Info
                                            aria-hidden="true"
                                            className="rtl:mr-2 ltr:ml-2 text-base"
                                            size={16}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>{t('include_booking_fee')}</TooltipContent>
                                </Tooltip>
                            </div>
                        )}
                        <Button
                            className={cn(
                                'mt-2 w-25! xl:w-28.75!',
                                useThemeBackground && 'text-on-header'
                            )}
                            onClick={() => onSelected(thumbnailImg)}
                        >
                            {t('select')}
                        </Button>
                        {config?.features?.showResaleTooltip &&
                            (is_primary_seller ? (
                                <div className="mt-2 text-xs text-[#1565C0] lg:text-sm">
                                    {t('primary')}
                                </div>
                            ) : (
                                <div className="flex items-center mt-2 text-xs lg:text-sm">
                                    <span className="text-[#1565C0]">{t('resale_ticket')}</span>
                                    <Tooltip>
                                        <TooltipTrigger
                                            type="button"
                                            aria-label={t('resale_tickets_supplied_by')}
                                        >
                                            <Info
                                                aria-hidden="true"
                                                className="rtl:mr-2 ltr:ml-2 text-base"
                                                size={16}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">
                                            <div className="flex items-center gap-1">
                                                <span>{t('resale_tickets_supplied_by')}</span>
                                                <Image
                                                    src={Gigsberg}
                                                    width={85}
                                                    alt="Gigsberg Logo"
                                                />
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}
