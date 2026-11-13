import { WhiteLabelConfig } from './WhiteLabel';

export interface DomainInfo {
    domain: string;
    hostname: string;
    subdomain: string | null;
    publicSuffix: string;
    domainWithoutSuffix: string;
    websiteName: string;
    defaultLocale: string;
    isStage: boolean;
    isProtectedDomain: boolean;
    config: WhiteLabelConfig;
}
