import { Fragment } from 'react/jsx-runtime';
import { getTranslations } from 'next-intl/server';

import Link from '@/components/Link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

import { ticketFeedbackSearchParamsCache } from './_searchParams';

export default async function FeedbackConfirmationPage({
    searchParams,
}: PageProps<'/[locale]/feedback/get-ticket-confirmation-feedback'>) {
    const [{ ticket_accepted }, t] = await Promise.all([
        ticketFeedbackSearchParamsCache.parse(searchParams),
        getTranslations(),
    ]);

    return (
        <Fragment>
            {ticket_accepted === '1' ? (
                <div className="py-10 px-4 grid place-items-center">
                    <Card className="bg-white shadow-lg rounded-2xl max-w-2xl w-full overflow-hidden text-center flex items-center p-8 space-y-6">
                        <p className="text-3xl font-semibold text-main-end">
                            {t('feedback_confirmation_success_message')}
                        </p>
                        <p>{t('feedback_confirmation_success_submessage')}</p>
                        <Link href="/">
                            <Button>{t('back_to_events')}</Button>
                        </Link>
                    </Card>
                </div>
            ) : (
                <div className="py-10 px-4 grid place-items-center">
                    <Card className="bg-white shadow-lg rounded-2xl max-w-2xl w-full overflow-hidden text-center flex items-center p-8 space-y-6">
                        <p className="text-3xl font-semibold text-main-end">
                            {t('feedback_support_request_message')}
                        </p>
                        <p>{t('feedback_support_request_submessage')}</p>
                        <Link href="/">
                            <Button>{t('back_to_events')}</Button>
                        </Link>
                    </Card>
                </div>
            )}
        </Fragment>
    );
}
