import { Fragment } from 'react';
import { getTranslations } from 'next-intl/server';

import { CopyToClipboard } from '@/components/CopyToClipboard';
import Link from '@/components/Link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const COUPON_VALUE = '£10';
const COUPON_CODE = 'RC347563843';
const COUPON_VALID_TIME = 30;

export default async function FeedbackThankYouPage() {
    const t = await getTranslations();

    return (
        <Fragment>
            <div className="px-4 py-10 sm:px-6 lg:px-20">
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card className="flex items-center space-y-6 overflow-hidden rounded-2xl bg-white p-8 text-center">
                        <p className="text-main-start text-3xl font-semibold">
                            {t('feedback_thank_you_title')}
                        </p>
                        <p className="text-gray-600 text-base">{t('feedback_thank_you_message')}</p>
                        <Link href="/">
                            <Button>{t('back_to_events')}</Button>
                        </Link>
                    </Card>

                    <Card className="border-main-start/30 flex flex-col items-center space-y-4 overflow-hidden rounded-2xl border-2 border-dashed bg-white p-8 text-center">
                        <p className="text-sm font-medium tracking-wider text-gray-500 uppercase">
                            {t('feedback_coupon_title')}
                        </p>

                        <p className="text-main-start text-7xl leading-none font-bold">
                            {COUPON_VALUE}
                        </p>

                        <p className="-mt-2 text-lg text-gray-600">
                            {t('feedback_coupon_subtitle')}
                        </p>

                        <div className="mt-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
                            <span className="font-mono text-lg font-bold tracking-wider text-gray-800">
                                {COUPON_CODE}
                            </span>
                            <CopyToClipboard text={COUPON_CODE} />
                        </div>

                        <p className="text-sm text-gray-400">
                            {t('feedback_coupon_valid_days', { days: COUPON_VALID_TIME })}
                        </p>
                    </Card>
                </div>
            </div>
        </Fragment>
    );
}
