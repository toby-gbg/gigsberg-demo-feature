import { createMetadataConfig, createOpenGraphConfig } from '@/config/translations/metadata';
import { Domain, WHITE_LABEL_CONFIG } from '@/config/wlb';

import { GIGSBERG_SOCIAL } from './seo';

export function getMetadataForDomain(hostname?: string) {
    const config = hostname ? WHITE_LABEL_CONFIG[hostname as Domain] : undefined;
    const seoConfig = config?.seo;
    if (!seoConfig) {
        const defaultConfig = WHITE_LABEL_CONFIG['www.gigsberg.com']?.seo;
        return {
            social: defaultConfig?.social || { twitter: GIGSBERG_SOCIAL.twitter },
            metadata: defaultConfig?.metadata || createMetadataConfig(),
            openGraph: defaultConfig?.openGraph || createOpenGraphConfig(),
        };
    }
    return seoConfig;
}
