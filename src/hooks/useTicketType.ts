'use client';

import { useTranslations } from 'next-intl';

import { TicketTypeEnum } from '@/utils/ticketType.util';

type InputType = { id: number; name: string };

/**
 * This function takes in a key of ticket type in string and cast into TicketTypeEnum if it exists
 */
const mapNameToEnum = (name?: string): TicketTypeEnum | undefined => {
    if (!name) return undefined;
    const key = name.toUpperCase();
    const entries = Object.entries(TicketTypeEnum) as [string, TicketTypeEnum][];
    const match = entries.find(([k]) => k === key);
    return match ? match[1] : undefined;
};

/**
 *
 * @param types list of types returned in event detail, pass in to get list of types with correct type
 * @returns
 */
const useTicketTypes = (types?: InputType[]) => {
    const t = useTranslations();

    if (types?.length) {
        return types
            .map((item) => {
                const enumVal = mapNameToEnum(item.name);
                if (!enumVal) return null;
                return {
                    label: t(item.name),
                    value: enumVal,
                };
            })
            .filter((it): it is { label: string; value: TicketTypeEnum } => it !== null);
    }

    return [
        { label: t('e_ticket'), value: TicketTypeEnum.E_TICKET },
        { label: t('paper_ticket'), value: TicketTypeEnum.PAPER_TICKET },
        { label: t('mobile_ticket'), value: TicketTypeEnum.MOBILE_TICKET },
        { label: t('qr_code'), value: TicketTypeEnum.QR_CODE },
        { label: t('mobile_link'), value: TicketTypeEnum.MOBILE_LINK },
        { label: t('face_id'), value: TicketTypeEnum.FACE_ID },
    ];
};

export default useTicketTypes;
