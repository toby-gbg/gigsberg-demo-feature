'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryStates } from 'nuqs';

import { useSubmitFeedbackMutation } from '@/swr/features/feedback';

import useIntlRouter from '@/hooks/useIntlRouter';

import InteractiveStarRating from '@/components/InteractiveStarRating';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { toast } from '@/components/ui/Toast';

import { feedbackSearchParamsParsers } from '../_searchParams';

const FeedbackView = () => {
    const t = useTranslations();
    const router = useIntlRouter();
    const [{ rate: defaultRate, t: token }] = useQueryStates(feedbackSearchParamsParsers);
    const [rate, setRate] = useState(defaultRate);
    const [comment, setComment] = useState('');
    const { trigger: submitFeedback, isMutating: isLoading } = useSubmitFeedbackMutation({
        onSuccess: (data) => {
            if (data?.redirectUrl) {
                window.location.href = data.redirectUrl;
            } else {
                router.push(`/feedback/thank-you`);
            }
        },
        onError: () => toast.add({ title: t('generic_error'), type: 'error' }),
    });

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!token || rate === 0) return;

        submitFeedback({ token, rate, comment });
    };

    if (!token) {
        return (
            <div className="grid place-items-center px-4 py-10">
                <Card className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white p-8 text-center shadow-lg">
                    <p className="text-xl font-semibold text-gray-800">
                        {t('feedback_invalid_token')}
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid place-items-center px-4 py-10">
            <Card className="w-full max-w-2xl space-y-6 overflow-hidden rounded-2xl bg-white p-8 shadow-lg">
                <h1 className="text-main-start text-center text-3xl font-semibold">
                    {t('feedback_title')}
                </h1>
                <p className="text-center text-gray-600">{t('feedback_subtitle')}</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-lg font-medium text-gray-800">
                            {t('feedback_rate_label')}
                        </label>
                        <InteractiveStarRating value={rate} onChange={setRate} />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-lg font-medium text-gray-800">
                            {t('feedback_comment_label')}{' '}
                            <span className="text-base text-gray-600">({t('optional')})</span>
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={t('feedback_comment_placeholder')}
                            rows={4}
                            className="focus:ring-main-start w-full resize-none rounded-lg border border-gray-300 p-3 text-gray-800 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:outline-none"
                        />
                    </div>

                    <div className="flex justify-center">
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            disabled={!Boolean(rate) || isLoading}
                        >
                            {t('feedback_submit')}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default FeedbackView;
