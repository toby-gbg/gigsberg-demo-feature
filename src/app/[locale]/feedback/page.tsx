import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { fallbackTranslation } from '@/utils/common';

import FeedbackView from './_components/FeedbackView';

const FeedbackPage = async () => {
    const t = await getTranslations();

    return (
        <Suspense
            fallback={
                <div className="py-10 text-center">
                    {fallbackTranslation(t('loading'), 'loading', 'Loading...')}
                </div>
            }
        >
            <FeedbackView />
        </Suspense>
    );
};

export default FeedbackPage;
