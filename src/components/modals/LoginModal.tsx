// components/modals/LoginModal.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { isEmail } from 'validator';

import type { Login } from '@/interfaces/Auth';
import GoogleAnalyticsTracker from '@/lib/seo/GoogleAnalyticsTracker';
import { markAuthExitStarted, navigateAuthExit, toPublicLocalePath } from '@/utils/authNavigation';
import GoogleEventMapper from '@/utils/GoogleEventMapper';
import { useLoginMutation } from '@/swr/features/auth';

import { useUserActions } from '@/providers/UserProvider';

import FloatingInput from '@/components/FloatingInput';
import Link from '@/components/Link';
import { Button } from '@/components/ui/Button';
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Dialog';
import { toast } from '@/components/ui/Toast';

const EXTRA_INFO_LOGIN_RETURN_KEY = 'extra-info-login-return';

export default function LoginModal() {
    const [isOpen, setIsOpen] = useState(true);
    const [initialEmail, setInitialEmail] = useState('');
    const closingRef = useRef(false);
    // Parallel-route slot can leave the popup mounted after state says closed.
    const modalRef = useRef<HTMLDivElement>(null);

    const t = useTranslations();
    const locale = useLocale();
    const searchParams = useSearchParams();
    const { setCredentials } = useUserActions();

    const { control, reset, handleSubmit, setFocus } = useForm<Login>();

    const closeModal = () => {
        if (isOpen || modalRef.current) setIsOpen(false);
    };

    const dismiss = () => {
        if (closingRef.current) return;
        closingRef.current = true;

        sessionStorage.removeItem('storage-email');
        closeModal();

        // Extra-info link: dismissing the popup should leave the flow, not reopen it.
        if (searchParams.get('closeTo') === 'home') {
            try {
                sessionStorage.removeItem(EXTRA_INFO_LOGIN_RETURN_KEY);
            } catch {}
        }

        // Closing must not follow an auth-wall redirectUrl. For Sell tickets
        // that target is /sell-ticket, and middleware would open this form again.
        // A safe redirectUrl (header login on a public page) is still followed.
        // Never history.back() — the previous entry may be an external site.
        // closeTo=home makes exitPath return null, so this lands on the homepage.
        navigateAuthExit(locale, searchParams);
    };

    const { trigger: triggerLogin, isMutating: isLoading } = useLoginMutation({
        onSuccess: (data) => {
            setCredentials(data);

            const userProvidedData = GoogleEventMapper.mapUserProvidedData(data.user);
            GoogleAnalyticsTracker.triggerUPDSubmit(userProvidedData);

            toast.add({
                title: t('auth_success'),
                type: 'success',
            });
            sessionStorage.removeItem('storage-email');
            // Stop onOpenChange from running dismiss() and navigating away
            // from the page the user just signed in to reach.
            closingRef.current = true;
            markAuthExitStarted();
            closeModal();

            // Full load drops the success toast so the denial toast can use this same UI.
            if (searchParams.get('closeTo') === 'home') {
                let returnTo: string | null = null;
                try {
                    returnTo = sessionStorage.getItem(EXTRA_INFO_LOGIN_RETURN_KEY);
                    sessionStorage.removeItem(EXTRA_INFO_LOGIN_RETURN_KEY);
                } catch {}
                if (returnTo?.startsWith('/') && !returnTo.startsWith('//')) {
                    window.location.href = toPublicLocalePath(returnTo);
                    return;
                }
            }

            const rawRedirectUrl = searchParams.get('redirectUrl');

            if (rawRedirectUrl) {
                const redirectTarget = decodeURIComponent(rawRedirectUrl);
                // Relative targets may carry an internal locale (`/en-GB`).
                // Absolute targets are left as-is (header and middleware only set paths).
                const target =
                    redirectTarget.startsWith('/') && !redirectTarget.startsWith('//')
                        ? toPublicLocalePath(redirectTarget)
                        : redirectTarget;

                // hard navigation clears parallel route slot state and re-executes server components
                window.location.href = target;
            } else {
                // New tab / cross-origin referrer has nowhere safe to go back to.
                // markAuthExitStarted() above blocked the dismiss exit.
                navigateAuthExit(locale, null, { force: true });
            }
        },
        onError: (error) =>
            toast.add({
                title: t(error.data.errorKey),
                type: 'error',
                priority: 'high',
            }),
    });

    useEffect(() => {
        reset({
            email: initialEmail ?? '',
            password: '',
        });

        setTimeout(() => {
            setFocus(initialEmail ? 'password' : 'email');
        }, 50);
    }, [initialEmail, reset, setFocus]);

    useEffect(() => {
        const resettingEmail = sessionStorage.getItem('storage-email');
        setInitialEmail(resettingEmail || '');
    }, []);

    const onSubmit = handleSubmit((data) => triggerLogin(data));

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (isLoading) return;
                if (!open) dismiss();
            }}
        >
            {/* prevent Radix focus restoration from jumping down the page on close */}
            <DialogContent popupProps={{ finalFocus: false, ref: modalRef }}>
                <DialogHeader>
                    <DialogTitle>{t('signin_to_our_platform')}</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <form className="space-y-4" onSubmit={onSubmit} noValidate>
                        <Controller
                            control={control}
                            name="email"
                            rules={{
                                required: t('field_required'),
                                validate: (email) => isEmail(email) || t('invalid_email_format'),
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <FloatingInput
                                    id="email"
                                    autoComplete="off"
                                    label={t('email')}
                                    type="email"
                                    errorMessage={error?.message}
                                    required
                                    {...field}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="password"
                            rules={{
                                required: t('password_required'),
                                minLength: {
                                    value: 8,
                                    message: t('field_min_length', { length: 8 }),
                                },
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <FloatingInput
                                    id="password"
                                    autoComplete="off"
                                    label={t('password')}
                                    type="password"
                                    errorMessage={error?.message}
                                    required
                                    {...field}
                                />
                            )}
                        />

                        <div className="text-black text-center">
                            <small>
                                {t('by_clicking_login')}{' '}
                                <Link
                                    prefetch={false}
                                    href="/terms-and-conditions"
                                    target="_blank"
                                    className="font-medium text-black hover:underline focus-visible:outline-none focus-visible:underline"
                                >
                                    {t('terms').toLowerCase()}
                                </Link>
                            </small>
                        </div>

                        <div className="flex justify-end">
                            <Link
                                href="/reset-password"
                                className="font-medium text-black text-sm hover:underline focus-visible:outline-none focus-visible:underline"
                            >
                                {t('lost_password')} ?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            isLoading={isLoading}
                            className="w-full"
                        >
                            {isLoading ? t('authenticating') : t('login_to_your_account')}
                        </Button>
                        <div className="text-black text-sm">
                            {t('not_registered')} ?{' '}
                            <Link
                                href="/register"
                                replace
                                className="font-medium text-black hover:underline focus-visible:outline-none focus-visible:underline"
                            >
                                {t('create_account')}
                            </Link>
                        </div>
                    </form>
                </DialogBody>
                <DialogFooter>
                    <p className="text-black text-right">
                        <span className="text-danger">*</span> {t('indicate_require_field')}
                    </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
