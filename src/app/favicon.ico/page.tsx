import { FC } from 'react';
import { permanentRedirect } from 'next/navigation';

import Headers from '@/lib/headers';
import { websiteApi } from '@/services/server/website';

const Page: FC = async () => {
    const domainInfo = await Headers.getDomainInfo();

    if (domainInfo?.websiteName) {
        const web = await websiteApi.getWebsite();
        if (web?.favicon && !web.favicon.endsWith(`${domainInfo.hostname}/favicon.ico`)) {
            return permanentRedirect(web.favicon);
        }
    }
    // Fallback favicon of gigsberg.com
    return permanentRedirect('/gigsberg.ico');
};

export default Page;
