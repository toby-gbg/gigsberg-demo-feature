import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import AppStore from '@/assets/img/download-modal/AppStore_Badge.png';
import GigsbergMobileAds from '@/assets/img/download-modal/GigsbergMobileAds.webp';
import GGPlayStore from '@/assets/img/download-modal/GooglePlay_Badge.png';
import Headers from '@/lib/headers';

async function DownloadRewardsAppAd() {
    const [t, domainInfo] = await Promise.all([getTranslations(), Headers.getDomainInfo()]);

    if (!domainInfo?.config?.features?.showDownloadAppModal) return null;

    const title = t.has('download_the_gigsberg_app') ? (
        t.rich('download_the_gigsberg_app', {
            b: (chunks) => <b>{chunks}</b>,
        })
    ) : (
        <>
            Download the <b>Gigsberg app</b>
        </>
    );

    return (
        <aside className="relative bg-linear-to-t from-[#4334F0] to-[#8461E6] shadow-2xl rounded-lg w-full aspect-[33/16] overflow-hidden">
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none [mask-image:linear-gradient(to_bottom,#000_0%,#000_25%,transparent_52%)]"
            >
                <Image
                    src={GigsbergMobileAds}
                    alt=""
                    sizes="(min-width: 1280px) 244px, (min-width: 768px) 42vw, 70vw"
                    className="-top-[6%] left-[3%] absolute w-[70%] h-auto"
                />
            </div>

            <div className="right-0 bottom-0 left-0 z-10 absolute flex flex-col gap-1.5 p-3">
                <p className="text-[17px] text-white leading-tight">{title}</p>

                <div className="flex items-center gap-2">
                    <a
                        href="https://play.google.com/store/apps/details?id=com.luup.gigsberg"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex justify-center items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#4334F0] h-10 hover:scale-[1.02] active:scale-[0.98] transition-transform"
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
                        className="inline-flex justify-center items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#4334F0] h-10 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    >
                        <Image
                            src={AppStore}
                            alt="Download on the App Store"
                            width={116}
                            height={40}
                            className="w-auto h-full object-contain"
                        />
                    </a>
                </div>
            </div>
        </aside>
    );
}

export default DownloadRewardsAppAd;
