import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

import locales, { prefixes } from '@/constants/locales';

export const routing = defineRouting({
    locales,
    defaultLocale: 'en-GB',
    localePrefix: {
        mode: 'as-needed',
        prefixes,
    },
    localeDetection: false,
    localeCookie: false,
    alternateLinks: false,
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
