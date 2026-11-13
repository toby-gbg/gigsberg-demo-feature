'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { fallbackTranslation } from '@/utils/common';

import useIntlRouter from '@/hooks/useIntlRouter';

import { Button } from '@/components/ui/Button';

const CityEmpty = () => {
    const t = useTranslations();
    const router = useIntlRouter();

    return (
        <div className="flex flex-col justify-center items-center gap-6 mx-auto py-4 w-full max-w-132 min-h-75">
            <div className="flex justify-center items-center p-4 border rounded-full w-14.5 h-14.5 text-gray-500">
                <Image alt="icon" src="/icons/filter_ticket_icon.svg" width={24} height={24} />
            </div>
            <div className="flex flex-col gap-2">
                <p className="font-bold text-black text-2xl text-center">
                    {fallbackTranslation(
                        t('no_events_now_title'),
                        'no_events_now_title',
                        'No upcoming events right now.'
                    )}
                </p>
                <p className="text-[#A0A0A0] text-xl text-center">
                    {fallbackTranslation(
                        t('no_result_message'),
                        'no_result_message',
                        'Sorry, we don’t have any results at the moment'
                    )}
                </p>
            </div>

            <Button
                onClick={() => router.back()}
                variant="ghost"
                className="border border-gray-300 rounded-lg"
            >
                <span className="text-gray-800 text-base">
                    {fallbackTranslation(t('back'), 'back', 'Back')}
                </span>
            </Button>
        </div>
    );
};

export default CityEmpty;
