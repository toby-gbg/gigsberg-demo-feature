'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { useTranslations } from 'next-intl';
import { useUnmount } from 'react-use';

import { $internationalEventModal, $internationalEventUrl } from '@/stores/modal';

import { Button } from '@/components/ui/Button';
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Dialog';

const getFallbackOrigin = (): string => {
    const hostname = window.location.hostname;

    const isDevDomain = hostname.includes('.dev');
    const isPreProdDomain = hostname.includes('pre-');

    if (isDevDomain) return 'https://marketplace.dev.gigsberg.com';
    if (isPreProdDomain) return 'https://pre-marketplace.gigsberg.com';
    return 'https://www.gigsberg.com';
};

const resolveSafeUrl = (url: string | null): string => {
    const fallbackOrigin = getFallbackOrigin();
    if (!url) return `${fallbackOrigin}/`;

    try {
        const parsed = new URL(url, fallbackOrigin);
        const isHttps = parsed.protocol === 'https:';
        const hasDomain = parsed.hostname.includes('.');

        return isHttps && hasDomain ? parsed.toString() : `${fallbackOrigin}/`;
    } catch {
        return `${fallbackOrigin}/`;
    }
};

export default function InternationalEventModal() {
    const t = useTranslations();

    const urlRef = useRef<string>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isOpenInternationalEventModal = useStore($internationalEventModal);
    const internationalEventUrl = useStore($internationalEventUrl);

    const clearTimer = (closeModal?: boolean) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        if (closeModal) {
            $internationalEventUrl.set(null);
            $internationalEventModal.set(false);
        }
    };

    const onContinue = () => {
        clearTimer(true);
        window.location.assign(resolveSafeUrl(urlRef.current));
    };

    useEffect(() => {
        resolveSafeUrl(urlRef.current);
        clearTimer();

        if (!isOpenInternationalEventModal || !internationalEventUrl) return;

        urlRef.current = internationalEventUrl;

        timeoutRef.current = setTimeout(() => {
            onContinue();
            timeoutRef.current = null;
        }, 10000);

        return clearTimer;
    }, [isOpenInternationalEventModal, internationalEventUrl]);

    useUnmount(() => clearTimer(true));

    return (
        <Dialog
            open={isOpenInternationalEventModal}
            onOpenChange={(isOpen) => !isOpen && clearTimer(true)}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('international_event_title')}</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <div className="flex flex-col gap-y-3 text-black">
                        <p>{t('international_event_message_1')}</p>
                        <p>{t('international_event_message_2')}</p>
                        <p>{t('international_event_message_3')}</p>
                        <p>{t('international_event_message_4')}</p>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button
                        onClick={() => clearTimer(true)}
                        className="h-auto min-h-[38px] bg-red-700 px-3 py-1.5 text-xs text-white lg:text-sm"
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={onContinue}
                        className="h-auto min-h-[38px] px-3 py-1.5 text-xs lg:text-sm"
                    >
                        {t('continue')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
