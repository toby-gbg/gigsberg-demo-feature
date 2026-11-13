'use client';

import Image from 'next/image';
import { usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

import appStoreDesktop2x from '@/assets/img/mobile-visual/desktop/2x/app-store.png';
import googlePlayDesktop2x from '@/assets/img/mobile-visual/desktop/2x/google-play.png';
import phoneBannerDesktop2x from '@/assets/img/mobile-visual/desktop/2x/phone-banner.png';
import phoneIconDesktop2x from '@/assets/img/mobile-visual/desktop/2x/phone-icon.png';
import appStoreMobile2x from '@/assets/img/mobile-visual/mobile/2x/app-store.png';
import googlePlayMobile2x from '@/assets/img/mobile-visual/mobile/2x/google-play.png';
import phoneIconMobile2x from '@/assets/img/mobile-visual/mobile/2x/phone-icon.png';

import { useSite } from '@/providers/SiteProvider';

const HeaderMobileVisualBanner = () => {
    const t = useTranslations();
    const pathname = usePathname();

    const domainInfo = useSite().domainInfo;

    const { config } = domainInfo ?? {};

    const isHome = pathname === '/';
    const isCheckout = pathname.startsWith('/checkout/');
    const isEnabled = config?.features?.mobileVisualBanner?.enable;

    if (!isEnabled || (!isHome && !isCheckout)) return null;

    return (
        <section className="bg-linear-to-t from-[#4334F0] to-[#8461E6] text-white">
            {/* Desktop layout */}
            <div className="hidden md:flex items-center max-w-360 mx-auto overflow-hidden">
                <div className="flex items-center gap-6 pl-6 lg:pl-20 pt-9 pb-9.75 shrink-0">
                    <Image
                        src={phoneIconDesktop2x}
                        alt=""
                        width={31}
                        height={63}
                        aria-hidden="true"
                    />
                </div>
                <div className="flex flex-col px-6 py-6 shrink-0 gap-1.5">
                    <p className="text-xl font-bold leading-none">
                        {t('experience_gigsberg_on_mobile')}
                    </p>
                    <p className="text-sm opacity-90 max-w-87.5">
                        {t('mobile_visual_description')}
                    </p>
                </div>
                <div className="flex flex-col gap-2.25 pt-7.75 pb-9.5 pl-11.25 pr-11.25 shrink-0">
                    <p className="text-xl font-bold leading-none">{t('download_the_app')}</p>
                    <div className="flex items-center gap-2.75">
                        <a
                            href="https://play.google.com/store/apps/details?id=com.luup.gigsberg"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Image
                                src={googlePlayDesktop2x}
                                alt="Google Play"
                                width={80}
                                height={32}
                            />
                        </a>
                        <a
                            href="https://apps.apple.com/us/app/gigsberg/id6760895216"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Image src={appStoreDesktop2x} alt="App Store" width={80} height={32} />
                        </a>
                    </div>
                </div>
                <div className="pr-20 shrink-0 ml-auto">
                    <Image
                        src={phoneBannerDesktop2x}
                        alt=""
                        width={555}
                        height={140}
                        aria-hidden="true"
                    />
                </div>
            </div>

            {/* Mobile layout */}
            <div className="md:hidden flex flex-col items-center pl-6 pr-5.5 pt-4.75 pb-5 gap-3">
                <div className="flex items-start gap-2.75 w-full">
                    <Image
                        src={phoneIconMobile2x}
                        alt=""
                        width={31}
                        height={63}
                        aria-hidden="true"
                        className="shrink-0"
                    />
                    <p className="text-sm leading-4.5 opacity-90">
                        {t('mobile_visual_description')}
                    </p>
                </div>
                <div className="flex flex-col items-center gap-5 w-full">
                    <p className="text-xl leading-none font-bold">{t('download_the_app')}</p>
                    <div className="flex items-center gap-11.25">
                        <a
                            href="https://play.google.com/store/apps/details?id=com.luup.gigsberg"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Image
                                src={googlePlayMobile2x}
                                alt="Google Play"
                                width={150}
                                height={40}
                            />
                        </a>
                        <a
                            href="https://apps.apple.com/us/app/gigsberg/id6760895216"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Image src={appStoreMobile2x} alt="App Store" width={150} height={40} />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeaderMobileVisualBanner;
