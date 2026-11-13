import Headers from '@/lib/headers';

import DownloadAppBanner from './_components/DownloadAppBanner';

export default async function MobileDownloadBannerSection() {
    const domainInfo = await Headers.getDomainInfo();
    if (!domainInfo.config.features?.mobileDownloadBannerHomepage) return null;

    return <DownloadAppBanner />;
}
