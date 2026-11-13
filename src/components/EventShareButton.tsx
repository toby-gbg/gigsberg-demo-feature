'use client';

import { useId } from 'react';
import Image from 'next/image';
import { usePathname } from '@/i18n/routing';
import { ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

import EntityMetadata from '@/interfaces/entity/EntityMetadata';
import { cn } from '@/lib/cn';
import { fallbackTranslation } from '@/utils/common';
import { generateMetaTitle } from '@/utils/metaTitle';
import {
    getClipboardShareHint,
    getShareTextData,
    openSocialShare,
    SHARE_MEDIA,
} from '@/utils/socialShare';

import { useSite } from '@/providers/SiteProvider';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogBody, DialogContent, DialogTrigger } from '@/components/ui/Dialog';
import { toast } from '@/components/ui/Toast';

import { useStableEntityContext } from '../app/[locale]/[type]/[subtype]/[event]/_providers/EntityProvider';

const socialShareMedias: Record<SHARE_MEDIA, { text: SHARE_MEDIA; icon: string }> = {
    [SHARE_MEDIA.FACEBOOK]: { text: SHARE_MEDIA.FACEBOOK, icon: '/images/facebook_icon.webp' },
    [SHARE_MEDIA.X]: { text: SHARE_MEDIA.X, icon: '/images/x_icon.webp' },
    [SHARE_MEDIA.WHATSAPP]: { text: SHARE_MEDIA.WHATSAPP, icon: '/images/whatsapp_icon.webp' },
    [SHARE_MEDIA.REDDIT]: { text: SHARE_MEDIA.REDDIT, icon: '/images/reddit_icon.webp' },
};

export default function EventShareButton() {
    const t = useTranslations();
    const { entityMetadata } = useStableEntityContext();
    const { type: eventType, entity } = (entityMetadata as EntityMetadata) || {};
    const { type: entityType } = entity || {};

    const domainInfo = useSite().domainInfo;

    const { config, hostname } = domainInfo || {};
    const useBrandStyling = config?.features?.useBrandStyling || false;
    const pathname = usePathname();
    const toastId = useId();

    const shareUrl = `https://${hostname}${pathname}`;
    const pageTitle = generateMetaTitle(t, {
        level: 'event',
        type: entityType,
        eventName: (entityMetadata as EntityMetadata)?.entity?.name,
        domainInfo,
    });

    const shareTextData = getShareTextData({ eventType, entityType });

    const showCopyToast = (message: string) => {
        toast.add({
            id: toastId,
            title: message,
            type: 'info',
        });
    };

    const copyToClipboard = (text: string) => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard
                .writeText(text)
                .catch((err) => console.error('Failed to copy:', err));
        }
    };

    const onClickCopyClipboard = () => {
        copyToClipboard(shareUrl);
        showCopyToast(
            fallbackTranslation(
                t('link_copied_to_clipboard'),
                'link_copied_to_clipboard',
                'Link copied to clipboard'
            )
        );
    };

    const onShare = async (text: SHARE_MEDIA) => {
        if (!shareUrl) {
            return;
        }

        const result = await openSocialShare(text, shareUrl, pageTitle, copyToClipboard);

        if (result === 'clipboard') {
            showCopyToast(getClipboardShareHint(text));
        }
    };

    return (
        <Dialog>
            <DialogTrigger
                aria-label={fallbackTranslation(t('share'), 'share', 'Share')}
                className={cn(
                    'flex justify-center items-center gap-2 bg-black xl:bg-white px-2 xl:px-4 py-2 border border-transparent xl:border-primary rounded-full xl:rounded-lg xl:min-w-16 xl:min-h-8',
                    useBrandStyling && 'xl:border-[#6D9FD6]'
                )}
            >
                <span
                    className={cn(
                        'text-white xl:text-primary',
                        useBrandStyling && 'xl:text-[#1565C0]'
                    )}
                >
                    <ExternalLink size={16} />
                </span>
                <span
                    className={cn(
                        'hidden xl:inline font-bold text-primary text-sm',
                        useBrandStyling && 'text-[#1565C0]'
                    )}
                >
                    {fallbackTranslation(t('share'), 'share', 'Share')}
                </span>
            </DialogTrigger>
            <DialogContent classNames={{ popup: 'md:max-w-[546px] p-0' }}>
                <DialogBody className="p-0 text-black">
                    <div className="flex flex-col gap-4 rounded-2xl bg-white p-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-1">
                                <p className="flex-1 text-xl font-medium text-ellipsis text-[#424242]">
                                    {fallbackTranslation(
                                        t(shareTextData.title.translationKey),
                                        shareTextData.title.translationKey,
                                        shareTextData.title.defaultText
                                    )}
                                </p>
                            </div>
                            <p className="text-xs font-normal text-text-hint md:text-sm">
                                {fallbackTranslation(
                                    t(shareTextData.description.translationKey),
                                    shareTextData.description.translationKey,
                                    shareTextData.description.defaultText
                                )}
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <div className="flex items-center gap-2 overflow-hidden md:gap-6">
                                {Object.values(socialShareMedias).map(({ text, icon }) => (
                                    <Button
                                        key={text}
                                        type="button"
                                        onClick={() => onShare(text)}
                                        variant="ghost"
                                        isIconOnly
                                        className="h-auto w-auto border-0 bg-transparent p-0"
                                        aria-label={`Share on ${text}`}
                                        prefixIcon={
                                            <div className="flex flex-col justify-center gap-2">
                                                <div
                                                    className={cn(
                                                        'flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[#E0E0E0] bg-white'
                                                    )}
                                                >
                                                    <Image
                                                        width={48}
                                                        height={48}
                                                        src={icon}
                                                        alt=""
                                                    />
                                                </div>
                                                <span className="text-center text-xs font-normal text-[#616161]">
                                                    {text}
                                                </span>
                                            </div>
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                        <div
                            className={cn(
                                'border-primary flex min-h-14 flex-nowrap items-center gap-2.5 overflow-hidden rounded-xl border p-4',
                                useBrandStyling && 'border-[#1E6BB8]'
                            )}
                        >
                            <div className="flex-1 overflow-hidden">
                                <p className="w-inherit line-clamp-1 truncate overflow-hidden font-normal text-ellipsis whitespace-nowrap text-[#616161] text-base">
                                    {shareUrl}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                isIconOnly
                                onClick={onClickCopyClipboard}
                                aria-label="Copy link"
                                className="size-auto p-0"
                                prefixIcon={
                                    <Image
                                        alt=""
                                        src="/icons/copy_icon.svg"
                                        width={18}
                                        height={18}
                                    />
                                }
                            />
                        </div>
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}
