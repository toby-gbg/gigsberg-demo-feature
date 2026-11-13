import { JSX } from 'react';
import {
    CreditCard,
    Download,
    FileText,
    LucideIcon,
    QrCode,
    ScanFace,
    Smartphone,
    Ticket,
} from 'lucide-react';

export enum TicketTypeEnum {
    E_TICKET = 'E_TICKET',
    PAPER_TICKET = 'PAPER_TICKET',
    MOBILE_TICKET = 'MOBILE_TICKET',
    MEMBERSHIP_CARD = 'MEMBERSHIP_CARD',
    QR_CODE = 'QR_CODE',
    MOBILE_LINK = 'MOBILE_LINK',
    FACE_ID = 'FACE_ID',
}

export type TicketType = `${TicketTypeEnum}`;

const TICKET_TYPE_ICONS: Record<TicketType, LucideIcon> = {
    E_TICKET: Ticket,
    PAPER_TICKET: FileText,
    MOBILE_TICKET: Download,
    MEMBERSHIP_CARD: CreditCard,
    QR_CODE: QrCode,
    MOBILE_LINK: Smartphone,
    FACE_ID: ScanFace,
};

interface RenderIconByNameProps {
    name: string;
    size?: number;
    color?: string;
    className?: string;
}

const TICKET_TYPE_TO_ID: Record<TicketType, number> = {
    E_TICKET: 1,
    PAPER_TICKET: 2,
    MOBILE_TICKET: 3,
    MEMBERSHIP_CARD: 4,
    QR_CODE: 5,
    MOBILE_LINK: 6,
    FACE_ID: 7,
};

export const convertTicketTypeToId = (ticketType: TicketType): number => {
    return TICKET_TYPE_TO_ID[ticketType];
};

export const renderIconByName = ({ name, ...props }: RenderIconByNameProps): JSX.Element | null => {
    const Icon = TICKET_TYPE_ICONS[name as TicketType];
    return Icon ? <Icon {...props} /> : null;
};
