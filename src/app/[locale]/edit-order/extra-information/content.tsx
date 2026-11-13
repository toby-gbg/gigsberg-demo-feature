'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQueryStates } from 'nuqs';

import { AdditionalInformationResponse } from '@/interfaces/AdditionalInformation';
import { useLazyExtraInfoSchema } from '@/swr/features/orders';

import { useUser } from '@/providers/UserProvider';
import useIntlRouter from '@/hooks/useIntlRouter';

import ExtraInformationForm from '@/components/ExtraInformationForm';
import Link from '@/components/Link';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toast';

import { editExtraInfoSearchParamsParsers } from './_searchParams';
import InfoAdded from './information-added';

const submittedStorageKey = (token: string, orderId: number | string) =>
    `extra-info-submitted:${token}:${orderId}`;

const isExtraInfoSubmitted = (token: string, orderId: number | string): boolean => {
    if (typeof window === 'undefined' || !token || !orderId) return false;
    try {
        return sessionStorage.getItem(submittedStorageKey(token, orderId)) === '1';
    } catch {
        return false;
    }
};

const markExtraInfoSubmitted = (token: string, orderId: number | string) => {
    if (typeof window === 'undefined' || !token || !orderId) return;
    try {
        sessionStorage.setItem(submittedStorageKey(token, orderId), '1');
    } catch {}
};

const LOGIN_RETURN_KEY = 'extra-info-login-return';

const EditOrderExtraInfo = () => {
    const t = useTranslations();
    const router = useIntlRouter();
    const pathname = usePathname();
    const isLoginOpen = /\/login\/?$/.test(pathname ?? '');

    // nuqs search params
    const [{ token, order_id: orderId }] = useQueryStates(editExtraInfoSearchParamsParsers);

    // states
    const [isInfoAdded, setIsAddedInfo] = useState(false);

    const user = useUser();

    // states
    const [extraInfo, setExtraInfo] = useState<AdditionalInformationResponse | null>(null);
    const [accessDenied, setAccessDenied] = useState(false);
    const wasAuthenticatedRef = useRef(Boolean(user));
    const promptedLoginRef = useRef(false);
    const fetchedForRef = useRef<string | null>(null);
    const deniedToastRef = useRef(false);

    //  data
    const {
        trigger: fetchExtraInfoSchema,
        isMutating: isLoading,
        error,
    } = useLazyExtraInfoSchema({
        onSuccess: (data) => setExtraInfo(data),
        onError: () => setAccessDenied(true),
    });

    const alreadySubmitted = Boolean(token && orderId && isExtraInfoSubmitted(token, orderId));
    const showAccessDenied = accessDenied || Boolean(error);

    // A 403 leaves extraInfo empty. That used to satisfy the loading gate forever,
    // so the denial screen and toast never appeared.
    useEffect(() => {
        if (!showAccessDenied || deniedToastRef.current) return;
        deniedToastRef.current = true;

        toast.add({ title: t('extra_info_access_denied'), type: 'error', priority: 'high' });
    }, [showAccessDenied, t]);

    // effects
    useEffect(() => {
        if (user) {
            // Login is an intercepted route, so this page stays mounted. Wait for
            // the hard redirect before fetching, or a 403 toast fires twice.
            if (isLoginOpen) return;

            wasAuthenticatedRef.current = true;
            promptedLoginRef.current = false;

            const fetchKey = `${user.id}:${orderId}`;
            if (fetchedForRef.current !== fetchKey) {
                fetchedForRef.current = fetchKey;
                setAccessDenied(false);
                setExtraInfo(null);
                setIsAddedInfo(false);
                deniedToastRef.current = false;
                fetchExtraInfoSchema(orderId).catch(() => undefined);
            }
            return;
        }

        // Logged-out open and logout both show login once. Close still goes home.
        if (promptedLoginRef.current) return;
        promptedLoginRef.current = true;

        if (wasAuthenticatedRef.current) {
            wasAuthenticatedRef.current = false;
            setAccessDenied(false);
            setExtraInfo(null);
            setIsAddedInfo(false);
            deniedToastRef.current = false;
            fetchedForRef.current = null;
        }

        try {
            sessionStorage.setItem(
                LOGIN_RETURN_KEY,
                `${window.location.pathname}${window.location.search}`
            );
        } catch {}
        router.push('/login?closeTo=home');
    }, [user, orderId, fetchExtraInfoSchema, router, isLoginOpen]);

    const hasSchema = Boolean(extraInfo?.extraInfoSchema?.fields?.length);

    // Non-buyers must not see the form, the skeleton, or the "info added" screen.
    if (showAccessDenied) {
        return (
            <div className="flex flex-col justify-center items-center p-6 h-97.25 text-center">
                <h1 className="font-bold text-primary text-3xl">{t('extra_info_access_denied')}</h1>
                <Link href="/">
                    <Button className="mt-6">{t('back_to_homepage')}</Button>
                </Link>
            </div>
        );
    }

    if (alreadySubmitted || isInfoAdded || (extraInfo && !hasSchema)) {
        return <InfoAdded />;
    }

    if (!user || isLoginOpen || isLoading || !extraInfo) {
        return (
            <div className="flex justify-center items-center bg-default-100 m-auto p-14 max-w-4xl min-h-84">
                <div className="flex flex-col bg-white p-4 rounded-md md:rounded-2xl size-full overflow-hidden">
                    <Skeleton className="rounded-md md:rounded-2xl w-full h-76" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center bg-default-100 m-auto p-5 md:p-14 max-w-4xl min-h-84">
            <div className="flex flex-col bg-white p-4 rounded-md md:rounded-2xl size-full overflow-hidden">
                <ExtraInformationForm
                    additionalInformation={extraInfo}
                    orderId={orderId}
                    ticketCount={extraInfo?.ticketQuantity ?? 1}
                    token={token}
                    onSuccess={() => {
                        markExtraInfoSubmitted(token, orderId);
                        setIsAddedInfo(true);
                    }}
                />
            </div>
        </div>
    );
};

export default EditOrderExtraInfo;
