import FacebookFooterIcon from '@/assets/svg/facebook_footer_icon.svg';
import InstagramFooterIcon from '@/assets/svg/instagram_footer_icon.svg';
import LinkedinFooterIcon from '@/assets/svg/linkedin_footer_icon.svg';
import TiktokFooterIcon from '@/assets/svg/tiktok_footer_icon.svg';
import XFooterIcon from '@/assets/svg/x_footer_icon.svg';
import YoutubeFooterIcon from '@/assets/svg/youtube_footer_icon.svg';
import { GIGSBERG_SOCIAL } from '@/constants/seo';

export const SOCIAL_FOLLOW = [
    {
        id: 'instagram',
        icon: () => InstagramFooterIcon,
        href: GIGSBERG_SOCIAL.instagram,
    },
    {
        id: 'facebook',
        icon: () => FacebookFooterIcon,
        href: GIGSBERG_SOCIAL.facebook,
    },
    {
        id: 'x',
        icon: () => XFooterIcon,
        href: GIGSBERG_SOCIAL.x,
    },
    {
        id: 'youtube',
        icon: () => YoutubeFooterIcon,
        href: GIGSBERG_SOCIAL.youtube,
    },
    {
        id: 'linkedin',
        icon: () => LinkedinFooterIcon,
        href: GIGSBERG_SOCIAL.linkedin,
    },
    {
        id: 'tiktok',
        icon: () => TiktokFooterIcon,
        href: GIGSBERG_SOCIAL.tiktok,
    },
];
