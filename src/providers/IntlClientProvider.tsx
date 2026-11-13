'use client';

import { ComponentProps, FC, PropsWithChildren } from 'react';
import { ProgressProvider } from '@bprogress/next/app';
import { NextIntlClientProvider } from 'next-intl';

import { Toaster } from '@/components/ui/Toast';

type NextIntlClientProviderProps = ComponentProps<typeof NextIntlClientProvider>;

interface IntlClientProviderProps {
    messages: NonNullable<NextIntlClientProviderProps['messages']>;
    locale: string;
}

const IntlClientProvider: FC<PropsWithChildren<IntlClientProviderProps>> = ({
    children,
    messages,
    locale,
}) => {
    function onError(error: Parameters<NonNullable<NextIntlClientProviderProps['onError']>>[0]) {
        if (error.code === 'MISSING_MESSAGE') return;
    }

    function getMessageFallback({
        namespace,
        key,
        error,
    }: Parameters<NonNullable<NextIntlClientProviderProps['getMessageFallback']>>[0]) {
        const path = [namespace, key].filter((part) => part != null).join('.');

        if (error.code === 'MISSING_MESSAGE') {
            return path + ' is not yet translated';
        }

        return 'Dear developer, please fix this message: ' + path;
    }

    return (
        <NextIntlClientProvider
            locale={locale}
            messages={messages}
            onError={onError}
            getMessageFallback={getMessageFallback}
            timeZone="Europe/Paris"
        >
            <>
                <ProgressProvider
                    height="4px"
                    color="#a78bfa"
                    options={{
                        showSpinner: false,
                    }}
                    shallowRouting
                >
                    {children}
                </ProgressProvider>
                <Toaster timeout={3500} />
            </>
        </NextIntlClientProvider>
    );
};

export default IntlClientProvider;
