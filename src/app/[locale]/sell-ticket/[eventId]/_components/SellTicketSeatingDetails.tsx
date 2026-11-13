'use client';

import { Fragment, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import SeatingPlanSet from '@/interfaces/SeatingPlanSet';
import { SellForm } from '@/interfaces/Sell';
import { getTranslation } from '@/utils/common';
import { CAT_KEY_PREFIX } from '@/constants/translation';

import FloatingInput from '@/components/FloatingInput';
import FloatingSelect from '@/components/FloatingSelect';

interface SellTicketSeatingDetailsProps {
    seatingPlanCategories: SeatingPlanSet[];
}

const SellTicketSeatingDetails = ({ seatingPlanCategories }: SellTicketSeatingDetailsProps) => {
    const t = useTranslations();
    const { control, setValue } = useFormContext<SellForm>();
    const category = useWatch({ control, name: 'category' });
    const blocks = useMemo(() => {
        const selectedCategory = seatingPlanCategories.find((item) => String(item.id) === category);

        return (selectedCategory?.blocks?.split(',') ?? []).map((item) => ({
            label: item,
            value: item,
        }));
    }, [category, seatingPlanCategories]);

    const translateCategory = (category: string) => getTranslation(t, category, CAT_KEY_PREFIX);

    return (
        <Fragment>
            <hr className="col-span-12 text-neutral-400" />
            <div className="col-span-12">
                <h1 className="text-xl font-semibold">{t('seating_details')}</h1>
                <p className="text-sm">{t('provide_seating_info')}</p>
            </div>
            <Controller
                control={control}
                name="category"
                rules={{
                    required: t('field_required'),
                }}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <FloatingSelect
                        label={t('category')}
                        options={seatingPlanCategories.map((item) => ({
                            value: String(item.id),
                            label: translateCategory(item.name),
                        }))}
                        value={value}
                        onChange={(k) => {
                            setValue('block', '');
                            onChange(k);
                        }}
                        errorMessage={error?.message}
                        isRequired
                        classNames={{ wrapper: 'col-span-12' }}
                    />
                )}
            />
            <Controller
                control={control}
                name="block"
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <FloatingSelect
                        isClearable
                        label={t('block')}
                        options={blocks}
                        value={value}
                        onChange={onChange}
                        errorMessage={error?.message}
                        classNames={{
                            wrapper: 'col-span-12 md:col-span-6',
                            clearTrigger: 'top-[initial]! bottom-0.5',
                            trigger: 'border-none',
                        }}
                    />
                )}
            />
            <Controller
                control={control}
                name="row"
                render={({ field: { value, ...field }, fieldState: { error } }) => (
                    <FloatingInput
                        label={t('row')}
                        classNames={{
                            wrapper: 'col-span-12 md:col-span-6',
                        }}
                        errorMessage={error?.message}
                        value={value}
                        {...field}
                    />
                )}
            />
        </Fragment>
    );
};

export default SellTicketSeatingDetails;
