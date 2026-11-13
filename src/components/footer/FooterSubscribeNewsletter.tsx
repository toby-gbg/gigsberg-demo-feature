'use client';

import { FC } from 'react';
import { useTranslations } from 'next-intl';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import { NewsletterForm } from '@/interfaces/Newsletter';
import { useRegisterNewsletterMutation } from '@/swr/features/newsletter';

import { toast } from '@/components/ui/Toast';

import StoreNewsletterForm from '../StoreNewsletterForm';

const FooterSubscribeNewsletter: FC = () => {
    const t = useTranslations();

    const methods = useForm<NewsletterForm>();
    const { handleSubmit, reset } = methods;

    const { trigger: registerNewsletter, isMutating: isLoading } = useRegisterNewsletterMutation({
        onSuccess: () => {
            toast.add({ title: t('thank_you_for_subscribing'), type: 'success' });
            reset();
        },
        onError: (error) => toast.add({ title: t(error.data.errorKey), type: 'error' }),
    });

    const onSubmit: SubmitHandler<NewsletterForm> = async (data) => {
        registerNewsletter(data);
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <StoreNewsletterForm isLoading={isLoading} />
            </form>
        </FormProvider>
    );
};

export default FooterSubscribeNewsletter;
