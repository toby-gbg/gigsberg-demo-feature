'use client';

import { DateTime } from 'luxon';
import { useLocale, useTranslations } from 'next-intl';
import Balancer from 'react-wrap-balancer';

import { cn } from '@/lib/cn';
import { fallbackTranslation, formatSaleDateTime } from '@/utils/common';
import { getOpenSaleDateTime } from '@/utils/event';

import { useSite } from '@/providers/SiteProvider';

interface EventOpenSaleCountdownProps {
    openSaleTimestamp?: string | null;
    openSaleDate?: string | null;
    openSaleTime?: string | null;
    openSaleTimezone?: string | null;
    className?: string;
}

const EventOpenSaleCountdown = ({
    openSaleTimestamp,
    openSaleDate,
    openSaleTime,
    openSaleTimezone,
    className,
}: EventOpenSaleCountdownProps) => {
    const t = useTranslations();
    const locale = useLocale();

    const domainInfo = useSite().domainInfo;
    const useBrandStyling = domainInfo?.config?.features?.useBrandStyling || false;

    const dateTime = getOpenSaleDateTime({
        openSaleTimestamp,
        openSaleDate,
        openSaleTime,
        openSaleTimezone,
    });
    const now = DateTime.now();

    if (!dateTime?.isValid || dateTime <= now) return null;

    const paragraphClassName = cn(
        'font-normal text-[10.5px] text-gray-600 leading-[14px]',
        useBrandStyling && 'text-[#0F52A4]',
        className
    );

    const minutes = dateTime.diff(now, 'minutes').minutes;

    if (minutes < 1) {
        return (
            <p className={paragraphClassName}>
                <Balancer>
                    {fallbackTranslation(
                        t('start_sale'),
                        'start_sale',
                        'The sale will start in a few moments'
                    )}
                </Balancer>
            </p>
        );
    }

    if (minutes < 60) {
        return (
            <p className={paragraphClassName}>
                <Balancer>
                    {fallbackTranslation(
                        t('start_sale_minute'),
                        'start_sale_minute',
                        'Sale will start in'
                    )}{' '}
                    {Math.round(minutes)} {fallbackTranslation(t('minute'), 'minute', 'minute(s)')}
                </Balancer>
            </p>
        );
    }

    const saleDateTime = dateTime.hasSame(now.setZone(dateTime.zone), 'day')
        ? dateTime.setLocale(locale).toLocaleString({
              hour: '2-digit',
              minute: '2-digit',
              hourCycle: 'h23',
          })
        : formatSaleDateTime(dateTime, locale, { showTimezone: false });

    return (
        <p className={paragraphClassName}>
            <Balancer>
                {fallbackTranslation(t('time_sale'), 'time_sale', 'Sale will start at')}{' '}
                <span className="font-bold">{saleDateTime}</span>
            </Balancer>
        </p>
    );
};

export default EventOpenSaleCountdown;
