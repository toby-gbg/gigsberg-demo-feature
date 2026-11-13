import { FC } from 'react';

import { DomainInfo } from '@/interfaces/Header';
import Website from '@/interfaces/Website';
import { hexToRgb } from '@/utils/color';
import getFonts from '@/utils/getFonts';
import { HEADLINE_FONT_CLASS, SECTION_TITLE_FONT_CLASS } from '@/constants/fonts';

import DeferredConsents from './DeferredConsents';
import GoogleServiceManager from './GoogleServiceManager';

// white-label theme for the document
// injected into <head> so the `:root` tokens and body font are ready before first paint.
const buildThemeCss = (website: Website, domainInfo: DomainInfo): string => {
    const rgb = (hex?: string, fallback = '0 0 0') =>
        hex ? (hexToRgb(hex) ?? fallback) : fallback;

    const {
        header_gradient_start = '#000',
        header_gradient_end = '#000',
        text_on_header = '#fff',
        main_gradient_start,
        main_gradient_end,
        text_on_main = '#fff',
        bg_solid,
        text_on_solid = '#fff',
        text_primary = '#000',
        text_secondary = '#666',
        headline_font,
        section_title_font,
    } = website || {};

    const headline = getFonts(headline_font)?.style || { fontFamily: 'inherit' };
    const sectionTitle = getFonts(section_title_font)?.style || { fontFamily: 'inherit' };

    const {
        fontBase = 'inherit',
        headingFontSize = 'inherit',
        headingFontWeight = 'inherit',
        btnFontSize = 'inherit',
        btnFontWeight = 'inherit',
        breadcrumbBorder = 'inherit',
        trustBenefitBorder = 'inherit',
    } = domainInfo?.config?.customCss || {};

    return `
        :root {
            --header-gradient-start: ${header_gradient_start};
            --header-gradient-end: ${header_gradient_end};
            --text-on-header: ${text_on_header};
            --main-gradient-start: ${rgb(main_gradient_start)};
            --main-gradient-end: ${rgb(main_gradient_end)};
            --text-on-main: ${text_on_main};
            --bg-solid: ${rgb(bg_solid)};
            --text-on-solid: ${text_on_solid};
            --text-primary: ${text_primary};
            --text-secondary: ${text_secondary};
            --toastify-z-index: 2147483641;

            --font-base: ${fontBase};
            --heading--font-size: ${headingFontSize};
            --heading--font-weight: ${headingFontWeight};
            --btn--font-size: ${btnFontSize};
            --btn--font-weight: ${btnFontWeight};
            --breadcrumb-border: ${breadcrumbBorder};
            --trust-benefit-border: ${trustBenefitBorder};
        }
        body {
            font-family: ${headline.fontFamily};
            ${headline.fontWeight ? `font-weight: ${headline.fontWeight};` : ''}
            ${headline.fontStyle ? `font-style: ${headline.fontStyle};` : ''}
        }
        .${HEADLINE_FONT_CLASS} {
            font-family: ${headline.fontFamily};
        }
        .${SECTION_TITLE_FONT_CLASS} {
            font-family: ${sectionTitle.fontFamily};
        }
    `;
};
interface HeaderLayerProps {
    domainInfo: DomainInfo;
    locale: string;
    website?: Website | null;
}

const HeaderLayer: FC<HeaderLayerProps> = async ({ domainInfo, locale, website }) => {
    const { isProtectedDomain, config } = domainInfo;
    const { header_gradient_start, ga4_id, gtm_id, name } = website || {};

    const blockLocales = config?.seo?.robots?.blockLocales ?? [];
    const isNoIndex = blockLocales.includes(locale);

    const analytics = config?.analytics;
    const allowRobot = config?.seo?.robots?.allow;

    return (
        <head>
            {website && <style>{buildThemeCss(website, domainInfo)}</style>}
            {/* Move Google Service Manager up to ensure it running first */}
            {(!isProtectedDomain || analytics?.enableGoogleService) && (
                <GoogleServiceManager ga4_id={ga4_id} gtm_id={gtm_id} />
            )}
            {!isProtectedDomain && <DeferredConsents websiteName={name} analytics={analytics} />}

            <meta charSet="utf-8" />
            <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"
            />
            <meta name="theme-color" content={header_gradient_start} />
            <link rel="icon" href="/favicon.ico" />
            <link rel="shortcut icon" type="image/ico" href="/favicon.ico" />
            {isProtectedDomain || !allowRobot ? (
                <meta name="robots" content="noindex, nofollow" />
            ) : (
                <meta
                    name="robots"
                    content={
                        (isNoIndex ? 'noindex' : 'index') + ', follow, max-image-preview:large'
                    }
                />
            )}
        </head>
    );
};

export default HeaderLayer;
