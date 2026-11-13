'use client';

import { useEffectOnce } from 'react-use';

import { Spinner } from '@/components/ui/Spinner';

export default function Loading() {
    // Auto scroll to top
    useEffectOnce(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
    });

    return (
        <div className="flex flex-col justify-center items-center min-h-115">
            <Spinner className="text-main-start" />
        </div>
    );
}
