import { isBoolean } from 'lodash-es';

import { SHARE_TEXT_DATA } from '@/constants/share';

export enum SHARE_MEDIA {
    FACEBOOK = 'Facebook',
    X = 'X',
    WHATSAPP = 'WhatsApp',
    REDDIT = 'Reddit',
}

/**
 * Builds the official (or de-facto standard) share URL for each platform.
 * Returns null for platforms that have no web share endpoint (Instagram, Signal etc. are not supported).
 */
export function buildSocialShareUrl(
    platform: SHARE_MEDIA,
    url: string,
    title: string
): string | null {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareText = title?.trim() ? `${title.trim()}\n${url}` : url;
    const encodedShareText = encodeURIComponent(shareText);

    switch (platform) {
        case SHARE_MEDIA.FACEBOOK:
            return encodedTitle
                ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&title=${encodedTitle}`
                : `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        case SHARE_MEDIA.X:
            return encodedTitle
                ? `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
                : `https://twitter.com/intent/tweet?url=${encodedUrl}`;
        case SHARE_MEDIA.REDDIT:
            return encodedTitle
                ? `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`
                : `https://www.reddit.com/submit?url=${encodedUrl}`;
        case SHARE_MEDIA.WHATSAPP:
            return `https://api.whatsapp.com/send?text=${encodedShareText}`;
        default:
            return null;
    }
}

export const SOCIAL_SHARE_POPUP_FEATURES = {
    noopener: true,
    noreferrer: true,
    toolbar: 0,
    scrollbars: 1,
    status: 0,
    menubar: 0,
    location: 0,
};

export type SocialShareResult = 'popup' | 'native' | 'clipboard';

export async function openSocialShare(
    platform: SHARE_MEDIA,
    encodedUrl: string,
    encodedTitle: string,
    copyToClipboard: (text: string) => void,
    socialSharePopupFeaturesParam?: Record<string, string | number | boolean>
): Promise<SocialShareResult> {
    const shareUrl = buildSocialShareUrl(platform, encodedUrl, encodedTitle);

    if (shareUrl) {
        const latestSocialSharePopupFeatures = {
            ...SOCIAL_SHARE_POPUP_FEATURES,
            ...socialSharePopupFeaturesParam,
        };
        const formattedSocialSharePopupFeatures: string = Object.entries(
            latestSocialSharePopupFeatures
        ).reduce((acc, item, index, list) => {
            const [key, value] = item || {};
            let latestValue = acc;
            if (isBoolean(value) && value === true) {
                latestValue += `${key}`;
            } else {
                latestValue += `${key}=${value}`;
            }
            latestValue += `${index === list.length - 1 ? '' : ','}`;
            return latestValue;
        }, '');
        window.open(shareUrl, '_blank', formattedSocialSharePopupFeatures);
        return 'popup';
    }

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        try {
            await navigator.share({
                title: encodedTitle,
                url: encodedUrl,
                text: encodedTitle,
            });
            return 'native';
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return 'clipboard';
            }
        }
    }

    copyToClipboard(encodedUrl);
    return 'clipboard';
}

export function getClipboardShareHint(platform: SHARE_MEDIA): string {
    switch (platform) {
        case SHARE_MEDIA.FACEBOOK:
            return 'Link copied — paste it in Facebook';
        case SHARE_MEDIA.X:
            return 'Link copied — paste it in X';
        case SHARE_MEDIA.WHATSAPP:
            return 'Link copied — paste it in WhatsApp';
        case SHARE_MEDIA.REDDIT:
            return 'Link copied — paste it in Reddit';
        default:
            return 'Link copied to clipboard';
    }
}

export const getShareTextData = ({
    eventType,
    entityType,
}: {
    eventType: string;
    entityType: string;
}) => {
    if (
        !eventType ||
        !entityType ||
        typeof eventType !== 'string' ||
        typeof entityType !== 'string'
    ) {
        return SHARE_TEXT_DATA['DEFAULT'];
    }
    const shareKey = `${eventType}:${entityType}`;
    return SHARE_TEXT_DATA[shareKey] || SHARE_TEXT_DATA['DEFAULT'];
};
