'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';

import { C } from '@/interfaces/Currency';
import { EventDetail } from '@/interfaces/Event';
import { SellForm } from '@/interfaces/Sell';
import { useCreateListingMutation } from '@/swr/features/listings';

import { useUser } from '@/providers/UserProvider';
import useIntlRouter from '@/hooks/useIntlRouter';

import MainContainer from '@/components/MainContainer';
import { Button } from '@/components/ui/Button';
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Dialog';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';

import SellTicketTutorial from '../../_components/SellTicketTutorial';
import Stepper from '../../_components/Stepper';
import { CLICKED_STORAGE_KEY } from '../../_constants/sellTicketsSeen';
import GuaranteeAndConfirmation from './GuaranteeAndConfirmation';
import SellTicketError from './SellTicketError';
import SellTicketEventSummarySection from './SellTicketEventSummarySection';
import SellTicketForm from './SellTicketForm';

export interface SellTicketEventViewProps {
    event: EventDetail;
    hasListing: boolean;
    currencies: C;
    currencyCode: string;
}
const ITALY_COUNTRY_ID = 664;

export default function SellTicketEventView({
    event,
    hasListing,
    currencies,
    currencyCode,
}: SellTicketEventViewProps) {
    const t = useTranslations();
    const router = useIntlRouter();
    const user = useUser();

    const [showTutorial, setShowTutorial] = useState<boolean | null>(hasListing ? false : null);
    const [activeStep, setActiveStep] = useState<number>(0);
    const [openItalyNotice, setOpenItalyNotice] = useState(event.countryId === ITALY_COUNTRY_ID);

    const { trigger: createListingMutation } = useCreateListingMutation({
        onSuccess: () => {
            toast.close('sell-tickets-loading');
            toast.add({ title: t('success'), type: 'success' });
            router.push(`/account-settings/listings`);
        },
        onError: (error) => {
            toast.close('sell-tickets-loading');
            toast.add({ title: t(error.data.errorKey), type: 'error' });
        },
    });

    const methods = useForm<SellForm>({
        mode: 'onChange',
        defaultValues: {
            quantity: 1,
            presented_quantity: 12,
            // ticket_type: TicketTypeEnum.E_TICKET,
            face_value_currency: user?.seller_per_ticket_currency?.code ?? 'USD',
            ticket_price_currency: user?.seller_per_ticket_currency?.code ?? 'USD',
            is_seller_confirmed_ticket_price: user?.seller_per_ticket_currency_id
                ? true
                : undefined,
            additional_relevant_information: [],
        },
    });

    const { handleSubmit } = methods;

    const stepchildren = [
        {
            label: t('ticket_information'),
            children: <SellTicketForm event={event} currencies={currencies ?? {}} />,
        },
        {
            label: t('guarantee_and_confirmation'),
            children: <GuaranteeAndConfirmation />,
        },
    ];

    const setCurrentStep = (step: number) => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
        setActiveStep(step);
    };

    const onSubmit = handleSubmit((data) => {
        if (!currencies) return;
        toast.add({ id: 'sell-tickets-loading', title: t('loading'), type: 'loading', timeout: 0 });
        createListingMutation({ form: data, eventId: event.id, currencies });
    });

    useEffect(() => {
        const clicked = localStorage.getItem(CLICKED_STORAGE_KEY) === 'true';
        setShowTutorial(!hasListing && !clicked);
    }, [hasListing]);

    const handleTutorialNext = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setShowTutorial(false);
    };

    if (event.isProOnly && !user?.is_pro) {
        return (
            <div className="pt-8">
                <SellTicketError message={t('selling_error_on_pro_event')} />
            </div>
        );
    }

    if (showTutorial === null) {
        return (
            <div className="flex flex-col justify-center items-center min-h-115">
                <Spinner className="text-main-start" />
            </div>
        );
    }

    if (showTutorial) {
        return <SellTicketTutorial onNextStep={handleTutorialNext} />;
    }

    return (
        <>
            <div className="bg-white py-6">
                <MainContainer>
                    <FormProvider {...methods}>
                        <form onSubmit={onSubmit} noValidate>
                            <Stepper
                                activeStep={activeStep}
                                SummarySection={
                                    <SellTicketEventSummarySection
                                        event={event}
                                        currencyCode={currencyCode}
                                    />
                                }
                                onNextStep={() => setCurrentStep(1)}
                            >
                                {stepchildren.map((child, index) => (
                                    <Stepper.Step
                                        key={index}
                                        label={child.label}
                                        onStep={setCurrentStep}
                                    >
                                        {child.children}
                                    </Stepper.Step>
                                ))}
                            </Stepper>
                        </form>
                    </FormProvider>
                </MainContainer>
            </div>

            <Dialog open={openItalyNotice} onOpenChange={setOpenItalyNotice}>
                <DialogContent showCloseButton={false} classNames={{ popup: 'max-w-sm!' }}>
                    <DialogHeader className="text-center">
                        <DialogTitle className="p-0!">
                            {t('sell_ticket_italy_notice_title')}
                        </DialogTitle>
                    </DialogHeader>

                    <DialogBody className="text-error text-center">
                        {t('sell_ticket_italy_notice_content')}
                    </DialogBody>

                    <DialogFooter className="flex justify-center items-center- mt-6">
                        <Button onClick={() => setOpenItalyNotice(false)} className="text-sm">
                            {t('confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
