'use client';

import { FileCheck, MoreVertical, Pencil, Star, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import Address from '@/interfaces/Address';
import { getTranslation } from '@/utils/common';
import { CITY_KEY_PREFIX, COUNTRY_KEY_PREFIX } from '@/constants/translation';

import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

type AccountSettingsAddressCardProps = {
    item: Address;
    onFavorite: (item: Address) => void;
    onSetDefault: (item: Address) => void;
    onEdit: (item: Address) => void;
    onDelete: () => void;
};

const AccountSettingsAddressCard = ({
    item,
    onFavorite,
    onSetDefault,
    onEdit,
    onDelete,
}: AccountSettingsAddressCardProps) => {
    const t = useTranslations();
    const {
        fullname,
        phone,
        address_line1,
        address_line2,
        postcode,
        country: { name },
        city,
        is_favorite: isFavorite,
        isDefault,
    } = item;

    const translatedCity = getTranslation(t, city, CITY_KEY_PREFIX);
    const translatedCountry = getTranslation(t, name, COUNTRY_KEY_PREFIX);

    return (
        <Card className="mx-auto w-full rounded-lg border border-gray-400 bg-white p-4 shadow-none">
            <CardContent className="p-0 sm:p-4">
                <div className="flex w-full flex-col gap-1">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <h3 className="min-w-0 text-foreground text-lg font-semibold wrap-anywhere">
                                {fullname ?? address_line1}
                            </h3>
                            <Star
                                className="size-5 text-yellow-400"
                                fill={isFavorite ? 'currentColor' : 'none'}
                            />
                            {isDefault && (
                                <Badge
                                    showIcon={false}
                                    classNames={{
                                        base: 'rounded-lg border-[#0D0D10] bg-[#0D0D10] text-[10px] font-medium text-white',
                                    }}
                                >
                                    {t('default', { gender: 'female' })}
                                </Badge>
                            )}
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger
                                aria-label={t('actions')}
                                className={buttonVariants({
                                    isIconOnly: true,
                                    variant: 'ghost',
                                })}
                            >
                                <MoreVertical className="size-5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="z-1000 w-64 min-w-64">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                                    {!isDefault && (
                                        <DropdownMenuItem
                                            onClick={() => {
                                                onSetDefault(item);
                                            }}
                                        >
                                            <FileCheck className="shrink-0 text-lg" />
                                            <div className="flex min-w-0 flex-col whitespace-normal">
                                                <span>{t('set_as_default')}</span>
                                                <span className="text-muted-foreground text-xs font-normal">
                                                    {t('set_as_default_description')}
                                                </span>
                                            </div>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                        onClick={() => {
                                            onFavorite(item);
                                        }}
                                    >
                                        <Star
                                            className="shrink-0 text-lg text-yellow-400"
                                            fill={!isFavorite ? 'currentColor' : 'none'}
                                        />
                                        <div className="flex min-w-0 flex-col whitespace-normal">
                                            <span>
                                                {isFavorite ? t('unfavorite') : t('favorite')}
                                            </span>
                                            <span className="text-muted-foreground text-xs font-normal">
                                                {isFavorite
                                                    ? t('unfavorite_description')
                                                    : t('favorite_description')}
                                            </span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onEdit(item)}>
                                        <Pencil className="shrink-0 text-lg" />
                                        <div className="flex min-w-0 flex-col whitespace-normal">
                                            <span>{t('edit_address')}</span>
                                            <span className="text-muted-foreground text-xs font-normal">
                                                {t('edit_address_description')}
                                            </span>
                                        </div>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                {!isDefault && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel>
                                                {t('danger_zone')}
                                            </DropdownMenuLabel>
                                            <DropdownMenuItem
                                                variant="destructive"
                                                onClick={() => {
                                                    onDelete();
                                                }}
                                            >
                                                <Trash2 className="text-danger text-lg" />
                                                <div className="flex min-w-0 flex-col whitespace-normal">
                                                    <span>{t('delete')}</span>
                                                    <span className="text-muted-foreground text-xs font-normal">
                                                        {t('delete_this_address')}
                                                    </span>
                                                </div>
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="text-muted-foreground text-sm leading-5">
                        {phone && <p className="wrap-anywhere">{phone}</p>}
                        {fullname && <p className="wrap-anywhere">{address_line1}</p>}
                        {address_line2 && <p className="wrap-anywhere">{address_line2}</p>}
                        <p className="wrap-anywhere">
                            {postcode} {translatedCity}, {translatedCountry}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AccountSettingsAddressCard;
