import { all } from 'better-all';

import Headers from '@/lib/headers';

import MainLogoClient from './MainLogoClient';

export default async function MainLogo() {
    const { domainInfo } = await all({
        async domainInfo() {
            return Headers.getDomainInfo();
        },
    });

    return <MainLogoClient config={domainInfo?.config} />;
}
