import { ShareTextData } from '@/interfaces/Share';

export const SHARE_TEXT_DATA: Record<string, ShareTextData> = {
    'performer:concert': {
        title: {
            translationKey: 'share_this_artist_with',
            defaultText: 'Share this artist with',
        },
        description: {
            translationKey: 'share_artist_desc',
            defaultText: 'If you like this artist, share it with your friends',
        },
    },
    'performer:sport': {
        title: {
            translationKey: 'share_this_team_with',
            defaultText: 'Share this team with',
        },
        description: {
            translationKey: 'share_team_desc',
            defaultText: 'If you like this team, share it with your friends',
        },
    },
    DEFAULT: {
        title: {
            translationKey: 'share_this_page_with',
            defaultText: 'Share this page with',
        },
        description: {
            translationKey: 'share_page_desc',
            defaultText: 'If you like this page, share it with your friends',
        },
    },
} as const;
