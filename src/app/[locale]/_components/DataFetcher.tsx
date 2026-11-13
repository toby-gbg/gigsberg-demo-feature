import { PropsWithChildren, Suspense } from 'react';
import { all } from 'better-all';
import { getLocale, getMessages } from 'next-intl/server';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { cn } from '@/lib/cn';
import Headers from '@/lib/headers';
import { isRTL } from '@/utils/common';
import { userApi } from '@/services/server/users';
import { websiteApi } from '@/services/server/website';
import { SWRProvider } from '@/swr/provider';

import IntlClientProvider from '@/providers/IntlClientProvider';
import { SiteProvider } from '@/providers/SiteProvider';
import { UserProvider } from '@/providers/UserProvider';

import Footer from '@/components/footer';
import HeaderLayer from '@/components/HeaderLayer';
import { shouldShowFooter } from '@/components/SectionVisibility';
import TrustBanner from '@/components/TrustBanner';

import Breadcrumbs from './Breadcrumbs';
import DeferredsWidgets from './DeferredWidgets';
import Description from './Description';
import MainHeader from './MainHeader';
import ReleaseTicket from './ReleaseTicket';

interface DataFetcherProps extends PropsWithChildren {
    authModal: React.ReactNode;
}

const DataFetcher = async ({ children, authModal }: DataFetcherProps) => {
    const { locale, messages, domainInfo, referer, user, website } = await all({
        async locale() {
            return getLocale();
        },
        async messages() {
            return getMessages();
        },
        async domainInfo() {
            return Headers.getDomainInfo();
        },
        async referer() {
            return Headers.getReferer();
        },
        async user() {
            return userApi.getCurrentUser();
        },
        async website() {
            return websiteApi.getWebsite();
        },
    });

    const isDebug = process.env.NEXT_PUBLIC_DEBUG_MODE === '1';
    const dir = isRTL(locale) ? 'rtl' : 'ltr';
    const shouldUseThemeBackground = domainInfo?.config?.features?.useThemeBackground;

    return (
        <html
            data-theme={domainInfo.domainWithoutSuffix}
            lang={locale}
            dir={dir}
            className="scroll-smooth"
            data-scroll-behavior="smooth" // https://nextjs.org/docs/messages/missing-data-scroll-behavior
        >
            {/* injects the white-label theme tokens and body font into the head. */}
            <HeaderLayer domainInfo={domainInfo} locale={locale} website={website} />

            <body
                className="flex flex-col bg-zinc-100 min-h-screen overflow-x-hidden"
                data-subdomain={domainInfo.subdomain}
                data-domain={domainInfo.domain}
                data-suffix={domainInfo.publicSuffix}
                data-hostname={domainInfo.hostname}
                data-domain-without-suffix={domainInfo.domainWithoutSuffix}
                data-image-url={process.env.NEXT_PUBLIC_IMAGE_URL}
                suppressHydrationWarning
            >
                {/* Skip to main content link for keyboard navigation */}
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:top-4 focus:left-4 focus:z-9999 focus:absolute focus:bg-white focus:shadow-lg focus:px-4 focus:py-2 focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:text-black"
                    aria-label="Skip to main content"
                >
                    Skip to main content
                </a>

                <SiteProvider domainInfo={domainInfo} website={website}>
                    <IntlClientProvider locale={locale} messages={messages}>
                        <UserProvider initialUser={user}>
                            <NuqsAdapter defaultOptions={{ shallow: false }}>
                                <SWRProvider>
                                    {authModal}
                                    <div
                                        id="modal-root"
                                        role="region"
                                        aria-live="polite"
                                        aria-atomic="true"
                                        aria-label="Modal dialogs"
                                    />

                                    <ReleaseTicket />

                                    <Description />
                                    <MainHeader website={website} />
                                    <Breadcrumbs />

                                    <TrustBanner />

                                    <DeferredsWidgets
                                        referer={referer}
                                        isDebug={isDebug}
                                        locale={locale}
                                    />
                                    {/* <BlackFridayModal /> */}

                                    <main
                                        id="main-content"
                                        className={cn(
                                            'relative flex-1',
                                            shouldUseThemeBackground && 'bg-main-start'
                                        )}
                                        role="main"
                                        aria-label="Main content"
                                    >
                                        {children}
                                    </main>
                                    <Suspense>
                                        <Footer showSection={shouldShowFooter} website={website} />
                                    </Suspense>
                                </SWRProvider>
                            </NuqsAdapter>
                        </UserProvider>
                    </IntlClientProvider>
                </SiteProvider>
            </body>
        </html>
    );
};

export default DataFetcher;
