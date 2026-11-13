import { hasLocale, IntlErrorCode } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    // Check if the locale is valid, otherwise use default
    if (!locale || !hasLocale(routing.locales, locale)) {
        locale = routing.defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
        onError(error) {
            if (error.code === IntlErrorCode.MISSING_MESSAGE) {
                return;
            }
        },

        getMessageFallback({ namespace, key, error }) {
            const path = [namespace, key].filter((part) => part != null).join('.');

            if (error.code === IntlErrorCode.MISSING_MESSAGE) {
                return path + ' is not yet translated';
            } else {
                return 'Dear developer, please fix this message: ' + path;
            }
        },
    };
});
