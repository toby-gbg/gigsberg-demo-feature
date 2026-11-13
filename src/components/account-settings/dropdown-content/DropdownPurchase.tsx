import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';

import AccountSettingOrder from '@/interfaces/account-settings/AccountSettingOrder';
import { useDownloadOrderTicketMutation } from '@/swr/features/orders';

import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
} from '@/components/ui/DropdownMenu';
import { toast } from '@/components/ui/Toast';

interface Props {
    item: AccountSettingOrder;
}

export default function DropdownPurchases({ item }: Props) {
    const t = useTranslations();

    const { trigger: mutateAsync } = useDownloadOrderTicketMutation();

    const onDownload = (item: AccountSettingOrder) => {
        return toast.promise(mutateAsync(item.id), {
            loading: { title: t('dowloading_ticket'), type: 'loading' },
            success: { title: t('dowloading_ticket_successfull'), type: 'success' },
            error: { title: t('error_dowloading_ticket'), type: 'error' },
        });
    };
    return (
        <DropdownMenuGroup>
            <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onDownload(item)}>
                <Download className="text-default-500 text-lg shrink-0" />
                <div className="flex flex-col min-w-0 whitespace-normal">
                    <span className="font-medium">{t('download')}</span>
                    <span className="text-muted-foreground text-xs">{t('download_ticket')}</span>
                </div>
            </DropdownMenuItem>
        </DropdownMenuGroup>
    );
}
