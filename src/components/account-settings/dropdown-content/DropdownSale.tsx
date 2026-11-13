import { $selectedTicket, $uploadTicketModal } from '@/app/[locale]/account-settings/sales/_stores';
import { Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';

import AccountSettingOrder from '@/interfaces/account-settings/AccountSettingOrder';

import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
} from '@/components/ui/DropdownMenu';

interface Props {
    item: AccountSettingOrder;
}

export default function DropdownSales({ item }: Props) {
    const t = useTranslations();
    const today = new Date().toISOString().split('T')[0];
    const eventHasPassed = item.eventDate < today;

    const handleUpload = (sale: AccountSettingOrder) => {
        $selectedTicket.set(sale);
        $uploadTicketModal.set(true);
    };

    return (
        <DropdownMenuGroup>
            <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleUpload(item)} disabled={eventHasPassed}>
                <Upload className="text-default-500 shrink-0 text-lg" />
                <div className="flex min-w-0 flex-col whitespace-normal">
                    <span className="font-medium">{t('upload')}</span>
                    <span className="text-xs text-muted-foreground">{t('upload_new_file')}</span>
                    {eventHasPassed ? (
                        <div className="text-danger text-xs">{t('event_has_passed')}</div>
                    ) : null}
                </div>
            </DropdownMenuItem>
        </DropdownMenuGroup>
    );
}
