'use client';

import { FC } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

const Guarentee: FC = () => {
    const t = useTranslations();

    return (
        <div className="flex flex-col items-center">
            <div className="flex items-center">
                <ShieldCheck className="text-primary" size={20} />
                <p className="text-primary ms-1 uppercase">
                    <span className="font-bold">100%</span> {t('buyer_guarantee')}
                </p>
            </div>
            <p className="text-primary uppercase text-sm">{t('for_every_order')}</p>
        </div>
    );
};

export default Guarentee;
