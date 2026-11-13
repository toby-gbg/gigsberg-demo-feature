'use client';

import { FC, Fragment } from 'react';
import { useTranslations } from 'next-intl';
import { Controller, useFormContext } from 'react-hook-form';

import { SellForm } from '@/interfaces/Sell';
import { translateOptions } from '@/utils/common';

import FloatingSelect from '@/components/FloatingSelect';

import SELLER_CONNECTION_TYPES from '../../_constants/sellerConnectionType';
import YES_OR_NOT from '../../_constants/yesOrNot';

const SellTicketLastDetails: FC = () => {
    const t = useTranslations();
    const yesOrNot = translateOptions(t, YES_OR_NOT);
    const sellerConnectionTypes = translateOptions(t, SELLER_CONNECTION_TYPES);
    const { control } = useFormContext<SellForm>();

    return (
        <Fragment>
            <hr className="col-span-12 mt-1 text-neutral-400" />
            <Controller
                control={control}
                name="is_seller_connected_to_event"
                rules={{
                    required: t('field_required'),
                }}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <FloatingSelect
                        isHideSearchInput
                        label={t('connection_to_organiser_question')}
                        options={sellerConnectionTypes}
                        value={value}
                        onChange={onChange}
                        errorMessage={error?.message}
                        isRequired
                        classNames={{ wrapper: 'col-span-12' }}
                        filter={null}
                    />
                )}
            />
            <hr className="col-span-12 mt-1 text-neutral-400" />
            <Controller
                control={control}
                name="bought_tickets"
                rules={{
                    required: t('field_required'),
                }}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <FloatingSelect
                        isHideSearchInput
                        label={t('bought_from_gigsberg_question')}
                        options={yesOrNot}
                        value={value}
                        onChange={onChange}
                        errorMessage={error?.message}
                        isRequired
                        classNames={{ wrapper: 'col-span-12' }}
                        filter={null}
                    />
                )}
            />
        </Fragment>
    );
};

export default SellTicketLastDetails;
