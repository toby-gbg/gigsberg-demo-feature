'use client';

import { ReactNode } from 'react';
import { catchError, type ErrorInfo } from 'next/error';

function ErrorFallback({ fallback }: { fallback: ReactNode }, { error }: ErrorInfo) {
    console.error('ErrorBoundary', error);

    return fallback;
}

export default catchError(ErrorFallback);
