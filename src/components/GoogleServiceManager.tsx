'use client';

import { FC, Fragment } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';
import Script from 'next/script';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';

interface GoogleManagerProps {
    ga4_id?: string | null;
    gtm_id?: string | null;
}

const GoogleServiceManager: FC<GoogleManagerProps> = ({ ga4_id, gtm_id }) => {
    const segment = useSelectedLayoutSegment();

    const isRedirection = segment === 'redirection';

    if (isRedirection || (!ga4_id && !gtm_id)) return null;

    return (
        <Fragment>
            {/* Inject a script to ensure default consent is set */}
            <Script id="google-consent-default" strategy="beforeInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('consent', 'default', {
                    'ad_storage': 'denied',
                    'analytics_storage': 'denied',
                    'ad_user_data': 'denied',
                    'ad_personalization': 'denied',
                    'wait_for_update': 1500
                    });
                `}
            </Script>
            {ga4_id && <GoogleAnalytics gaId={ga4_id} />}
            {gtm_id && <GoogleTagManager gtmId={gtm_id} />}
        </Fragment>
    );
};

export default GoogleServiceManager;
