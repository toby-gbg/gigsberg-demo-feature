import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';

import Headers from '@/lib/headers';
import { websiteApi } from '@/services/server/website';

import '@/assets/css/globals.css';

import Link from 'next/link';

import { cn } from '@/lib/cn';
import getFonts from '@/utils/getFonts';

import DebugToolbar from '@/components/DebugToolbar';

export default async function NotFound() {
    const [domainInfo, t, website, locale] = await Promise.all([
        Headers.getDomainInfo(),
        getTranslations(),
        websiteApi.getWebsite(),
        getLocale(),
    ]);

    const font = getFonts(website.headline_font);
    const { main_gradient_start, main_gradient_end, text_on_main, name } = website;

    // Custom logo
    const useCustomLogo = domainInfo.config?.features?.useCustomLogoPath;
    const logoSrc = useCustomLogo ? `/logo/${name.toLowerCase()}.avif` : website.logo;

    return (
        <>
            <head>
                <title>{`${t('page_not_found') || '404 - Page Not Found'} - ${domainInfo.websiteName || 'Gigsberg'}`}</title>
                <meta name="robots" content="noindex, follow" />
            </head>
            <div className="relative min-h-screen w-full overflow-hidden">
                <Image
                    className="absolute inset-0 bg-cover bg-center md:hidden"
                    src="/404_bg/404_wlb_mobile.jpg"
                    alt="Background Image"
                    fill
                    sizes="100vw"
                    style={{ objectFit: 'cover' }}
                />
                <Image
                    className="absolute inset-0 hidden bg-cover bg-center md:block"
                    src="/404_bg/404_wlb_desktop.jpg"
                    alt="Background Image"
                    fill
                    sizes="100vw"
                    style={{ objectFit: 'cover' }}
                />

                {/* Content */}
                <div className={cn('relative z-10 flex min-h-screen flex-col', font.className)}>
                    {/* Header */}
                    <header className="absolute top-6 left-1/2 mx-auto -translate-x-1/2 md:top-12">
                        <Image
                            src={logoSrc}
                            alt={website.name}
                            width={180}
                            height={40}
                            className="size-auto max-h-10 md:max-h-12"
                        />
                    </header>

                    {/* Main Content */}
                    <main className="flex flex-1 items-center justify-center px-4">
                        <div className="max-w-2xl text-center text-white">
                            <h1 className="my-3 text-3xl font-bold sm:text-4xl md:text-5xl">
                                {t('title_404')}
                            </h1>
                            <p className="text-base opacity-55 sm:text-lg md:text-xl">
                                {t('description_404')}
                            </p>
                            <Link href={`/${locale.split('-')[0]}`}>
                                <button
                                    style={{
                                        background: `linear-gradient(to right, ${main_gradient_start}, ${main_gradient_end})`,
                                        color: text_on_main,
                                    }}
                                    className="my-8 inline-block rounded px-6 py-3 text-[16px] font-semibold"
                                >
                                    {t('cta_404')}
                                </button>
                            </Link>
                        </div>
                    </main>
                </div>
            </div>

            {process.env.NEXT_PUBLIC_DEBUG_MODE === '1' ? (
                <DebugToolbar locale={locale} website={website} />
            ) : null}
        </>
    );
}
