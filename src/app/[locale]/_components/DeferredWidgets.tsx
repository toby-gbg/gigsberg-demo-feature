'use client';

import { FC, Suspense, useEffect, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import dynamic from 'next/dynamic';

import { windowIdleCallback } from '@/utils/common';

import DebugToolbar from '@/components/DebugToolbar';

const AffiliateTracker = dynamic(() => import('./AffiliateTracker'), {
    ssr: false,
});

const LiveChat = dynamic(() => import('./LiveChat'), {
    ssr: false,
});

const WhatsappChat = dynamic(() => import('./WhatsappChat'), {
    ssr: false,
});

const ScrollToTopButton = dynamic(() => import('@/components/ScrollToTopButton'), {
    ssr: false,
});

const InternationalEventModal = dynamic(
    () => import('@/components/modals/InternationalEventModal'),
    {
        ssr: false,
    }
);

const EventNotifyMeModal = dynamic(() => import('@/components/modals/EventNotifyMeModal'), {
    ssr: false,
});

interface DeferredWidgetsProps {
    referer?: string;
    locale?: string;
    isDebug: boolean;
}

const DeferredsWidgets: FC<DeferredWidgetsProps> = ({ referer, isDebug, locale }) => {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const handle = windowIdleCallback(() => setReady(true), 3000);
        return handle;
    }, []);

    if (!ready) return null;

    return (
        <Fragment>
            <Suspense>
                <AffiliateTracker referer={referer} />
                <WhatsappChat />
                <LiveChat />
                <ScrollToTopButton />
                <InternationalEventModal />
                <EventNotifyMeModal />
                {isDebug && <DebugToolbar locale={locale} />}
            </Suspense>
        </Fragment>
    );
};

export default DeferredsWidgets;
