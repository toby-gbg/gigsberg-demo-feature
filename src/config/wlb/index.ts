import { Domain, WhiteLabelConfig } from '@/interfaces/WhiteLabel';
import { DOMAINS } from '@/constants/domains';

import { analyticsConfigs } from './analytics';
import { customCssConfigs } from './customCss';
import { featuresConfigs } from './features';
import { paymentConfigs } from './payment';
import { seoConfigs } from './seo';

export type { Domain } from '@/interfaces/WhiteLabel';

export const WHITE_LABEL_CONFIG: Record<Domain, Partial<WhiteLabelConfig>> = Object.fromEntries(
    DOMAINS.map((domain) => [
        domain,
        {
            payment: paymentConfigs[domain],
            seo: seoConfigs[domain],
            features: featuresConfigs[domain],
            analytics: analyticsConfigs[domain],
            customCss: customCssConfigs[domain],
        },
    ])
) as Record<Domain, Partial<WhiteLabelConfig>>;
