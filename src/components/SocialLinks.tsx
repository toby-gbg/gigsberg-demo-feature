'use client';

import { FC } from 'react';
import { InstagramIcon, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import FacebookIcon from '@/assets/icons/facebook';
import XIcon from '@/assets/icons/x';
import { cn } from '@/lib/cn';
import { GIGSBERG_SOCIAL } from '@/constants/seo';

import Link from '@/components/Link';

interface SocialLinksProps {
    className?: string;
}
const socialLinks = [
    {
        href: GIGSBERG_SOCIAL.facebook,
        label: 'Facebook',
        icon: FacebookIcon,
    },
    {
        href: GIGSBERG_SOCIAL.instagram,
        label: 'Instagram',
        icon: InstagramIcon,
        className: 'backdrop-blur-md bg-white/30 p-1.5',
    },

    {
        href: GIGSBERG_SOCIAL.x,
        label: 'Twitter',
        icon: XIcon,
    },
    {
        href: GIGSBERG_SOCIAL.whatapps,
        label: 'WhatsApp',
        icon: MessageCircle,
    },
];

const SocialLinks: FC<SocialLinksProps> = ({ className }) => {
    const t = useTranslations();
    return (
        <div className={cn('text-primary flex flex-col gap-2', className)}>
            <p className="text-sm font-bold">{t('share_to')}</p>
            <div className="flex items-center gap-x-1.5">
                {socialLinks.map((item) => (
                    <Link
                        key={item.href}
                        prefetch={false}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        className={cn('rounded-full bg-[#FFFFFF0A] p-1.5 backdrop-blur-md')}
                    >
                        <item.icon size={14} />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SocialLinks;
