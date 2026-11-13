'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryStates } from 'nuqs';

import Link from '@/components/Link';
import { Button } from '@/components/ui/Button';

import { offerActionSearchParamsParsers } from '../_searchParams';

type OfferAction = 'accept' | 'reject';

type Props = {
    action: OfferAction;
};

type Status = 'loading' | 'success' | 'error' | 'missing';

export default function OfferActionView({ action }: Props) {
    const t = useTranslations();
    const [{ token, offer_id: offerId }] = useQueryStates(offerActionSearchParamsParsers);
    const [status, setStatus] = useState<Status>('loading');
    const ranRef = useRef(false);

    useEffect(() => {
        if (ranRef.current) return;
        if (!token || !offerId) {
            setStatus('missing');
            return;
        }

        ranRef.current = true;

        // Same-origin proxy — avoids browser SSL/CORS issues talking to Fastify directly.
        const endpoint = `/api/offers/${offerId}/${action}?token=${encodeURIComponent(token)}`;

        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: '{}',
        })
            .then(async (response) => {
                if (!response.ok) throw new Error(`Offer ${action} failed`);
                setStatus('success');
            })
            .catch(() => setStatus('error'));
    }, [action, offerId, token]);

    const title =
        status === 'loading'
            ? t('offer_response_processing')
            : status === 'missing' || status === 'error'
              ? t('offer_response_error_title')
              : action === 'accept'
                ? t('offer_accepted_title')
                : t('offer_rejected_title');

    const description =
        status === 'loading'
            ? null
            : status === 'missing'
              ? t('offer_response_missing_params')
              : status === 'error'
                ? t('offer_response_error_description')
                : t('offer_response_recorded_description');

    return (
        <div className="flex flex-col items-center justify-center p-6 text-center min-h-97.25">
            <div className="w-full max-w-lg rounded-2xl border border-[#e3eaef] bg-white p-8 shadow-lg">
                <div className="mb-6 rounded-xl bg-[#43ace1] px-5 py-4 text-left">
                    <h1 className="text-2xl font-bold text-white">{title}</h1>
                </div>
                {description ? <p className="text-[#515f6a]">{description}</p> : null}
                {status !== 'loading' ? (
                    <Link href="/">
                        <Button className="mt-6">{t('back_to_homepage')}</Button>
                    </Link>
                ) : (
                    <div className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-2 border-[#43ace1] border-t-transparent" />
                )}
            </div>
        </div>
    );
}
