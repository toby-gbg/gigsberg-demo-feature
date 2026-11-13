import { DOMAINS } from '@/constants/domains';
import { HeaderMenu } from '@/constants/menus';

export interface CanonicalConfig {
    domainOverrides?: Record<string, string>;
}

export type PaymentProviderStrategy = 'STRIPE_ONLY' | 'FIBONATIX_PRIORITY' | 'NOMUPAY_PRIORITY';

export type Domain = (typeof DOMAINS)[number];

export type MetadataVariableKey =
    | 'type'
    | 'subtype'
    | 'event'
    | 'eventName'
    | 'name'
    | 'eventVenue'
    | 'venue'
    | 'eventCity'
    | 'tourName'
    | 'brandName'
    | 'currentYear'
    | 'city';

export type SitemapRootStrategy = 'show-types' | 'show-locales';
export interface RobotsConfig {
    allow: boolean;
    crawlDelay?: number;
    blockPaths?: string[];
    blockLocales?: string[];
    allowAdsBots?: boolean;
    noindexHeader?: boolean;
}

export interface SocialHandles {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    appIdFacebook?: string; // For Facebook App ID, used in Open Graph metadata
    x?: string; // For Twitter handle, used in Twitter Card metadata
    whatapps?: string; // For WhatsApp link, used for sharing
    youtube?: string; // For YouTube channel, used in metadata and sharing
    linkedin?: string; // For LinkedIn profile, used in metadata and sharing
}
//==============================================================
//===================METADATA CONFIGS TYPE======================
//==============================================================

export type MetadataTranslationItem = {
    translationKey: string;
    variableKeys?: MetadataVariableKey[];
};

type MetadataConfigKey =
    | 'title'
    | 'description'
    | 'titleType'
    | 'titleSubtype'
    | 'titleEvent'
    | 'titleListing'
    | 'titleListingSport'
    | 'titleListingConcert'
    | 'titleListingFestival'
    | 'titleListingComedy'
    | 'titleListingTheatre';

export type MetadataConfig = Partial<Record<MetadataConfigKey, MetadataTranslationItem>>;

export interface OpenGraphConfig {
    ogTitle?: MetadataTranslationItem;
    ogDescription?: MetadataTranslationItem;
}

export type BrandNameConfig = {
    translationKey?: string;
    fallback: string;
};

/**
 * match - a string, could be regexp or an exact string, needs to be string to pass from server to client
 * replace - the string that we will use to replace the matching part
 */
export interface StringReplaceRule {
    match: string;
    replace: string;
}

export type SitemapConfig = {
    rootStrategy?: SitemapRootStrategy;
    onlySupportOneLocale?: boolean;
    excludedLocales?: string[];
    extraLocales?: string[];
};

export interface JsonLdConfigs {
    // Defines which schema types to render on this domain
    activeSchemas: Array<'Organization' | 'Breadcrumbs' | 'Event' | 'Listing' | 'FAQ'>;

    // Strategy settings for mapping the data
    schemaStrategy: {
        orgSchemaId: string;
        '@id': string;
        name: string;
        orgUrl: string;
        logo: string;
        description: string;
        // In future, if more fields are diverse, add here to config"
    };
}

export interface SEOSettings {
    robots: RobotsConfig;
    social?: SocialHandles;
    metadata?: MetadataConfig;
    hreflangs?: Record<string, string>;
    brandName?: BrandNameConfig;
    openGraph?: OpenGraphConfig;
    sitemap?: SitemapConfig;
    subtypeDisplayRules?: StringReplaceRule[];
    eventUrlDisplayRule?: {
        missing: string;
        suffix: string;
    };
    jsonLd?: JsonLdConfigs;
    canonical?: CanonicalConfig;
}

export interface StripeExpressMethods {
    googlePay?: 'always' | 'never';
    applePay?: 'always' | 'never';
}

export interface PaymentSettings {
    providerStrategy?: PaymentProviderStrategy;
    useNomupayElements?: boolean;
    stripeExpressMethods?: StripeExpressMethods;
    nomupayEntityId?: string;
    nomupayToken?: string;
}

export interface TopBannerSettings {
    enable?: boolean;
    discountCode?: string;
    discountPercentage?: string;
    validUntil?: string;
}

export interface MobileVisualBannerSettings {
    enable?: boolean;
}

export interface BlackFridayModalSettings {
    enable?: boolean;
    expiresAt?: string;
    storageKey: string;
    couponCode: string;
}

export interface CustomCssSettings {
    fontBase?: string;
    headingFontSize?: string;
    headingFontWeight?: string;
    btnFontSize?: string;
    btnFontWeight?: string;
    breadcrumbBorder?: string;
    trustBenefitBorder?: string;
}

export interface EventDomainRedirect {
    eventSlug: string;
    targetDomain: string;
}

export interface FeatureSettings {
    mobileVisualBanner?: MobileVisualBannerSettings;
    mobileDownloadBannerHomepage?: boolean;
    topBanner?: TopBannerSettings;
    showStudentDiscount?: boolean;
    blackFridayModal?: BlackFridayModalSettings;
    useBrandedContent?: boolean;
    useBrandStyling?: boolean;
    showResaleTooltip?: boolean;
    useCustomLogoPath?: boolean;
    useSpanishLogo?: boolean;
    partners?: string[];
    useThemeBackground?: boolean;
    useLocalePrefixMap?: boolean;
    shouldHidePoweredBy?: boolean;
    onlySupportedCountryCodes?: string[];
    onlySupportOneLocale?: boolean;
    showSellerName?: boolean;
    useGrossPrice?: boolean;
    redirectUnsupportedLocalesToHome?: boolean;
    restrictedEventRedirects?: EventDomainRedirect[];
    disableAffiliateProgram?: boolean;
    disableTicketSelling?: boolean;
    redirectUkUserAndEventToCoUk?: boolean;
    headerMenu?: HeaderMenu;

    // this is for the domains that have insufficient contrast between header and search bar
    useReverseSearchBarColors?: boolean;

    showTrustBanner?: boolean;
    defaultCurrencyCode?: string;
    showDownloadAppModal?: boolean;
}

export interface AnalyticsSettings {
    marfeel?: boolean;
    tealium?: boolean;
    enableGoogleService?: boolean;
}

export interface WhiteLabelConfig {
    payment?: PaymentSettings;
    seo?: SEOSettings;
    features?: FeatureSettings;
    analytics?: AnalyticsSettings;
    customCss?: CustomCssSettings;
}
