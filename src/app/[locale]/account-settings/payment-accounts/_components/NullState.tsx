'use client';

import { KeyRound, ShieldCheck, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

const PaymentAccountNullState = () => {
    const t = useTranslations();
    return (
        <div className="col-span-12 flex flex-col gap-6">
            <div>
                <div className="text-2xl font-semibold">
                    {t('payment_account_null_state_section_title')}
                </div>
                <div className="text-sm font-medium text-gray-500">
                    {t('payment_account_null_state_section_description')}
                </div>
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-8">
                <div className="border-divider flex flex-col gap-3 rounded-lg border p-4">
                    <ShieldCheck />
                    <div>
                        <div className="text-sm font-semibold">
                            {t('payment_account_null_state_section_1_title')}
                        </div>
                        <div className="text-xs text-gray-500">
                            {t('payment_account_null_state_section_1_description')}
                        </div>
                    </div>
                </div>
                <div className="border-divider flex flex-col gap-3 rounded-lg border p-4">
                    <KeyRound />
                    <div>
                        <div className="text-sm font-semibold">
                            {t('payment_account_null_state_section_2_title')}
                        </div>
                        <div className="text-xs text-gray-500">
                            {t('payment_account_null_state_section_2_description')}
                        </div>
                    </div>
                </div>
                <div className="border-divider flex flex-col gap-3 rounded-lg border p-4">
                    <Zap />
                    <div>
                        <div className="text-sm font-semibold">
                            {t('payment_account_null_state_section_3_title')}
                        </div>
                        <div className="text-xs text-gray-500">
                            {t('payment_account_null_state_section_3_description')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentAccountNullState;
