'use client';

import { useRouter as useNextIntlRouter } from '@/i18n/routing';
import { useRouter } from '@bprogress/next/app';

const useIntlRouter = () => {
    const router = useRouter({
        customRouter: useNextIntlRouter,
    });

    return router;
};

export default useIntlRouter;
