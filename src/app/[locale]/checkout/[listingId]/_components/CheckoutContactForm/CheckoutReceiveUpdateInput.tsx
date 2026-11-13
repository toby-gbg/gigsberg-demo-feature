'use client';

import { useTranslations } from 'next-intl';
import { Controller, useFormContext } from 'react-hook-form';

import { type CheckoutStep1Form } from '@/interfaces/Checkout';

import { useCheckoutData } from '../../_providers/CheckoutDataProvider';

export default function CheckoutReceiveUpdateInput() {
    const t = useTranslations();
    const { website } = useCheckoutData();
    const { name = '' } = website ?? {};

    const { control } = useFormContext<CheckoutStep1Form>();

    return (
        <Controller
            control={control}
            name="is_update_news"
            render={({ field: { value, onChange } }) => {
                return (
                    <div className="flex items-start gap-2">
                        <input
                            id="receive-update"
                            type="checkbox"
                            className="size-4 border-gray-300 mt-0.75 rounded focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                            checked={!!value}
                            onChange={(e) => onChange(e.target.checked)}
                        />
                        <label htmlFor="receive-update" className="text-sm">
                            {t('receive_email_update', {
                                company: name,
                            })}
                        </label>
                    </div>
                );
            }}
        />
    );
}
