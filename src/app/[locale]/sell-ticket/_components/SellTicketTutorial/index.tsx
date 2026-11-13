'use client';

import { FC } from 'react';
import { useTranslations } from 'next-intl';

import { fallbackTranslation } from '@/utils/common';

import useCookie from '@/hooks/useCookie';
import { useStorageOnce } from '@/hooks/useStorageOnce';

import MainTitle from '@/components/MainTitle';
import { Button } from '@/components/ui/Button';

import { CLICKED_STORAGE_KEY } from '../../_constants/sellTicketsSeen';
import SellTutorialStep from './SellTutorialStep';

interface SellTicketTutorialProps {
    onNextStep?: () => void;
}

const SellTicketTutorial: FC<SellTicketTutorialProps> = ({ onNextStep }) => {
    const t = useTranslations();
    const { setCookie } = useCookie<boolean>('SELL_TUTORIAL_SEEN');

    const { trigger: triggerSetStorage } = useStorageOnce({
        storageKey: CLICKED_STORAGE_KEY,
        manual: true,
    });

    const onStartSelling = () => {
        setCookie(true);
        triggerSetStorage();
        onNextStep?.();
    };

    return (
        <section className="flex flex-col justify-center items-center p-6">
            <MainTitle
                title={fallbackTranslation(
                    t('sell_ticket_title'),
                    'sell_ticket_title',
                    'Looking to resell your ticket?'
                )}
                className="text-primary text-center"
            />
            <h3 className="text-zinc-800 text-lg">{t('selling_with_gigsberg_easy')}</h3>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-10 my-10">
                <SellTutorialStep step={1} />
                <SellTutorialStep step={2} />
                <SellTutorialStep step={3} />
            </div>
            <Button className="bg-solid" onClick={onStartSelling}>
                {t('start_selling')}
            </Button>
        </section>
    );
};

export default SellTicketTutorial;
