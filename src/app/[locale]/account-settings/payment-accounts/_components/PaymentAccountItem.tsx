import { ReactNode } from 'react';
import { Edit, Ellipsis, FileCheck, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';

import PaymentMethod from '@/interfaces/PaymentMethod';
import { fallbackTranslation } from '@/utils/common';

import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

interface Props {
    data: PaymentMethod;
    onEdit: (payload: PaymentMethod) => void;
    onDelete: (payload: PaymentMethod) => void;
    onMarkDefault: (id: number, paymentAccount: PaymentMethod) => void;
}

export default function PaymentAccountItem({ data, onEdit, onDelete, onMarkDefault }: Props) {
    const t = useTranslations();

    const fields = [
        {
            label: 'id',
            data: data.id,
            fallback: 'Id',
        },
        {
            label: 'account_number',
            data: data.account_number,
            fallback: 'Account number',
        },
        {
            label: 'iban',
            data: data.iban,
            fallback: 'IBAN',
        },
        {
            label: 'payment_bank_institution',
            data: data.institution,
            fallback: 'Beneficiary Bank/Institution',
        },
    ] satisfies {
        label: keyof PaymentMethod | string;
        data: ReactNode;
        fallback: string;
    }[];
    return (
        <div className="border-divider relative flex flex-col gap-3 rounded-lg border p-4 hover:shadow-lg">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm font-semibold">{data.fullname}</div>
                    <div className="text-xs text-gray-500 wrap-anywhere">{data.email}</div>
                </div>
                <div className="flex items-center gap-2">
                    {!!data.is_default && (
                        <Badge
                            showIcon={false}
                            classNames={{
                                base: 'rounded-lg border-[#0D0D10] bg-[#0D0D10] text-[10px] font-medium text-white',
                            }}
                        >
                            {t('default', { gender: 'male' })}
                        </Badge>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            aria-label={t('actions')}
                            className={buttonVariants({ isIconOnly: true, variant: 'ghost' })}
                        >
                            <Ellipsis />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="z-1000 w-64 min-w-64 p-2">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                                {!data.is_default && (
                                    <DropdownMenuItem onClick={() => onMarkDefault(data.id, data)}>
                                        <FileCheck className="shrink-0 text-lg" />
                                        <div className="flex min-w-0 flex-col whitespace-normal">
                                            <span>{t('mark_as_default')}</span>
                                            <span className="text-muted-foreground text-xs font-normal">
                                                {t('mark_as_default_payment_account_description')}
                                            </span>
                                        </div>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => onEdit(data)}>
                                    <Edit className="shrink-0 text-lg" />
                                    <div className="flex min-w-0 flex-col whitespace-normal">
                                        <span>{t('edit')}</span>
                                        <span className="text-muted-foreground text-xs font-normal">
                                            {t('edit_payment_account_description')}
                                        </span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            {!data.deleted_at && !data.is_default && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel>{t('danger_zone')}</DropdownMenuLabel>
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={() => onDelete(data)}
                                        >
                                            <Trash className="text-danger text-lg" />
                                            <div className="flex min-w-0 flex-col whitespace-normal">
                                                <span>{t('delete')}</span>
                                                <span className="text-muted-foreground text-xs font-normal">
                                                    {t('delete_this_payment_account')}
                                                </span>
                                            </div>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="border border-dashed" />
            <div className="flex flex-col gap-1">
                {fields.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                        <div className="w-32 shrink-0 text-xs text-gray-500">
                            {fallbackTranslation(t(item.label), item.label, item.fallback)}
                        </div>
                        <div className="min-w-0 flex-1 text-sm font-semibold break-all">
                            {item.data ?? '--'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
