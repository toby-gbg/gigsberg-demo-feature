'use client';

import { FC } from 'react';
import { HelpCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { toggleMobileMenu } from '@/stores/modal';

import Link from '@/components/Link';

const HeaderHelp: FC = () => {
    const t = useTranslations();

    return (
        <Link
            prefetch={false}
            href="/faqs"
            className="flex items-center gap-x-1.5 text-on-header text-xs min-[1475px]:text-sm hover:underline"
            onClick={() => toggleMobileMenu(false)}
        >
            <HelpCircle size={16} />
            <span>{t('help')}</span>
        </Link>
    );
};

export default HeaderHelp;
