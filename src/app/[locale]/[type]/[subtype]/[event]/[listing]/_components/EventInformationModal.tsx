'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useUpdateEffect } from 'react-use';

import { fallbackTranslation } from '@/utils/common';
import { EVENT_RESTRICTION_MAP } from '@/constants/restrictions';

import { useListing } from '@/providers/ListingProvider';
import { useSite } from '@/providers/SiteProvider';
import useCookie from '@/hooks/useCookie';

import { Button } from '@/components/ui/Button';
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Dialog';

export default function EventInformationModal() {
    const t = useTranslations();
    const [isOpenModal, setIsOpenModal] = useState(false);

    const { config } = useSite().domainInfo || {};

    // Hide event info
    const { getEncryptedCookie, setEncryptedCookie } = useCookie<{ [key: string]: string }>(
        'HIDE_EVENT_INFO'
    );

    // Listing provider
    const { eventDetails, restrictions, openRestrictionModal } = useListing();
    const { id: eventId, countryCode, isRestrictionInCom } = eventDetails;

    const toggleModal = async () => {
        if (!eventId) return;
        const cookies = await getEncryptedCookie();
        if (!cookies?.[eventId]) {
            setIsOpenModal(true);
            setEncryptedCookie({
                ...cookies,
                [eventId]: true,
            });
        }
    };

    useUpdateEffect(() => {
        if (openRestrictionModal) toggleModal();
        else setIsOpenModal(false);
    }, [openRestrictionModal]);

    // Show restriction modal if the event lies within supported country codes (e.g. UK regulations apply for GB) or has com-level restrictions
    const onlySupportedCountryCodes = config?.features?.onlySupportedCountryCodes;

    const isRestrictedEvent =
        (onlySupportedCountryCodes && onlySupportedCountryCodes.includes(countryCode)) ||
        isRestrictionInCom === 1;

    if (!isRestrictedEvent || !restrictions.length) {
        return null;
    }

    return (
        <Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('event_information')}</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <div className="flex flex-col gap-y-3 text-black">
                        {restrictions.map((r) => {
                            const translationKey = EVENT_RESTRICTION_MAP[r.id?.toString()]?.key;
                            return (
                                <p key={r.id} className="text-sm">
                                    {fallbackTranslation(t(translationKey), translationKey, r.text)}
                                </p>
                            );
                        })}
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button onClick={() => setIsOpenModal(false)}>{t('continue')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
