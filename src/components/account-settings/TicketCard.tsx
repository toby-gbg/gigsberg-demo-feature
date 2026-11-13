'use client';

import { ReactNode } from 'react';
import { usePathname } from '@/i18n/routing';
import { format, parse } from 'date-fns';
import { snakeCase } from 'lodash-es';
import { useLocale, useTranslations } from 'next-intl';

import { fallbackTranslation, getTranslation } from '@/utils/common';
import { TicketType, TicketTypeEnum } from '@/utils/ticketType.util';
import { DATE_LOCALES } from '@/constants/locales';
import { CITY_KEY_PREFIX, COUNTRY_KEY_PREFIX } from '@/constants/translation';

import FallbackImage from '@/components/FallbackImage';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';

import DropdownWrapper from './DropdownWrapper';
import MobileTicketSection from './MobileTicketSection';

export interface AccountSettingsEventCardDefaultProps {
    eventName: string;
    eventDate: string;
    eventTime: string;
    venueName: string;
    cityName: string;
    countryName: string;
    image: string | null;
    performerImage?: string | null;
    active: boolean;
    soldOut: boolean;
    ticketType: TicketType;
    allow_downloaded?: boolean;
    email?: string;
    mobileLinks?: Array<{ id: number; value: string; ticketNumber: number }>;
}

interface Props<D> {
    item: D;
    fields: Partial<D>;
    dropdownContent?: ReactNode;
    isDisplayDropdown?: boolean;
}

export default function TicketCard<D extends AccountSettingsEventCardDefaultProps>({
    item,
    fields,
    dropdownContent,
    isDisplayDropdown = true,
}: Props<D>) {
    const t = useTranslations();
    const locale = useLocale();
    const pathname = usePathname();

    const {
        eventName,
        eventDate,
        eventTime,
        venueName,
        cityName,
        countryName,
        image,
        soldOut,
        allow_downloaded,
        ticketType,
        email,
        mobileLinks,
    } = item;

    const translatedCity = getTranslation(t, cityName, CITY_KEY_PREFIX);
    const translatedCountry = getTranslation(t, countryName, COUNTRY_KEY_PREFIX);
    const isMobileLink = ticketType === TicketTypeEnum.MOBILE_LINK;
    const isOnPurchasePage = pathname.includes('/account-settings/purchases');
    const eventDateTime = parse(`${eventDate} ${eventTime}`, 'yyyy-MM-dd HH:mm:ss', new Date());

    return (
        <Card
            aria-label={eventName}
            className="mx-auto w-full rounded-lg border border-neutral-400 bg-white p-0 shadow-none"
        >
            <CardContent className="p-4 md:p-6">
                <div className="flex w-full flex-col gap-4">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-x-4">
                            {image && (
                                <div className="hidden w-45 shrink-0 md:block">
                                    <FallbackImage
                                        alt="Event image"
                                        className="h-auto w-full rounded-xl"
                                        fill
                                        sizes="180px"
                                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/performers/${image}`}
                                    />
                                </div>
                            )}
                            <div>
                                <h3 className="text-foreground text-lg font-semibold">
                                    {eventName}
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    {format(eventDateTime, 'PPPPp', {
                                        locale: DATE_LOCALES[locale] ?? DATE_LOCALES['en-GB'],
                                    })}
                                </p>
                                <p className="text-muted-foreground text-sm">{venueName}</p>
                                <p className="text-muted-foreground text-sm">{`${translatedCity} - ${translatedCountry}`}</p>
                                <div className="flex flex-wrap items-center gap-2">
                                    {ticketType && (
                                        <Badge
                                            showIcon={false}
                                            classNames={{
                                                base: 'mt-2 text-tiny bg-gradient text-on-main',
                                            }}
                                        >
                                            {t(ticketType.toLowerCase())}
                                        </Badge>
                                    )}
                                    {soldOut && (
                                        <Badge
                                            showIcon={false}
                                            size={24}
                                            variant="destructive"
                                            classNames={{
                                                base: 'text-tiny mt-2',
                                                content: 'text-white text-[10px]',
                                            }}
                                        >
                                            {t('sold_out')}
                                        </Badge>
                                    )}
                                    {allow_downloaded === true && (
                                        <Badge
                                            showIcon={false}
                                            classNames={{
                                                base: 'mt-2 bg-success/10 text-success',
                                            }}
                                        >
                                            {t('downloads_allowed')}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        {isDisplayDropdown && <DropdownWrapper>{dropdownContent}</DropdownWrapper>}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                        {Object.entries(fields as Record<string, string | number>).map(
                            ([key, value]) => {
                                const valueData = value?.toString();
                                return (
                                    <div key={key} className="flex flex-col">
                                        <span className="text-muted-foreground text-xs uppercase">
                                            {t(snakeCase(key))}
                                        </span>
                                        <span className="text-base font-semibold text-wrap wrap-anywhere">
                                            {valueData
                                                ? fallbackTranslation(
                                                      t(snakeCase(valueData)),
                                                      snakeCase(valueData),
                                                      valueData
                                                  )
                                                : '-'}
                                        </span>
                                    </div>
                                );
                            }
                        )}

                        {isOnPurchasePage && isMobileLink && (
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs uppercase">
                                    {t('status')}
                                </span>
                                <span className="text-base font-semibold">
                                    {mobileLinks?.length ? (
                                        <span className="text-[rgb(var(--bg-solid))]">
                                            {t('transfered')}
                                        </span>
                                    ) : (
                                        <span className="text-amber-700">
                                            {t('transfer_pending')}
                                        </span>
                                    )}
                                </span>
                            </div>
                        )}
                    </div>

                    {isOnPurchasePage && isMobileLink && (
                        <MobileTicketSection mobileLinks={mobileLinks ?? []} email={email ?? ''} />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
