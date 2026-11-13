'use client';

import { Fragment, useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { usePathname } from '@/i18n/routing';
import { BProgress } from '@bprogress/core';
import { CircleCheck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { CheckoutStep } from '@/interfaces/Checkout';
import { C } from '@/interfaces/Currency';
import { L } from '@/interfaces/Language';
import { changeLocale } from '@/lib/locale';
import { storeCurrencyInCookies } from '@/utils/cookies';
import { useReleaseTicketMutation } from '@/swr/features/listings';

import useIntlRouter from '@/hooks/useIntlRouter';

import { Button } from '@/components/ui/Button';
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { toast } from '@/components/ui/Toast';

import { useCheckoutData } from '../../_providers/CheckoutDataProvider';
import { useCheckoutLead } from '../../_providers/CheckoutLeadProvider';

interface TabProps {
    onClick?: () => void;
    currentStep?: CheckoutStep;
    currencies?: C;
    onOptimisticLanguage?: (localName: string) => void;
    languages: L;
}

interface Props {
    currentStep?: CheckoutStep;
    currencies?: C;
    languages: L;
}

export default function LanguageCurrencySelector({ currentStep, currencies, languages }: Props) {
    const t = useTranslations();
    const locale = useLocale();
    const [isOpenModal, setIsOpenModal] = useState(false);
    const { currencyCode, website } = useCheckoutData();

    const serverLanguageName =
        languages?.[locale.toLowerCase()]?.local_name || locale.toUpperCase();

    // using standard state here instead of useOptimistic
    // because language changes trigger window.location.replace (a hard reload),
    // useOptimistic would revert instantly and cause flickering
    const [pendingLanguageName, setPendingLanguageName] = useState<string | null>(null);
    const displayLanguageName = pendingLanguageName ?? serverLanguageName;

    const { name = '' } = website ?? {};

    const onOpen = () => setIsOpenModal(true);
    const onClose = () => setIsOpenModal(false);

    return (
        <Fragment>
            <button
                id="lang-currency"
                className="p-1 px-2 border border-foreground-300 rounded-lg font-medium"
                onClick={onOpen}
            >
                {displayLanguageName} <span className="text-foreground-400">|</span> {currencyCode}
            </button>

            <Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
                <DialogContent classNames={{ popup: 'max-w-lg' }}>
                    <DialogHeader>
                        <DialogTitle className="font-semibold text-xl">
                            {t('change_lang_currency')}
                        </DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <p className="text-foreground-600 text-sm">
                            {t('change_lang_currency_you_see', { name })}
                        </p>
                        <Tabs className="mt-4">
                            <TabsList aria-label="Options">
                                <TabsTrigger value="language">{t('language')}</TabsTrigger>
                                <TabsTrigger value="currency">{t('currency')}</TabsTrigger>
                            </TabsList>
                            <TabsContent value="language">
                                <LanguageSelect
                                    onClick={onClose}
                                    currentStep={currentStep}
                                    languages={languages}
                                    onOptimisticLanguage={setPendingLanguageName}
                                />
                            </TabsContent>
                            <TabsContent value="currency">
                                <CurrencySelector
                                    onClick={onClose}
                                    currencies={currencies ?? {}}
                                    languages={{}}
                                />
                            </TabsContent>
                        </Tabs>
                    </DialogBody>
                </DialogContent>
            </Dialog>
        </Fragment>
    );
}

const LanguageSelect = ({ onClick, currentStep, onOptimisticLanguage, languages }: TabProps) => {
    const t = useTranslations();
    const locale = useLocale();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { lead, deleteLead } = useCheckoutLead();
    const { trigger: releaseTicketMutation } = useReleaseTicketMutation();
    const currentLanguage = languages[locale.toLowerCase()]?.local_name;

    /** same helper used by the header language dropdown */
    const goToLocale = async (targetLocale: string) => {
        await changeLocale({
            targetLocale,
            pathname,
            searchParams,
        });
    };

    const releaseTicketThenNavigate = async (targetLocale: string) => {
        const leadId = lead?.id;
        if (!leadId) {
            await goToLocale(targetLocale);
            return;
        }

        try {
            await toast.promise(releaseTicketMutation({ leadId }), {
                loading: { title: t('loading'), type: 'loading' },
                success: { title: t('tickets_released_successfully'), type: 'success' },
                error: { title: t('error_releasing_tickets'), type: 'error' },
            });
        } catch (error) {
            console.error(error);
        } finally {
            deleteLead();
            sessionStorage.removeItem('CHECKOUT_LISTING_ID');
            sessionStorage.removeItem('CHECKOUT_QUANTITY');
            await goToLocale(targetLocale);
        }
    };

    const handleOnClickLanguage = async (newLanguage: string, localName: string) => {
        onOptimisticLanguage?.(localName);

        onClick?.(); // close modal first

        if (locale === newLanguage) return;

        if (currentStep === CheckoutStep.CONFIRM_AND_PAY) {
            await releaseTicketThenNavigate(newLanguage);
            return;
        }

        await goToLocale(newLanguage);
    };
    return (
        <div className="gap-4 grid grid-cols-2">
            {Object.values(languages).map((lang) => {
                const { id, flag_code, local_name, iso_code } = lang;
                const selected = currentLanguage === local_name;

                return (
                    <Button
                        key={id}
                        data-select={selected}
                        className="flex justify-between items-center gap-2 p-2 border-none rounded-lg ring-foreground-300 data-[select=true]:ring-1 hover:ring-1 transition-all"
                        onClick={() => handleOnClickLanguage(iso_code, local_name)}
                        variant="outline"
                    >
                        <span className="flex items-center gap-2">
                            <Image
                                src={`https://flagcdn.com/w40/${flag_code}.webp`}
                                width={30}
                                height={20}
                                alt={`${local_name} flag`}
                                className="w-7.5 h-5 object-cover shrink-0"
                            />
                            <span className="font-medium text-black text-base">{local_name}</span>
                        </span>
                        {selected && <CircleCheck size={20} className="fill-black stroke-white" />}
                    </Button>
                );
            })}
        </div>
    );
};

const CurrencySelector = ({ onClick, currencies }: TabProps) => {
    const [isPending, startTransition] = useTransition();
    const router = useIntlRouter();
    const { currencyCode, setOptimisticCurrencyCode } = useCheckoutData();

    const onCurrencyChange = (newCode: string) => {
        storeCurrencyInCookies(newCode);

        // React 19 requires useOptimistic dispatch actions to be
        // wrapped in startTransition so they don't block the UI thread
        startTransition(() => {
            setOptimisticCurrencyCode(newCode);
            BProgress.start();
            router.refresh({ showProgress: false });
        });

        onClick?.();
    };

    useEffect(() => {
        if (!isPending) BProgress.done();
    }, [isPending]);

    return (
        <div className="gap-4 grid grid-cols-2">
            {Object.values(currencies ?? {}).map((currency) => {
                const { symbol, code } = currency ?? {};
                const selected = code === currencyCode;

                return (
                    <button
                        key={code}
                        data-select={selected}
                        className="flex justify-between items-center gap-2 p-2 rounded-lg ring-foreground-300 data-[select=true]:ring-1 hover:ring-1 transition-all"
                        onClick={() => onCurrencyChange(code)}
                    >
                        <div className="flex items-center gap-2 text-black text-base">
                            <span className="bg-foreground-100 px-1 rounded-md w-10 font-semibold text-sm shrink-0">
                                {symbol}
                            </span>
                            <span className="font-medium">{code}</span>
                        </div>

                        {selected && <CircleCheck size={20} className="fill-black stroke-white" />}
                    </button>
                );
            })}
        </div>
    );
};
