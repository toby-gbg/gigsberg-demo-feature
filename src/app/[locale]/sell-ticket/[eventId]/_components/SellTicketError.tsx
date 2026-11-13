'use client';

import { useTranslations } from 'next-intl';

import useIntlRouter from '@/hooks/useIntlRouter';

import { Button } from '@/components/ui/Button';

interface Props {
    message: string;
}
const SellTicketError = ({ message = '' }: Props) => {
    const t = useTranslations();
    const { back } = useIntlRouter();

    return (
        <div className="flex justify-center items-center px-4 flex-1">
            <div className="bg-white p-6 rounded-md shadow-md max-w-xl w-full flex flex-col items-center">
                <p className="text-gray-700 text-center mb-4">{message}</p>

                <Button type="submit" onClick={() => back()}>
                    {t('back')}
                </Button>
            </div>
        </div>
    );
};

export default SellTicketError;
