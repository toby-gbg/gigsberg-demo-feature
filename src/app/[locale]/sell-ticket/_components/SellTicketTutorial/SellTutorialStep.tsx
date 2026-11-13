'use client';

import { FC } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import GetPaid from '@/assets/svg/get_paid_icon.svg';
import Screens from '@/assets/svg/screens_icon.svg';
import Send from '@/assets/svg/send_icon.svg';

interface SellTutorialStepProps {
    step: 1 | 2 | 3;
}

const SellTutorialStep: FC<SellTutorialStepProps> = ({ step }) => {
    const t = useTranslations();

    return (
        <div className="flex flex-col items-center max-w-[350px]">
            <Image
                src={step === 1 ? Screens : step === 2 ? Send : GetPaid}
                width={step !== 2 ? 100 : 140}
                height={100}
                alt="Sell Step Icon"
            />
            <h2 className="mb-2 mt-5 text-xl font-medium">{t('list_and_Sell_ticket')}</h2>
            <p className="text-center text-zinc-800">
                {step === 1
                    ? t('step_1')
                    : step === 2
                      ? t('step_2_upload_ticket')
                      : t('step_2_secure_payment')}
            </p>
        </div>
    );
};

export default SellTutorialStep;
