export interface DomainConfig {
    domain: string;
    environment: string;
    protocol: 'https' | 'http';
    isProduction: boolean;
}

export const DOMAIN_CONFIGS: Record<string, DomainConfig[]> = {
    dev: [],
    stage: [],
    'pre-prod': [],
    prod: [
        {
            domain: 'gigsberg.ch',
            environment: 'prod',
            protocol: 'https',
            isProduction: true,
        },
        {
            domain: 'gigsberg.co.uk',
            environment: 'prod',
            protocol: 'https',
            isProduction: true,
        },
        {
            domain: 'gigsberg.com',
            environment: 'prod',
            protocol: 'https',
            isProduction: true,
        },
        {
            domain: 'tickets.marca.gigsberg.com',
            environment: 'prod',
            protocol: 'https',
            isProduction: true,
        },
    ],
};

export const getDomainsForEnvironment = (environment: string): DomainConfig[] => {
    return DOMAIN_CONFIGS[environment] || [];
};

export const getAllDomains = (): DomainConfig[] => {
    return Object.values(DOMAIN_CONFIGS).flat();
};
