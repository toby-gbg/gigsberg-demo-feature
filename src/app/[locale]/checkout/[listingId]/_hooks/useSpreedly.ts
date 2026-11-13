'use client';

import { useCallback, useEffect, useRef } from 'react';
import Cookie from 'js-cookie';
import { useLocale, useTranslations } from 'next-intl';

import { CheckoutPaymentIntent, PaymentProviderEnum, SpreedlyWindow } from '@/interfaces/Checkout';
import {
    SpreedlyPurchaseRequest,
    SpreedlyPurchaseResponse,
    SpreedlyThreeDSStatusEvent,
} from '@/interfaces/Spreedly';
import { createTranslationKey, fallbackTranslation } from '@/utils/common';
import { markPurchaseRedirect } from '@/utils/purchaseRedirect';
import {
    useSpreedlyEnquiryTransactionMutation,
    useSpreedlyPurchaseApmMutation,
    useSpreedlyPurchaseMutation,
} from '@/swr/features/checkout';

import { useGA4CheckoutWithPaymentMethod } from '@/hooks/useGA4CheckoutWithPaymentMethod';

import { toast } from '@/components/ui/Toast';

import { useCheckoutData } from '../_providers/CheckoutDataProvider';
import { useCheckoutPayment } from '../_providers/CheckoutPaymentProvider';

const useSpreedly = () => {
    const { data, quantity } = useCheckoutData();
    const { setIsLoading, setMethod, resetMethod } = useCheckoutPayment();
    const locale = useLocale();
    const t = useTranslations();
    const { triggerGA4CheckoutWithPaymentMethod } = useGA4CheckoutWithPaymentMethod();
    const { createPaymentIntent, paymentIntent, setPaymentIntent } = useCheckoutPayment();
    const { trigger: spreedlyPurchaseAsync } = useSpreedlyPurchaseMutation();
    const { trigger: spreedlyPurchaseApmAsync } = useSpreedlyPurchaseApmMutation();
    const { trigger: spreedlyEnquiryTransactionAsync } = useSpreedlyEnquiryTransactionMutation();
    const pending3DSRequestRef = useRef<SpreedlyPurchaseRequest | null>(null);
    const m3DSConfirmedRef = useRef(false);
    const klarnaInFlightRef = useRef(false);
    const handleThreeDSStatusRef = useRef<
        ((event: SpreedlyThreeDSStatusEvent) => Promise<void>) | null
    >(null);
    // Assigned by CheckoutSpreedly so 3DS errors can trigger an SDK reset with fresh cert params
    const refreshSdkCallbackRef = useRef<(() => void) | null>(null);
    const isEnquiryTransactionRef = useRef(false);

    // Ref for the CRes postMessage handler so it can be cleaned up
    const cresHandlerRef = useRef<((event: MessageEvent) => void) | null>(null);

    const setChallengeLoadingVisible = (visible: boolean) => {
        const challengeModal = document.getElementById('hiddenChallenge');
        const challengeContainer = document.getElementById('challengeContainer');

        if (!challengeModal || !challengeContainer) return;

        if (visible) {
            // show loader via CSS class on container
            try {
                challengeContainer.classList.add('challenge-loading');
            } catch {}
            challengeModal.classList.remove('hidden');
            return;
        } else {
            isEnquiryTransactionRef.current = false;
        }

        // Remove CRes message listener
        stopCResListener();
        challengeModal.classList.add('hidden');
        // clear loader (remove CSS class)
        try {
            challengeContainer.classList.remove('challenge-loading');
        } catch {}
        challengeContainer.innerHTML = '';
    };

    const decodeCRes = (cres: string): Record<string, string> | null => {
        try {
            const decoded = atob(cres);
            return JSON.parse(decoded);
        } catch {
            return null;
        }
    };

    const startCResListener = () => {
        stopCResListener();

        const handler = (event: MessageEvent) => {
            if (!event.data || !event.data.cres) return;

            const cresPayload = decodeCRes(event.data.cres);
            if (!cresPayload) return;

            // Challenge is complete — hide the threeds iframe by setting dimensions to 0
            const threedsIframes = document.querySelectorAll<HTMLElement>('.threeds-iframe');
            threedsIframes.forEach((iframe) => {
                iframe.style.width = '0';
                iframe.style.height = '0';
            });
        };

        window.addEventListener('message', handler);
        cresHandlerRef.current = handler;
    };

    const stopCResListener = () => {
        if (cresHandlerRef.current) {
            window.removeEventListener('message', cresHandlerRef.current);
            cresHandlerRef.current = null;
        }
    };

    const closeFullPageIframe = () => {
        const overlay = document.getElementById('threeds-overlay-custom');
        if (overlay) overlay.remove();
        document.body.style.overflow = '';
    };

    const showFullPageIframe = (acsUrl: string) => {
        closeFullPageIframe();

        const overlay = document.createElement('div');
        overlay.id = 'threeds-overlay-custom';
        overlay.className = 'threeds-overlay';

        const container = document.createElement('div');
        container.className = 'threeds-container';

        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.className = 'threeds-close-button';
        closeButton.title = 'Cancel 3DS Authentication';

        const iframe = document.createElement('iframe');
        iframe.id = 'threeds-iframe-custom';
        iframe.className = 'threeds-iframe';
        iframe.src = acsUrl;

        const loading = document.createElement('div');
        loading.className = 'threeds-loading';
        loading.innerHTML =
            '<div class="threeds-loading-content"><div class="threeds-spinner"></div><p>Loading 3D Secure Authentication...</p></div>';

        closeButton.addEventListener('click', () => {
            closeFullPageIframe();
            toast.add({ title: t('threed_secure_authentication_was_cancelled'), type: 'error' });
            setIsLoading(false);
        });

        iframe.addEventListener('load', () => {
            loading.style.display = 'none';
        });

        const messageHandler = (event: MessageEvent) => {
            try {
                const origin = new URL(acsUrl).origin;
                if (event.origin !== origin) return;
            } catch {
                return;
            }
            const msgData = typeof event.data === 'string' ? event.data : '';
            if (msgData.includes('success') || msgData.includes('complete')) {
                closeFullPageIframe();
                window.removeEventListener('message', messageHandler);
            } else if (msgData.includes('error')) {
                closeFullPageIframe();
                toast.add({ title: t('threed_secure_authentication_failed'), type: 'error' });
                setIsLoading(false);
                window.removeEventListener('message', messageHandler);
            }
        };
        window.addEventListener('message', messageHandler);

        container.appendChild(closeButton);
        container.appendChild(loading);
        container.appendChild(iframe);
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        // 15-minute timeout
        setTimeout(() => {
            if (document.getElementById('threeds-overlay-custom')) {
                closeFullPageIframe();
                window.removeEventListener('message', messageHandler);
                toast.add({
                    title: `${t('threed_secure_authentication_timed_out')} ${t('please_try_again')}`,
                    type: 'error',
                });
                setIsLoading(false);
            }
        }, 900000);
    };

    const formatStripeApmError = (error: unknown): string => {
        const message =
            typeof error === 'string'
                ? error
                : error instanceof Error
                  ? error.message
                  : (error as { message?: string })?.message || 'Klarna payment failed';

        if (/client_secret|payment_intent|No such paymentintent|resource_missing/i.test(message)) {
            return `${message}. The Stripe publishable key may not match the Spreedly Stripe gateway account.`;
        }
        return message;
    };

    const mountAndConfirmStripeApm = async (
        result: SpreedlyPurchaseResponse,
        publishableKeyOverride?: string
    ) => {
        const publishableKey =
            publishableKeyOverride?.trim() || process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY?.trim();
        if (!publishableKey || !result.apmClientSecret || !result.transactionToken) {
            throw new Error(
                'Missing Klarna payment configuration (Stripe publishable key or payment session)'
            );
        }

        const containerId = 'spreedly-klarna-element';
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.className = 'sr-only';
            document.body.appendChild(container);
        }

        const mountConfig = {
            publishableKey,
            clientSecret: result.apmClientSecret,
            transactionToken: result.transactionToken,
            appearance: { theme: 'stripe' as const },
        };

        const SpreedlyStripeAPM = (window as unknown as SpreedlyWindow).SpreedlyStripeAPM;
        const SpreedlyGlobal = (window as unknown as SpreedlyWindow).Spreedly;

        if (SpreedlyStripeAPM) {
            const stripeApm = new SpreedlyStripeAPM({
                ...mountConfig,
                paymentElement: containerId,
            });
            const mountResult = stripeApm.mount();
            if (mountResult?.error) {
                throw new Error(formatStripeApmError(mountResult.error));
            }

            // Payment Element loads the Stripe session asynchronously after mount
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const confirmResult = await stripeApm.confirmPayment();
            if (confirmResult?.error) {
                throw new Error(formatStripeApmError(confirmResult.error));
            }
            return;
        }

        if (SpreedlyGlobal?.createStripePaymentElement) {
            const element = SpreedlyGlobal.createStripePaymentElement({
                ...mountConfig,
                paymentElement: containerId,
            });
            await new Promise((resolve) => setTimeout(resolve, 1500));
            const confirmResult = await element.confirmPayment();
            if (confirmResult?.error) {
                throw new Error(formatStripeApmError(confirmResult.error));
            }
            return;
        }

        throw new Error('Spreedly payment SDK is not loaded');
    };

    const startThreeDSLifecycle = (result: SpreedlyPurchaseResponse) => {
        if (pending3DSRequestRef.current && result.isTokenizedWallet && result.paymentMethodToken) {
            pending3DSRequestRef.current = {
                ...pending3DSRequestRef.current,
                paymentMethodToken: result.paymentMethodToken,
                isTokenizedWallet: result.isTokenizedWallet,
            };
        }

        if (result.authType === 'stripe_apm' && result.apmClientSecret && result.transactionToken) {
            mountAndConfirmStripeApm(result, paymentIntent?.stripePublishableKey).catch((error) => {
                const message = error instanceof Error ? error.message : 'Klarna payment failed';
                const msgKey = createTranslationKey(message, '', { sanitize: true });
                toast.add({
                    title:
                        error instanceof Error
                            ? fallbackTranslation(t(msgKey), msgKey, message)
                            : t('klarna_payment_failed'),
                    type: 'error',
                });
                setIsLoading(false);
            });
            return true;
        }

        // iframe auth type: show a full-page iframe overlay
        if (result.authType === 'iframe' && result.checkoutUrl) {
            showFullPageIframe(result.checkoutUrl);
            return true;
        }

        const SpreedlyThreeDSLifecycleClass = (window as unknown as SpreedlyWindow)
            .SpreedlyThreeDSLifecycle;
        if (!SpreedlyThreeDSLifecycleClass || !result.transactionToken) {
            if (result.checkoutUrl) {
                window.location.href = result.checkoutUrl;
                return true;
            }
            if (result.redirectUrl) {
                window.location.href = result.redirectUrl;
                return true;
            }
            return false;
        }

        setChallengeLoadingVisible(true);
        m3DSConfirmedRef.current = false;

        const lifecycle = new SpreedlyThreeDSLifecycleClass({
            environmentKey: paymentIntent?.spreedlyEnvKey ?? '',
            transactionToken: result.transactionToken,
            hiddenIframeLocation: 'threeDSFrameHidden',
            challengeIframeLocation: 'challengeContainer',
            challengeIframeClasses: 'threeds-iframe',
            challengeIframeStyles: {
                width: '100%',
                height: '100%',
                border: 'none',
                position: 'fixed',
                top: '0',
                left: '0',
                zIndex: '99999',
            },
            callbacks: {
                onChallenge: () => {
                    setChallengeLoadingVisible(true);
                    startCResListener();
                },
                onSuccess: async (event: Record<string, unknown>) => {
                    await handleThreeDSStatusRef.current?.({ ...event, action: 'succeeded' });
                },
                onError: (event: Record<string, unknown>) => {
                    void handleThreeDSStatusRef.current?.({ ...event, action: 'error' });
                },
                onFinalizationTimeout: (event: Record<string, unknown>) => {
                    void handleThreeDSStatusRef.current?.({
                        ...event,
                        action: 'finalization-timeout',
                    });
                },
            },
        });

        lifecycle.start();
        return true;
    };

    const enquiryTransactionFnRef = useRef<(token: string) => Promise<void>>(async () => {});

    const enquiryTransaction = useCallback(
        async (transactionToken: string) => {
            if (!isEnquiryTransactionRef.current) return;
            const enquiryResult = await spreedlyEnquiryTransactionAsync({
                token: transactionToken,
            });
            if (enquiryResult) {
                switch (enquiryResult.state) {
                    case 'succeeded':
                        setChallengeLoadingVisible(false);
                        const transaction_token =
                            enquiryResult.transactionToken || transactionToken;
                        if (enquiryResult.redirectUrl) {
                            window.location.href = enquiryResult.redirectUrl + `&enquiry=true`;
                            return;
                        }
                        markPurchaseRedirect(transaction_token);
                        window.location.href = `/${locale}/thank-you?payment_intent=${transaction_token}&enquiry=true`;
                        return;
                    case 'failed':
                        isEnquiryTransactionRef.current = false;
                        setChallengeLoadingVisible(false);
                        const message =
                            enquiryResult.message ||
                            `${t('payment_failed')} ${t('please_try_again')}`;
                        const msgKey = createTranslationKey(message, '', { sanitize: true });
                        toast.add({
                            title: fallbackTranslation(t(msgKey), msgKey, message),
                            type: 'error',
                        });
                        refreshSdkCallbackRef.current?.();
                        return;
                    default:
                        setTimeout(() => enquiryTransactionFnRef.current?.(transactionToken), 2000);
                        break;
                }
            } else {
                setTimeout(() => enquiryTransactionFnRef.current?.(transactionToken), 2000);
            }
        },
        [spreedlyEnquiryTransactionAsync, locale, setChallengeLoadingVisible, t]
    );

    useEffect(() => {
        enquiryTransactionFnRef.current = enquiryTransaction;
    }, [enquiryTransaction]);

    const completeThreeDSAuthentication = useCallback(
        async (scaAuthenticationToken: string, scaState: string) => {
            if (!pending3DSRequestRef.current) {
                throw new Error('Missing pending 3DS context');
            }

            const requestBody: SpreedlyPurchaseRequest = {
                ...pending3DSRequestRef.current,
                scaAuthenticationToken,
                scaState,
            };

            const result = await spreedlyPurchaseAsync(requestBody);

            if (result.status === 'success') {
                if (result.redirectUrl) {
                    window.location.href = result.redirectUrl;
                } else {
                    const transaction_token = result.transactionToken;
                    markPurchaseRedirect(transaction_token);
                    window.location.href = `/${locale}/thank-you?payment_intent=${transaction_token}&confirmation=true`;
                }
                return;
            }

            if (result.status === 'auth_required') {
                // Show loading here while waiting for the next 3DS status event, which will indicate whether the challenge succeeded or failed
                const started = startThreeDSLifecycle(result);
                if (started) return;
            }

            if (['processing', 'pending'].includes(result.state || '')) {
                // Start checking transaction status via backend polling
                isEnquiryTransactionRef.current = true;
                enquiryTransaction(result.transactionToken || '');
            } else {
                setChallengeLoadingVisible(false);
                refreshSdkCallbackRef.current?.();
                throw new Error(result.message || 'Payment failed. Please try again.');
            }
        },
        [locale, spreedlyPurchaseAsync]
    );

    const handleThreeDSStatus = useCallback(
        async (event: SpreedlyThreeDSStatusEvent) => {
            console.log('[Spreedly] Received 3DS event', event);
            switch (event.action) {
                case 'challenge':
                    setChallengeLoadingVisible(true);
                    return;
                case 'error':
                case 'succeeded': {
                    m3DSConfirmedRef.current = true;
                    if (!event.token) {
                        setChallengeLoadingVisible(false);
                        toast.add({
                            title: `${t('threeds_authentication_failed')} ${t('please_try_again')}`,
                            type: 'error',
                        });
                        refreshSdkCallbackRef.current?.();
                        return;
                    }

                    try {
                        setIsLoading(true);
                        await completeThreeDSAuthentication(event.token, event.action);
                    } catch (error) {
                        refreshSdkCallbackRef.current?.();
                        setChallengeLoadingVisible(false);
                        const message =
                            error instanceof Error
                                ? error.message
                                : `${t('fail_to_complete_threeds_authentication')} ${t('please_try_again')}`;
                        const msgKey = createTranslationKey(message, '', { sanitize: true });
                        toast.add({
                            title: fallbackTranslation(t(msgKey), msgKey, message),
                            type: 'error',
                        });
                    } finally {
                        setIsLoading(false);
                    }
                    return;
                }
                case 'finalization-timeout': {
                    setChallengeLoadingVisible(false);
                    toast.add({ title: t('threeds_authentication_timed_out'), type: 'error' });
                    refreshSdkCallbackRef.current?.();
                    return;
                }
                /*
                case 'error': {
                    setChallengeLoadingVisible(false);
                    toast.add({
                        title:
                            event.context?.message ||
                            `${t('threeds_authentication_failed')} ${t('please_try_again')}`,
                        type: 'error',
                    });
                    refreshSdkCallbackRef.current?.();
                    return;
                }
                */
                default:
                    return;
            }
        },
        [completeThreeDSAuthentication, setIsLoading, t]
    );

    // Keep ref in sync so startThreeDSLifecycle callbacks can call handleThreeDSStatus without a circular dependency
    useEffect(() => {
        handleThreeDSStatusRef.current = handleThreeDSStatus;
    }, [handleThreeDSStatus]);

    /**
     * After Spreedly iFrame tokenizes the card (or wallet produces a token), this function:
     * 1. Creates a payment intent via Fastify backend (gets orderId / attemptId)
     * 2. Sends a purchase request to Fastify POST /spreedly/purchase
     * 3. Handles 3DS redirect, auth_required, or direct success
     */
    const processSpreedlyPayment = useCallback(
        async (
            paymentMethodToken: string,
            processPaymentIntent: CheckoutPaymentIntent,
            paymentInfo?: Record<string, unknown>,
            paymentType: 'card' | 'google_pay' | 'apple_pay' = 'card',
            isWallet: boolean = false
        ) => {
            let triggeringRefresh = false;
            try {
                setIsLoading(true);
                setChallengeLoadingVisible(true);
                Cookie.set('payment_provider', PaymentProviderEnum.SPREEDLY);

                triggerGA4CheckoutWithPaymentMethod(isWallet ? paymentType : 'credit_card');

                // Step 2: Call Fastify purchase endpoint
                // Note: amount, currencyCode, email are NOT sent — Fastify looks them up from the attempt
                const requestBody: SpreedlyPurchaseRequest = {
                    paymentMethodToken,
                    paymentIntentId: processPaymentIntent.paymentIntentId,
                    paymentIntentToken: processPaymentIntent.paymentIntentToken,
                    metadata: processPaymentIntent.metadata,
                    returnUrl: `${window.location.origin}/api/spreedly?listing_id=${data.listing.id}&quantity=${quantity}&locale=${locale}`,
                    paymentType,
                    isWallet,
                    paymentInfo,
                };

                const detectedAcceptHeader =
                    processPaymentIntent.acceptHeader ||
                    (navigator as unknown as { accept?: string })?.accept ||
                    'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8';
                const challenge_window_size = '05';

                // Use serializeBrowserInfo from the new Spreedly Web SDK if available
                const spreedlySdk = window as unknown as SpreedlyWindow;
                if (typeof spreedlySdk.serializeBrowserInfo === 'function') {
                    try {
                        requestBody.browserInfo = spreedlySdk.serializeBrowserInfo(
                            challenge_window_size,
                            detectedAcceptHeader
                        );
                    } catch (err) {
                        console.warn('[Spreedly] serializeBrowserInfo failed, using fallback', err);
                    }
                }
                if (!requestBody.browserInfo) {
                    requestBody.browserInfo = {
                        java_enabled: false,
                        javascript_enabled: true,
                        language: navigator.language,
                        color_depth: screen.colorDepth,
                        screen_height: screen.height,
                        screen_width: screen.width,
                        time_zone_offset: new Date().getTimezoneOffset(),
                        user_agent: navigator.userAgent,
                        accept_header: detectedAcceptHeader,
                    };
                }

                pending3DSRequestRef.current = requestBody;

                const result = await spreedlyPurchaseAsync(requestBody);

                if (result.status === 'success') {
                    // Payment succeeded — follow redirect URL to finalize order
                    if (result.redirectUrl) {
                        window.location.href = result.redirectUrl;
                    } else {
                        const transaction_token = result.transactionToken;
                        if (result.redirectUrl) {
                            window.location.href = result.redirectUrl + `&auto_confirm=true`;
                            return;
                        }
                        markPurchaseRedirect(transaction_token);
                        window.location.href = `/${locale}/thank-you?payment_intent=${transaction_token}&auto_confirm=true`;
                    }
                    return;
                }

                if (result.status === 'auth_required') {
                    startThreeDSLifecycle(result);
                    return;
                }
                if (['processing', 'pending'].includes(result.state || '')) {
                    // Start checking transaction status via backend polling
                    if (result.transactionToken) {
                        isEnquiryTransactionRef.current = true;
                        enquiryTransaction(result.transactionToken || '');
                    }
                } else {
                    throw new Error(result.message || 'Transaction failed. Please try again.');
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Payment failed';
                const msgKey = createTranslationKey(message, '', { sanitize: true });
                toast.add({
                    title: fallbackTranslation(t(msgKey), msgKey, message),
                    type: 'error',
                    timeout: 5555,
                });
                triggeringRefresh = true;
                refreshSdkCallbackRef.current?.();
                throw error;
            } finally {
                if (!triggeringRefresh) setIsLoading(false);
            }
        },
        [
            createPaymentIntent,
            setPaymentIntent,
            locale,
            t,
            setIsLoading,
            spreedlyPurchaseAsync,
            triggerGA4CheckoutWithPaymentMethod,
        ]
    );

    const processSpreedlyApmPayment = useCallback(
        async (apmType: 'klarna', processPaymentIntent: CheckoutPaymentIntent) => {
            if (klarnaInFlightRef.current) {
                return;
            }
            klarnaInFlightRef.current = true;

            let triggeringRefresh = false;
            try {
                setMethod('klarna');
                Cookie.set('payment_provider', PaymentProviderEnum.SPREEDLY);
                triggerGA4CheckoutWithPaymentMethod(apmType);

                const result = await spreedlyPurchaseApmAsync({
                    paymentIntentId: processPaymentIntent.paymentIntentId,
                    paymentIntentToken: processPaymentIntent.paymentIntentToken!,
                    metadata: processPaymentIntent.metadata,
                    returnUrl: `${window.location.origin}/api/spreedly?listing_id=${data.listing.id}&quantity=${quantity}&locale=${locale}`,
                    apmType,
                });

                if (result.status === 'success') {
                    if (result.redirectUrl) {
                        window.location.href = result.redirectUrl;
                    } else {
                        const transaction_token = result.transactionToken;
                        markPurchaseRedirect(transaction_token);
                        window.location.href = `/${locale}/thank-you?payment_intent=${transaction_token}&auto_confirm=true`;
                    }
                    return;
                }

                if (result.status === 'auth_required') {
                    if (result.authType === 'stripe_apm') {
                        await mountAndConfirmStripeApm(
                            result,
                            processPaymentIntent.stripePublishableKey
                        );
                        if (result.transactionToken) {
                            window.location.href = `/api/spreedly?transaction_token=${result.transactionToken}&listing_id=${data.listing.id}&quantity=${quantity}&locale=${locale}`;
                        }
                        return;
                    }
                    startThreeDSLifecycle(result);
                    return;
                }

                if (['processing', 'pending'].includes(result.state || '')) {
                    if (result.transactionToken) {
                        isEnquiryTransactionRef.current = true;
                        enquiryTransaction(result.transactionToken);
                    }
                } else {
                    throw new Error(result.message || 'Transaction failed. Please try again.');
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Payment failed';
                const msgKey = createTranslationKey(message, '', { sanitize: true });
                toast.add({
                    title: fallbackTranslation(t(msgKey), msgKey, message),
                    type: 'error',
                    timeout: 5555,
                });
                triggeringRefresh = true;
                resetMethod();
                refreshSdkCallbackRef.current?.();
                throw error;
            } finally {
                klarnaInFlightRef.current = false;
                if (!triggeringRefresh) setIsLoading(false);
            }
        },
        [
            data.listing.id,
            locale,
            t,
            quantity,
            resetMethod,
            setIsLoading,
            setMethod,
            spreedlyPurchaseApmAsync,
            triggerGA4CheckoutWithPaymentMethod,
        ]
    );

    return {
        processSpreedlyPayment,
        processSpreedlyApmPayment,
        refreshSdkCallbackRef,
        setChallengeLoadingVisible,
    };
};

export default useSpreedly;
