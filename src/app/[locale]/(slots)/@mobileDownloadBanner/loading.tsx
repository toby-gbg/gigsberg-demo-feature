import Headers from '@/lib/headers';

import DownloadAppBannerSkeleton from './_components/DownloadAppBannerSkeleton';

export default async function MobileDownloadBannerLoading() {
    const domainInfo = await Headers.getDomainInfo();
    if (!domainInfo.config.features?.mobileDownloadBannerHomepage) return null;

    return <DownloadAppBannerSkeleton />;
}
