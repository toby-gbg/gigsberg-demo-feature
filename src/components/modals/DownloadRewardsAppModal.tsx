'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@nanostores/react';
import { capitalize } from 'lodash-es';
import { useTranslations } from 'next-intl';

import AppStore from '@/assets/img/download-modal/AppStore_Badge.png';
import DownloadMobileApp from '@/assets/img/download-modal/Background.png';
import GGPlayStore from '@/assets/img/download-modal/GooglePlay_Badge.png';
import { $downloadAppModal, toggleDownloadAppModal } from '@/stores/modal';
import { TRACKING_SOURCES } from '@/constants/affiliates';

import { useSite } from '@/providers/SiteProvider';
import { useOpenDialogOnce } from '@/hooks/useOpenDialogOnce';
import { useOpenModalLockBody } from '@/hooks/userOpenModalLockBody';

import { Dialog, DialogBody, DialogContent, DialogTitle } from '@/components/ui/Dialog';

const STORAGE_KEY = 'download-mobile-app-modal-seen';

const checkAffParam = (searchParams: URLSearchParams): boolean =>
    searchParams.has('aff') ||
    searchParams.has('utm_source') ||
    TRACKING_SOURCES.some(({ param }) => searchParams.has(param));

const DownloadRewardsAppModal = () => {
    const t = useTranslations();
    const open = useStore($downloadAppModal);
    const searchParams = useSearchParams();
    const hasAffParam = checkAffParam(new URLSearchParams(searchParams));

    const domainInfo = useSite().domainInfo;
    const shouldShow =
        (domainInfo?.config?.features?.showDownloadAppModal && !hasAffParam) || false;

    useOpenModalLockBody({ isModalOpen: shouldShow && open });
    useOpenDialogOnce({
        toggleCallback: toggleDownloadAppModal,
        storageKey: STORAGE_KEY,
        proceed: shouldShow,
    });

    if (!shouldShow) return null;

    return (
        <Dialog open={open} onOpenChange={toggleDownloadAppModal}>
            <DialogContent
                classNames={{ popup: 'p-0! max-w-lg bg-transparent! shadow-none! select-none' }}
            >
                <DialogBody className="pt-0">
                    <div className="relative bg-white shadow-2xl rounded-xl w-full overflow-hidden">
                        <Image
                            src={DownloadMobileApp}
                            alt="Download the Gigsberg mobile app - Download & Get £5 Off"
                            aria-hidden="true"
                            fill
                            sizes="(min-width: 640px) 512px, calc(100vw - 32px)"
                            className="object-cover object-right pointer-events-none"
                        />

                        <div className="z-10 relative flex flex-col justify-between gap-6 sm:gap-8 mr-auto p-5 sm:p-9 min-[380px]:p-6 min-[480px]:p-7 pb-18 sm:pb-25 min-[380px]:pb-19 min-[480px]:pb-21 w-[75%] sm:w-[65%] min-[420px]:w-[70%]">
                            {/* TOP: Main Title & Description */}
                            <div className="flex flex-col gap-2 min-[420px]:gap-3">
                                <DialogTitle className="pr-0 font-extrabold text-[22px] text-secondary sm:text-[34px] min-[360px]:text-[25px] min-[420px]:text-[28px] md:text-[38px] leading-[1.1]">
                                    {t.rich('download_the_app_main_title', {
                                        br: () => <br />,
                                    })}
                                </DialogTitle>
                                <p className="text-[12px] text-gray-800 sm:text-[15px] min-[360px]:text-[13px] min-[420px]:text-[14px] leading-snug">
                                    {t.rich('download_the_app_main_text', {
                                        strong: (chunks) => (
                                            <strong className="font-bold">{chunks}</strong>
                                        ),
                                    })}
                                </p>
                            </div>

                            {/* BOTTOM: App Store Links & Legal Note */}
                            <div className="flex flex-col gap-3">
                                <p className="font-extrabold text-[15px] text-secondary sm:text-[22px] min-[360px]:text-[17px] min-[420px]:text-[19px]">
                                    {capitalize(t('download_the_app'))}
                                </p>

                                <div className="flex items-center gap-3">
                                    <a
                                        href="https://play.google.com/store/apps/details?id=com.luup.gigsberg"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex justify-center items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 h-10 sm:h-12 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                                    >
                                        <Image
                                            src={GGPlayStore}
                                            alt="Get it on Google Play"
                                            width={135}
                                            height={40}
                                            className="w-auto h-full object-contain"
                                        />
                                    </a>

                                    <a
                                        href="https://apps.apple.com/us/app/gigsberg/id6760895216"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex justify-center items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 h-10 sm:h-12 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                                    >
                                        <Image
                                            src={AppStore}
                                            alt="Download on the App Store"
                                            width={135}
                                            height={40}
                                            className="w-auto h-full object-contain"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <p className="right-0 bottom-0 left-0 absolute mt-0.5 rtl:mr-auto px-5 sm:px-9 min-[380px]:px-6 min-[480px]:px-7 pr-2 min-[450px]:pr-0 pb-5 sm:pb-9 min-[380px]:pb-6 min-[480px]:pb-7 w-full font-light text-[11.5px] text-black sm:text-[14px] min-[360px]:text-[12.5px] min-[420px]:text-[12.5px] italic leading-tight">
                            {t('download_the_app_note')}
                        </p>
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
};

export default DownloadRewardsAppModal;
