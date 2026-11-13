import Language, { L } from '@/interfaces/Language';
import { cn } from '@/lib/cn';
import { defaultLocales } from '@/constants/locales';

interface VisibleLanguageOptions {
    languages: L;
    locale: string;
    hostname?: string;
    onlySupportOneLocale?: boolean;
}

/**
 * Languages actually rendered in the header dropdown.
 * Single-locale sites (CO.UK) keep only the current language.
 * Multi-locale sites keep the languages that site supports.
 */
export function getVisibleHeaderLanguages({
    languages,
    locale,
    hostname,
    onlySupportOneLocale,
}: VisibleLanguageOptions): Language[] {
    const all = Object.values(languages);
    const supported = hostname ? defaultLocales[hostname] : undefined;
    const allowed = new Set((supported ?? []).map((code) => code.toLowerCase()));
    const relevant = allowed.size
        ? all.filter((language) => allowed.has(language.iso_code.toLowerCase()))
        : all;
    const singleLocaleDomain =
        Boolean(onlySupportOneLocale) || (supported != null && supported.length <= 1);

    if (singleLocaleDomain) {
        const pool = relevant.length > 0 ? relevant : all;
        const current =
            pool.find((language) => language.iso_code.toLowerCase() === locale.toLowerCase()) ??
            pool[0];

        return current ? [current] : [];
    }

    if (relevant.length === 0) return all;

    return relevant;
}

/**
 * Panel classes for the languages that are actually shown.
 * One language hugs that option. Several keep the existing grid.
 */
export function getLanguageDropdownClassNames(visibleCount: number): {
    className: string;
    controlledContentClassName: string;
} {
    if (visibleCount <= 1) {
        return {
            className: 'w-max! max-w-max! grid-cols-[max-content]! overflow-visible!',
            controlledContentClassName: 'w-max! min-w-0! max-w-max!',
        };
    }

    return {
        className: cn(
            'max-[375px]:grid-cols-2',
            visibleCount === 2 ? 'min-[375px]:grid-cols-2' : 'min-[375px]:grid-cols-3'
        ),
        controlledContentClassName: 'max-[375px]:w-55! max-[375px]:min-w-auto!',
    };
}
