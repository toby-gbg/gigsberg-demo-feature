'use client';

import { FC } from 'react';
import { Facebook, Instagram } from 'lucide-react';
import { useTranslations } from 'next-intl';

import WhatsAppOutlinedIcon from '@/assets/icons/WhatsAppOutlinedIcon';
import XFillIcon from '@/assets/icons/XFillIcon';
import { cn } from '@/lib/cn';
import { GIGSBERG_SOCIAL } from '@/constants/seo';

import Link from './Link';

interface ShareToProps {
    className?: string;
}

const ShareTo: FC<ShareToProps> = ({ className }) => {
    const t = useTranslations();

    return (
        <div className={cn('flex items-center gap-x-3 justify-end text-primary', className)}>
            <p className="text-sm font-bold">{t('share_to')}</p>
            <Link
                prefetch={false}
                href={`${GIGSBERG_SOCIAL.instagram}?utm_source=instagram&utm_medium=website`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
            >
                <Instagram size={24} />
            </Link>

            <Link
                prefetch={false}
                href={`${GIGSBERG_SOCIAL.facebook}?utm_source=instagram&utm_medium=website`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
            >
                <Facebook size={24} />
            </Link>

            <Link
                prefetch={false}
                href={`${GIGSBERG_SOCIAL.x}?utm_source=instagram&utm_medium=website`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
            >
                <XFillIcon />
            </Link>

            <Link
                prefetch={false}
                href={GIGSBERG_SOCIAL.whatapps}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
            >
                <WhatsAppOutlinedIcon />
            </Link>
        </div>
    );
};

export default ShareTo;
