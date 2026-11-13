import { Fragment } from 'react';
import {
    $deleteListing,
    $deleteListingModal,
    $editListing,
    $editListingModal,
} from '@/app/[locale]/account-settings/listings/_stores';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { KeyedMutator } from 'swr';

import { AccountSettingListing } from '@/interfaces/Listing';
import { useUpdateListingMutation } from '@/swr/features/listings';
import { ErrorResponse } from '@/swr/types';
import { AccountListingsPage } from '@/swr/types/listings';

import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import { toast } from '@/components/ui/Toast';

interface Props {
    item: AccountSettingListing;
    mutate: KeyedMutator<AccountListingsPage[]>;
}

export default function DropdownListing({ item, mutate }: Props) {
    const t = useTranslations();

    const renderError = (errorResponse: ErrorResponse) => {
        toast.close('account-loading');
        const error =
            errorResponse?.data?.message ||
            errorResponse?.message ||
            errorResponse?.data?.error ||
            '';

        if (!error) return;

        if (error.includes('This listing has sold tickets')) {
            return t('listing_delete_error');
        }
        if (error.includes('This listing has pending orders')) {
            return t('listing_pending_orders_error');
        }

        return error || t('error');
    };

    const { trigger: updateTrigger } = useUpdateListingMutation({
        onSuccess: () => {
            toast.close('account-loading');
            toast.add({ title: t('success'), type: 'success' });
            mutate();
        },
        onError: (error) => {
            toast.close('account-loading');
            toast.add({ title: renderError(error), type: 'error' });
        },
    });

    const onActive = (item: AccountSettingListing) => {
        if (!item) return;
        toast.add({ id: 'account-loading', title: t('loading'), type: 'loading', timeout: 0 });
        updateTrigger({
            id: item.id,
            active: item?.active ? 0 : 1,
            ticket_type: '',
        });
    };

    const { active } = item || {};

    const handleEdit = (listing: AccountSettingListing) => {
        $editListing.set(listing);
        $editListingModal.set(true);
    };

    const handleDelete = (listing: AccountSettingListing) => {
        $deleteListing.set(listing);
        $deleteListingModal.set(true);
    };

    return (
        <Fragment>
            <DropdownMenuGroup>
                <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEdit(item)}>
                    <Pencil className="text-default-500 shrink-0 text-lg" />
                    <div className="flex min-w-0 flex-col whitespace-normal">
                        <span className="font-medium">{t('edit')}</span>
                        <span className="text-xs text-muted-foreground">{t('modify_listing')}</span>
                    </div>
                </DropdownMenuItem>
                {!active ? (
                    <DropdownMenuItem className="text-success" onClick={() => onActive(item)}>
                        <Eye className="shrink-0 text-lg" />
                        <div className="flex min-w-0 flex-col whitespace-normal">
                            <span className="font-medium">{t('activate')}</span>
                            <span className="text-xs text-muted-foreground">
                                {t('activate_listing')}
                            </span>
                        </div>
                    </DropdownMenuItem>
                ) : null}
            </DropdownMenuGroup>
            {(active || item.ticketsRemaining === item.numberOfTickets) && (
                <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>{t('danger_zone')}</DropdownMenuLabel>
                        {active ? (
                            <DropdownMenuItem
                                variant="destructive"
                                className="text-danger"
                                onClick={() => onActive(item)}
                            >
                                <EyeOff className="shrink-0 text-lg" />
                                <div className="flex min-w-0 flex-col whitespace-normal">
                                    <span className="font-medium">{t('desactivate')}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {t('deactivate_listing')}
                                    </span>
                                </div>
                            </DropdownMenuItem>
                        ) : null}

                        {item.ticketsRemaining === item.numberOfTickets && (
                            <DropdownMenuItem
                                variant="destructive"
                                className="text-danger"
                                onClick={() => handleDelete(item)}
                            >
                                <Trash2 className="text-danger text-lg" />
                                <div className="flex min-w-0 flex-col whitespace-normal">
                                    <span className="font-medium">{t('delete')}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {t('permanently_delete')}
                                    </span>
                                </div>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>
                </>
            )}
        </Fragment>
    );
}
