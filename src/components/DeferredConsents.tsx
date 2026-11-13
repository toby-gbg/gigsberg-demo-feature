'use client';

import { FC, useEffect, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';

import { windowIdleCallback } from '@/utils/common';

import MarfeelSDK from './MarfeelSDK';
import Tealium from './Tealium';

interface DeferredConsentsProps {
    analytics?: {
        tealium?: boolean;
        marfeel?: boolean;
    };
    websiteName?: string;
}

const DeferredConsents: FC<DeferredConsentsProps> = ({ analytics, websiteName }) => {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const handle = windowIdleCallback(() => setReady(true), 3000);
        return handle;
    }, []);

    if (!ready) return null;

    return (
        <Fragment>
            {analytics?.tealium && <Tealium />}
            {analytics?.marfeel && <MarfeelSDK name={websiteName ?? ''} />}
        </Fragment>
    );
};

export default DeferredConsents;
