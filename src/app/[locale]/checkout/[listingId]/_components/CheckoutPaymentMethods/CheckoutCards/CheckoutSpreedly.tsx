'use client';

import '@/assets/css/spreedly.css';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useTranslations } from 'next-intl';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';

import { CheckoutStep } from '@/interfaces/Checkout';
import type {
    SpreedlyHostedFieldsInstance,
    SpreedlySdkError,
    SpreedlyTokenResponse,
} from '@/types/global';
import { cn } from '@/lib/cn';
import { createTranslationKey, fallbackTranslation } from '@/utils/common';
import {
    getSpreedlyErrorKey,
    spreedlyFieldLabels,
    spreedlyInlineFields,
    type SpreedlyFieldError,
} from '@/utils/spreedlyErrors';

import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

import useSpreedly from '../../../_hooks/useSpreedly';
import { useCheckoutLead } from '../../../_providers/CheckoutLeadProvider';
import { useCheckoutPayment } from '../../../_providers/CheckoutPaymentProvider';
import { buildSpreedlyValidationRules, type PaymentFormValues } from './spreedlyValidation';

const SPREEDLY_IFRAME_SRC = 'https://core.spreedly.com/checkout/sdk/1.0.1/index.js';

const parseFullName = (fullName: string) => {
    const trimmed = fullName.trim();
    const [first_name, ...lastParts] = trimmed.split(/\s+/);
    return {
        full_name: trimmed,
        first_name: first_name || '',
        last_name: lastParts.join(' ') || first_name || '',
    };
};

export default function CheckoutSpreedly() {
    const t = useTranslations();
    const validationRules = buildSpreedlyValidationRules(t);

    const { lead } = useCheckoutLead();
    const {
        isLoading,
        setIsLoading,
        currentStep,
        selectedBillingAddress,
        paymentIntent,
        createPaymentIntent,
        setPaymentIntent,
        currentMethod,
    } = useCheckoutPayment();

    const { processSpreedlyPayment, refreshSdkCallbackRef, setChallengeLoadingVisible } =
        useSpreedly();

    const leadUser = lead?.user;
    const defaultCardholderName = [leadUser?.first_name, leadUser?.last_name]
        .filter(Boolean)
        .join(' ')
        .trim();
    const {
        register,
        handleSubmit,
        reset,
        resetField,
        setFocus,
        getFieldState,
        formState: { errors: formErrors, touchedFields, isValid },
    } = useForm<PaymentFormValues>({
        mode: 'all',
        defaultValues: {
            name: defaultCardholderName,
            month: '',
            year: '',
        },
    });
    useEffect(() => {
        // The payment form mounts before lead creation; RHF caches its initial defaults.
        if (defaultCardholderName && !getFieldState('name').isDirty) {
            resetField('name', { defaultValue: defaultCardholderName });
        }
    }, [defaultCardholderName, getFieldState, resetField]);

    const nameError = touchedFields.name ? formErrors.name?.message : undefined;
    const monthError = touchedFields.month ? formErrors.month?.message : undefined;
    const yearError = touchedFields.year ? formErrors.year?.message : undefined;

    // State
    const [sdkReady, setSdkReady] = useState(false);
    const [iframeReady, setIframeReady] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const initializedRef = useRef(false);
    const initSpreedlyPIRef = useRef(false);
    const sdkRef = useRef<SpreedlyHostedFieldsInstance | null>(null);
    const sdkGenerationRef = useRef(0);
    const mountedRef = useRef(true);
    const isRefreshingRef = useRef(false);
    const awaitingReadyRef = useRef(false);
    const mCurrentPaymentIntent = useRef(paymentIntent);
    const refreshSpreedlyRef = useRef<() => void>(() => {});

    mCurrentPaymentIntent.current = paymentIntent;

    const clearFieldError = (field: 'name' | 'expiry') => {
        setErrors((previous) => {
            if (!previous[field]) return previous;
            const next = { ...previous };
            delete next[field];
            return next;
        });
    };

    const initSpreedly = useCallback(
        async (overridePI?: typeof paymentIntent) => {
            const pi = overridePI ?? paymentIntent;
            if (!pi) {
                return; // Wait for payment intent to be created before initializing Spreedly, as we need the envKey from it
            }

            const envKey = pi.spreedlyEnvKey || '';
            if (!envKey) {
                console.error('[Spreedly] Missing spreedlyEnvKey in payment intent');
                // Try again after a short delay in case it's just not available yet
                if (!initSpreedlyPIRef.current) {
                    initSpreedlyPIRef.current = true;
                    setTimeout(async function () {
                        mCurrentPaymentIntent.current = await createPaymentIntent({
                            paymentProvider: 'spreedly',
                            leadId: lead?.id,
                        });
                        setPaymentIntent(mCurrentPaymentIntent.current);
                    }, 1000);
                }
                return;
            }

            if (!document.getElementById('spreedly-number')) {
                console.log('[Spreedly] DOM elements not found, reloading Spreedly');
                return;
            }

            const HostedFields = window.SpreedlyHostedFields;
            if (!HostedFields) return;
            if (!overridePI && initializedRef.current) return;

            console.debug('[Spreedly] init', {
                envKey,
                numberEl: 'spreedly-number',
                cvvEl: 'spreedly-cvv',
            });
            initializedRef.current = true;
            const myGeneration = ++sdkGenerationRef.current;

            const handleReady = () => {
                if (!mountedRef.current || sdkGenerationRef.current !== myGeneration) return;
                console.debug('[Spreedly] ready');
                setIsLoading(false);
                setIframeReady(true);
                setChallengeLoadingVisible(false);
                if (awaitingReadyRef.current) {
                    awaitingReadyRef.current = false;
                }
                const sdk = sdkRef.current;
                if (!sdk) return;
                // Style the iFrame fields
                const baseStyles: Record<string, string> = {
                    borderRadius: '10px',
                    fontSize: '15px',
                    backgroundColor: 'rgb(249, 250, 251)',
                    fontFamily: 'Inter, Arial, sans-serif',
                    color: '#111',
                    padding: '13px 14px',
                    boxSizing: 'border-box',
                };
                sdk.setFieldType('number', 'text');
                sdk.setFieldType('cvv', 'text');
                sdk.setPlaceholder('number', 'Card number');
                sdk.setPlaceholder('cvv', 'CVV/CVV2');
                sdk.setStyles('number', { width: '100%', ...baseStyles });
                sdk.setStyles('cvv', { width: '100%', ...baseStyles });
                setFocus('name');
            };

            const handleTokenGenerated = async (response: SpreedlyTokenResponse) => {
                if (!mountedRef.current || sdkGenerationRef.current !== myGeneration) return;
                const pm = response?.tokenResponse?.payment_method;
                const token = pm?.token;
                console.log('[Spreedly] tokenGenerated event', { token, pm });
                reset({ name: '', month: '', year: '' });
                setErrors({});
                if (token) {
                    try {
                        await processSpreedlyPayment(token, mCurrentPaymentIntent.current!, pm);
                    } catch {}
                } else {
                    setErrors({
                        general: t('generic_error'),
                    });
                }
            };

            const handleSdkError = (error: unknown) => {
                if (!mountedRef.current || sdkGenerationRef.current !== myGeneration) return;
                console.log('[Spreedly] error event', { error });
                // Following PCI-DSS 4.0 to clear sensitive data on errors as well
                reset({ name: '', month: '', year: '' });
                setErrors({});
                if (typeof error === 'object' && error !== null) {
                    const errObj = error as SpreedlySdkError;
                    const errorList: SpreedlyFieldError[] = errObj.errors?.length
                        ? errObj.errors
                        : [errObj];
                    const hasNamedFieldError = errorList.some(
                        (e) =>
                            (e.attribute && e.attribute !== 'general') ||
                            e.key === 'errors.blank_card_type' ||
                            e.key === 'errors.expired'
                    );
                    const errorMap: Record<string, string> = {};
                    errorList.forEach((e) => {
                        const key = getSpreedlyErrorKey(e);
                        const attribute =
                            e.key === 'errors.blank_card_type'
                                ? 'number'
                                : e.attribute || 'general';
                        const labelKey = spreedlyFieldLabels[attribute];
                        const rawMessage = e.message?.trim();
                        const msgKey = createTranslationKey(rawMessage, '', { sanitize: true });
                        const message = rawMessage
                            ? fallbackTranslation(t(msgKey), msgKey, rawMessage)
                            : labelKey
                              ? t(key, { field: t(labelKey) })
                              : t(key);
                        // API attributes differ from the names used by the form's inline errors.
                        const field =
                            e.key === 'errors.expired'
                                ? 'expiry'
                                : spreedlyInlineFields[attribute] || attribute;
                        errorMap[field] = message;
                        toast.add({ title: message, type: 'error' });
                    });
                    if (!hasNamedFieldError) {
                        refreshSpreedlyRef.current();
                        return;
                    }
                    setErrors(errorMap);
                    return;
                }
                // Client-side string errors have no stable key; never expose untranslated copy.
                const msg = t('generic_error');
                toast.add({ title: msg, type: 'error' });
                setErrors({ general: msg });
            };

            // Build constructor params — include cert auth only when all params are present
            const hasCertAuth = pi.nonce && pi.timestamp && pi.certificateToken && pi.signature;
            const sdkParams: Record<string, string> = { environment_key: envKey };
            if (hasCertAuth) {
                sdkParams.certificate_token = pi.certificateToken!;
                sdkParams.nonce = pi.nonce!;
                sdkParams.timestamp = pi.timestamp!;
                sdkParams.signature = pi.signature!;
            }

            let sdk: SpreedlyHostedFieldsInstance;
            try {
                sdk = new HostedFields(sdkParams);
            } catch (e: unknown) {
                console.error(
                    '[Spreedly] Constructor error:',
                    e instanceof Error ? e.message : e,
                    e
                );
                toast.add({ title: t('generic_error'), type: 'error' });
                return;
            }
            sdkRef.current = sdk;

            sdk.on('ready', handleReady);
            sdk.on('tokenGenerated', handleTokenGenerated);
            sdk.on('error', handleSdkError);

            sdk.inAppElements({
                number: { containerId: 'spreedly-number' },
                cvv: { containerId: 'spreedly-cvv' },
            });
        },
        [
            processSpreedlyPayment,
            paymentIntent,
            setPaymentIntent,
            createPaymentIntent,
            lead,
            t,
            reset,
            setFocus,
        ]
    );

    const refreshSpreedly = useCallback(async () => {
        if (isRefreshingRef.current) return;
        isRefreshingRef.current = true;
        setErrors({});
        setIsLoading(true);
        setIframeReady(false);
        setChallengeLoadingVisible(true);
        sdkRef.current?._removeMessageListener?.();
        sdkRef.current = null;
        // Clear DOM containers — removes old iframes before the new SDK mounts
        document.getElementById('spreedly-number')?.replaceChildren();
        document.getElementById('spreedly-cvv')?.replaceChildren();
        try {
            mCurrentPaymentIntent.current = await createPaymentIntent({
                paymentProvider: 'spreedly',
                leadId: lead?.id,
            });
            initializedRef.current = false;
            awaitingReadyRef.current = true;
            setPaymentIntent(mCurrentPaymentIntent.current);
            await initSpreedly(mCurrentPaymentIntent.current);
        } catch (err) {
            console.error('[Spreedly] Failed to refresh payment form', err);
            toast.add({ title: t('generic_error'), type: 'error' });
            awaitingReadyRef.current = false;
            setChallengeLoadingVisible(false);
            setIsLoading(false);
        } finally {
            isRefreshingRef.current = false;
        }
    }, [createPaymentIntent, setPaymentIntent, setIsLoading, lead, initSpreedly, t]);

    refreshSpreedlyRef.current = refreshSpreedly;
    refreshSdkCallbackRef.current = refreshSpreedly;

    useEffect(() => {
        if (isRefreshingRef.current) return;
        if (sdkReady || (typeof window !== 'undefined' && window.SpreedlyHostedFields)) {
            initSpreedly();
        }
    }, [sdkReady, initSpreedly]);

    const prevStepRef = useRef(currentStep);
    useEffect(() => {
        if (
            prevStepRef.current !== CheckoutStep.YOUR_INFORMATION &&
            currentStep === CheckoutStep.YOUR_INFORMATION
        ) {
            isRefreshingRef.current = false;
            initializedRef.current = false;
            sdkRef.current?._removeMessageListener?.();
            sdkRef.current = null;
            document.getElementById('spreedly-number')?.replaceChildren();
            document.getElementById('spreedly-cvv')?.replaceChildren();
            resetField('month');
            resetField('year');
            setErrors({});
        }
        prevStepRef.current = currentStep;
    }, [currentStep, resetField]);

    const submitPayment = (values: PaymentFormValues) => {
        if (!sdkRef.current || !iframeReady || isLoading) return;
        setErrors({});
        const options = collectData(values);
        sdkRef.current.submit(options);
    };

    const collectData = (values: PaymentFormValues) => {
        const selectedAddress = selectedBillingAddress || leadUser?.default_address;
        const nameParts = parseFullName(values.name);
        const phone_number = (selectedAddress?.phone || leadUser?.phone || '').replace(/\D/g, ''); // Remove non-digit characters
        return {
            full_name: nameParts.full_name,
            first_name: nameParts.first_name,
            last_name: nameParts.last_name,
            email: leadUser?.email || '',
            phone_number,
            country: selectedAddress?.country?.code || '',
            city: selectedAddress?.city || '',
            state: selectedAddress?.state?.abbreviation || '',
            address1: selectedAddress?.address_line1 || '',
            zip: selectedAddress?.postcode || '',
            month: values.month.trim(),
            year: values.year.trim(),
        };
    };

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            sdkRef.current?._removeMessageListener?.();
            sdkRef.current = null;
        };
    }, []);
    return (
        <Fragment>
            <form
                onSubmit={handleSubmit(submitPayment)}
                className={cn(
                    'spreedly-payment-form flex flex-col gap-y-4',
                    !!currentMethod && currentMethod !== 'card' && 'pointer-events-none opacity-60'
                )}
            >
                {/* Cardholder Name */}
                <div className="flex flex-col gap-y-1">
                    <label
                        htmlFor="spreedly-name"
                        className="text-sm font-medium text-gray-700 capitalize"
                    >
                        Cardholder Name
                    </label>
                    <input
                        id="spreedly-name"
                        type="text"
                        placeholder="Name on card"
                        {...register('name', {
                            ...validationRules.name,
                            onChange: () => clearFieldError('name'),
                        })}
                        className="w-full rounded-[10px] border border-gray-300 bg-gray-50 px-3.5 py-3 font-[Poppins,Arial,sans-serif] text-[15px] text-[#111] placeholder-gray-400 shadow-[0_2px_5px_rgba(0,0,0,0.05)] focus:border-blue-500 focus:outline-none"
                        autoComplete="cc-name"
                        aria-invalid={!!nameError || !!errors.name}
                        aria-describedby={
                            nameError || errors.name ? 'spreedly-name-error' : undefined
                        }
                    />
                    {(nameError || errors.name) && (
                        <p id="spreedly-name-error" className="text-xs text-red-500">
                            {nameError || errors.name}
                        </p>
                    )}
                </div>

                {/* Card Number (Spreedly iFrame) */}
                <div className="flex flex-col gap-y-1">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                        Card Number
                    </label>
                    <div
                        id="spreedly-number"
                        className="h-11.5 w-full overflow-hidden rounded-[10px] border border-gray-300 bg-gray-50 shadow-[0_2px_5px_rgba(0,0,0,0.05)]"
                    />
                    {errors.number && <p className="text-xs text-red-500">{errors.number}</p>}
                </div>

                {/* Expiry + CVV Row */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-y-1">
                        <label
                            htmlFor="spreedly-month"
                            className="text-sm font-medium text-gray-700 capitalize"
                        >
                            Month
                        </label>
                        <input
                            id="spreedly-month"
                            type="text"
                            inputMode="numeric"
                            maxLength={2}
                            placeholder="MM"
                            {...register('month', {
                                ...validationRules.month,
                                onChange: () => clearFieldError('expiry'),
                            })}
                            className="w-full rounded-[10px] border border-gray-300 bg-gray-50 px-3.5 py-3 font-[Poppins,Arial,sans-serif] text-[15px] text-[#111] placeholder-gray-400 shadow-[0_2px_5px_rgba(0,0,0,0.05)] focus:border-blue-500 focus:outline-none"
                            autoComplete="cc-exp-month"
                            aria-invalid={!!monthError}
                            aria-describedby={monthError ? 'spreedly-month-error' : undefined}
                        />
                        {monthError && (
                            <p id="spreedly-month-error" className="text-xs text-red-500">
                                {monthError}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-y-1">
                        <label
                            htmlFor="spreedly-year"
                            className="text-sm font-medium text-gray-700 capitalize"
                        >
                            Year
                        </label>
                        <input
                            id="spreedly-year"
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="YYYY"
                            {...register('year', {
                                ...validationRules.year,
                                onChange: () => clearFieldError('expiry'),
                            })}
                            className="w-full rounded-[10px] border border-gray-300 bg-gray-50 px-3.5 py-3 font-[Poppins,Arial,sans-serif] text-[15px] text-[#111] placeholder-gray-400 shadow-[0_2px_5px_rgba(0,0,0,0.05)] focus:border-blue-500 focus:outline-none"
                            autoComplete="cc-exp-year"
                            aria-invalid={!!yearError || !!errors.expiry}
                            aria-describedby={
                                yearError || errors.expiry ? 'spreedly-year-error' : undefined
                            }
                        />
                        {(yearError || errors.expiry) && (
                            <p id="spreedly-year-error" className="text-xs text-red-500">
                                {yearError || errors.expiry}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-y-1">
                        <label className="text-sm font-medium text-gray-700 capitalize">CVV</label>
                        <div
                            id="spreedly-cvv"
                            className="h-11.5 w-full overflow-hidden rounded-[10px] border border-gray-300 bg-gray-50 shadow-[0_2px_5px_rgba(0,0,0,0.05)]"
                        />
                        {errors.cvv && <p className="text-xs text-red-500">{errors.cvv}</p>}
                    </div>
                </div>

                {errors.general && <p className="text-xs text-red-500">{errors.general}</p>}

                <Button
                    type="submit"
                    className="btn-submit-payment col-span-12"
                    isLoading={isLoading}
                    disabled={!iframeReady || isLoading || !isValid}
                >
                    {t('continue')}
                </Button>
            </form>

            {/* 3DS lifecycle mount points used by Spreedly.ThreeDS.Lifecycle */}
            <iframe id="threeDSFrameHidden" className="hidden" title="Spreedly 3DS hidden frame" />
            {typeof document !== 'undefined' &&
                createPortal(
                    <div
                        id="hiddenChallenge"
                        className="fixed inset-0 z-9999 hidden overflow-hidden bg-black/80"
                        aria-hidden="true"
                    >
                        <div
                            id="challengeContainer"
                            className="m-0 flex h-screen w-screen max-w-full items-center justify-center p-0"
                            style={{ pointerEvents: 'auto' }}
                        />
                    </div>,
                    document.body
                )}

            <Script
                src={SPREEDLY_IFRAME_SRC}
                strategy="afterInteractive"
                crossOrigin="anonymous"
                integrity="sha384-StnJFx35nK0e5Faey9IyWoS/1wr2B5eQH8LE/KCPZjBXgfB+2YmDdNP7llnkKL1U"
                onLoad={() => {
                    console.debug('[Spreedly] SDK script loaded');
                    setSdkReady(true);
                }}
                onError={(e) => console.error('[Spreedly] Failed to load iframe SDK', e)}
            />
        </Fragment>
    );
}
