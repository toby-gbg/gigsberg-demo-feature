import { useState, type Dispatch, type SetStateAction } from 'react';
import { format, parseISO } from 'date-fns';
import isEqual from 'lodash-es/isEqual';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';

import { AccountSettingOrderFilters } from '@/interfaces/account-settings/AccountSettingOrder';

import FloatingDateRangePickerSelect from '@/components/FloatingDateRangePickerSelect';
import FloatingInput from '@/components/FloatingInput';
import { Button } from '@/components/ui/Button';

interface DateSelectorOption {
    fromDate?: string;
    toDate?: string;
}

interface Props {
    filters: AccountSettingOrderFilters;
    defaultFilters: AccountSettingOrderFilters;
    setFilters: Dispatch<SetStateAction<AccountSettingOrderFilters>>;
    isListing?: boolean;
}

interface FilterForm {
    searchId: string;
    eventName: string;
    date: DateSelectorOption | null;
}

export default function AccountSettingsFilter({
    filters,
    defaultFilters,
    setFilters,
    isListing,
}: Props) {
    const t = useTranslations();

    // bump this to force the controlled inputs to fully remount on reset
    const [formKey, setFormKey] = useState(0);

    const {
        control,
        handleSubmit,
        reset,
        formState: { isDirty },
    } = useForm<FilterForm>({
        defaultValues: {
            ...filters,
            date: null,
        },
    });

    const emptyFormValues: FilterForm = {
        searchId: '',
        eventName: '',
        date: null,
    };

    const onSubmit = handleSubmit((data) => {
        setFilters((old) => ({
            ...old,
            searchId: data.searchId,
            eventName: data.eventName,
            fromDate: data.date?.fromDate,
            toDate: data.date?.toDate,
            pageNumber: 1,
        }));
    });

    const handleReset = () => {
        reset(emptyFormValues);
        setFilters(defaultFilters);
        setFormKey((k) => k + 1); // force remount so Input visually clears
    };

    return (
        <form
            key={formKey}
            className="col-span-12 grid w-full max-w-full grid-cols-1 items-end gap-2 xl:grid-cols-[minmax(0,300px)_minmax(0,1fr)_minmax(0,1fr)_auto]"
            onSubmit={onSubmit}
        >
            <Controller
                control={control}
                name="date"
                render={({ field: { value, onChange } }) => (
                    <FloatingDateRangePickerSelect
                        isClearable
                        classNames={{
                            trigger: 'bg-white',
                            wrapper: 'border border-neutral-300 rounded-lg',
                        }}
                        onChange={(range) => {
                            if (!range) {
                                setFilters((prev) => ({
                                    ...prev,
                                    fromDate: undefined,
                                    toDate: undefined,
                                }));
                            }
                            onChange(
                                range
                                    ? {
                                          fromDate: range.from
                                              ? format(range.from, 'yyyy-MM-dd')
                                              : undefined,
                                          toDate: range.to
                                              ? format(range.to, 'yyyy-MM-dd')
                                              : undefined,
                                      }
                                    : null
                            );
                        }}
                        value={
                            value?.fromDate
                                ? {
                                      from: parseISO(value.fromDate),
                                      to: value.toDate ? parseISO(value.toDate) : undefined,
                                  }
                                : undefined
                        }
                        disablePastDays={false}
                        label={isListing ? t('event_date_label') : t('purchase_date_label')}
                    />
                )}
            />

            <Controller
                control={control}
                name="searchId"
                render={({ field: { value, onChange } }) => (
                    <FloatingInput
                        classNames={{
                            inputGroup: 'bg-white',
                            wrapper: 'border border-neutral-300 rounded-lg',
                        }}
                        label={
                            isListing ? t('event_listing_number_label') : t('order_number_label')
                        }
                        value={value}
                        onChange={onChange}
                    />
                )}
            />

            <Controller
                control={control}
                name="eventName"
                render={({ field: { value, onChange } }) => (
                    <FloatingInput
                        classNames={{
                            inputGroup: 'bg-white',
                            wrapper: 'border border-neutral-300 rounded-lg',
                        }}
                        label={t('event_name_label')}
                        value={value}
                        onChange={onChange}
                    />
                )}
            />

            <div className="grid min-w-0 grid-cols-2 gap-2 xl:grid-cols-[auto_auto] h-full">
                <Button type="submit" className="whitespace-nowrap h-full" disabled={!isDirty}>
                    {t('search')}
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    className="whitespace-nowrap h-full border border-zinc-300"
                    onClick={handleReset}
                    disabled={isEqual(filters, defaultFilters)}
                >
                    {t('reset')}
                </Button>
            </div>
        </form>
    );
}
