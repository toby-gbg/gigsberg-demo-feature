'use client';

import { FC } from 'react';
import dynamic from 'next/dynamic';
import { useSelectedLayoutSegment } from 'next/navigation';

const WhatsappButton = dynamic(() => import('./WhatsappButtonContent'), {
    ssr: false,
    loading: () => null, // prevents layout shift
});

const WhatsappChat: FC = () => {
    const segment = useSelectedLayoutSegment();

    // don't even load the dynamic component on redirection page
    if (segment === 'redirection') return null;

    return <WhatsappButton />;
};

// extracted into separate file/component for better caching & tree-shaking
export default WhatsappChat;
