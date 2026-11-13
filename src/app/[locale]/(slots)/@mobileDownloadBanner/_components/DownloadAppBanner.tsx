import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import desktopAppStore from '@/assets/img/home-app-banner/desktop-app-store.webp';
import desktopBackground from '@/assets/img/home-app-banner/desktop-background.webp';
import desktopGooglePlay from '@/assets/img/home-app-banner/desktop-google-play.webp';
import desktopPhone from '@/assets/img/home-app-banner/desktop-phone.webp';
import mobileAppStore from '@/assets/img/home-app-banner/mobile-app-store.webp';
import mobileBackground from '@/assets/img/home-app-banner/mobile-background.webp';
import mobileGooglePlay from '@/assets/img/home-app-banner/mobile-google-play.webp';
import mobilePhone from '@/assets/img/home-app-banner/mobile-phone.webp';
import { fallbackTranslation } from '@/utils/common';

const DownloadAppBanner = async () => {
    const t = await getTranslations();
    const title = t.has('download_the_app_main_title') ? (
        t.rich('download_the_app_main_title', { br: () => <br className="md:hidden" /> })
    ) : (
        <>
            Download & <br className="md:hidden" />
            Get £5 Off
        </>
    );
    const description = t.has('download_the_app_main_text') ? (
        t.rich('download_the_app_main_text', { strong: (chunks) => <strong>{chunks}</strong> })
    ) : (
        <>
            Download the <strong>Gigsberg Rewards app</strong> and get <strong>£5*</strong> off your
            next ticket purchase. Plus, earn cashback rewards every time you and your friends buy
            through the app.
        </>
    );
    const note = fallbackTranslation(
        t.has('download_the_app_note') ? t('download_the_app_note') : '',
        'download_the_app_note',
        '*£5 bonus will appear in your rewards wallet after you have completed your profile.'
    );

    return (
        <section
            aria-labelledby="download-app-banner-title"
            className="relative isolate overflow-hidden rounded-lg bg-[#dcecff] text-black"
        >
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <Image
                    src={mobileBackground}
                    alt="Mobile background"
                    fill
                    sizes="100vw"
                    className="object-fill md:hidden"
                />
                <Image
                    src={desktopBackground}
                    alt="Desktop background"
                    fill
                    sizes="(min-width: 1440px) 1400px, 100vw"
                    className="hidden object-fill md:block"
                />
            </div>

            <div className="absolute end-0 top-4 -z-10 w-[35.3%] pointer-events-none mask-[linear-gradient(to_bottom,black_20%,transparent_80%)] rtl:-scale-x-100 md:end-[14%] md:top-auto md:bottom-0 md:w-[32%] md:max-w-84.75 md:mask-none md:max-[1025px]:start-[80%] md:max-[1025px]:end-auto md:max-[1025px]:-translate-x-1/2 rtl:md:max-[1025px]:translate-x-1/2">
                <Image
                    src={mobilePhone}
                    alt="Mobile phone"
                    width={133}
                    height={254}
                    sizes="35vw"
                    className="h-auto w-full md:hidden"
                />
                <Image
                    src={desktopPhone}
                    alt="Desktop phone"
                    width={339}
                    height={281}
                    sizes="(min-width: 1060px) 339px, 32vw"
                    className="hidden h-auto w-full md:block"
                />
            </div>

            <div className="flex min-h-90.5 flex-col gap-5 p-4 min-[473px]:min-h-0 md:gap-4 md:px-10 md:py-4 lg:min-h-73.5 lg:gap-5 lg:py-6">
                <div className="flex w-[70%] flex-col gap-6 md:w-[60%] md:max-w-112.5 md:gap-4 lg:w-[48%]">
                    <h2
                        id="download-app-banner-title"
                        className="text-[28px] min-[360px]:text-[36px] md:text-[32px] lg:text-[36px] font-bold leading-[1.15] text-[#1565c0]"
                    >
                        {title}
                    </h2>
                    <p className="text-sm leading-tight">{description}</p>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href="https://play.google.com/store/apps/details?id=com.luup.gigsberg"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1565c0] hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    >
                        <Image
                            src={mobileGooglePlay}
                            alt="Get it on Google Play"
                            width={162}
                            height={48}
                            className="h-auto w-full max-w-40.5 md:hidden"
                        />
                        <Image
                            src={desktopGooglePlay}
                            alt="Get it on Google Play"
                            width={162}
                            height={48}
                            className="hidden h-auto w-full max-w-40.5 md:block"
                        />
                    </a>
                    <a
                        href="https://apps.apple.com/us/app/gigsberg/id6760895216"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1565c0] hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    >
                        <Image
                            src={mobileAppStore}
                            alt="Download on the App Store"
                            width={139}
                            height={48}
                            className="h-auto w-full max-w-34.75 md:hidden"
                        />
                        <Image
                            src={desktopAppStore}
                            alt="Download on the App Store"
                            width={139}
                            height={48}
                            className="hidden h-auto w-full max-w-34.75 md:block"
                        />
                    </a>
                </div>

                <p className="mt-auto text-sm italic leading-tight md:max-w-112.5">{note}</p>
            </div>
        </section>
    );
};

export default DownloadAppBanner;
