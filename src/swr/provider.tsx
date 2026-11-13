'use client';

import { ReactNode } from 'react';
import { SWRConfig, SWRConfiguration } from 'swr';

const swrDefaultConfig: SWRConfiguration = {
    errorRetryCount: 3,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
};

export function SWRProvider({ children }: { children: ReactNode }) {
    return <SWRConfig value={swrDefaultConfig}>{children}</SWRConfig>;
}
