import { Domain, FeatureSettings } from '@/interfaces/WhiteLabel';
import getMarcaMenu from '@/constants/menus/marca';
import { MARCA_PARTNERS } from '@/constants/partners';
import { RESTRICTED_EVENT_REDIRECTS } from '@/constants/url';

const gigsbergBase: FeatureSettings = {
    mobileVisualBanner: {
        enable: false,
    },
    mobileDownloadBannerHomepage: true,
    topBanner: {
        enable: false,
        discountCode: 'SPRING10',
        discountPercentage: '10%',
        validUntil: '2026-05-31',
    },
    showStudentDiscount: true,
    blackFridayModal: {
        enable: false,
        expiresAt: '2026-05-31T23:59:59',
        storageKey: 'spring-10-modal-seen',
        couponCode: 'SPRING10',
    },
    useBrandedContent: true,
    useBrandStyling: true,
    restrictedEventRedirects: RESTRICTED_EVENT_REDIRECTS,
    redirectUkUserAndEventToCoUk: true,
    shouldHidePoweredBy: true,

    useReverseSearchBarColors: true,

    showTrustBanner: true,
    showDownloadAppModal: true,
};

const gigsbergCoUkBase: FeatureSettings = {
    ...gigsbergBase,
    onlySupportedCountryCodes: ['GB'],
    onlySupportOneLocale: true,
    showSellerName: true,
    useGrossPrice: true,
    redirectUnsupportedLocalesToHome: true,
};

const metropoliBase: FeatureSettings = {
    useCustomLogoPath: true,
    useThemeBackground: true,
};

const marcaBase: FeatureSettings = {
    showResaleTooltip: true,
    useCustomLogoPath: true,
    partners: MARCA_PARTNERS,
    disableTicketSelling: true,
    headerMenu: getMarcaMenu(),
    disableAffiliateProgram: true,
};

const boletoBase: FeatureSettings = {
    useCustomLogoPath: true,
    useLocalePrefixMap: true,
};

const abolaBase: FeatureSettings = {
    useLocalePrefixMap: true,
};

const transactBase: FeatureSettings = { useReverseSearchBarColors: true };

const takeMyTicketsBase: FeatureSettings = {
    showStudentDiscount: false,
    disableTicketSelling: true,
    disableAffiliateProgram: true,
    partners: MARCA_PARTNERS,
    defaultCurrencyCode: 'INR',
};

export const featuresConfigs: Record<Domain, FeatureSettings> = {
    // Gigsberg
    'www.gigsberg.com': gigsbergBase,
    'www.gigsberg.co.uk': gigsbergCoUkBase,
    'www.gigsberg.ch': {
        ...gigsbergBase,
        restrictedEventRedirects: [],
    },
    'marketplace.dev.gigsberg.com': gigsbergBase,
    'marketplace.dev.gigsberg.co.uk': gigsbergCoUkBase,
    'pre-marketplace.gigsberg.com': gigsbergBase,
    'pre-marketplace.gigsberg.co.uk': gigsbergCoUkBase,
    'marketplace-preprod.gigsberg.com': gigsbergBase,

    // Metropoli
    'entradas.elmundo.es': metropoliBase,
    'metropoli.gigsberg.com': metropoliBase,
    'metropoli.dev.gigsberg.com': metropoliBase,

    // Marca
    'entradas.marca.com': {
        ...marcaBase,
        useLocalePrefixMap: true,
    },
    'tickets.marca.com': {
        ...marcaBase,
        useSpanishLogo: false,
    },
    'marca.dev.gigsberg.com': marcaBase,
    'pre-marca.gigsberg.com': marcaBase,

    // Boleto
    'www.boletoconfirmado.com': boletoBase,
    'boletoconfirmado.dev.gigsberg.com': boletoBase,

    // Transact
    'www.transact-entertainment.com': transactBase,
    'transactmediagroup.gigsberg.com': transactBase,
    'transactmediagroup.dev.gigsberg.com': transactBase,

    // Abola
    'bilhetes.abola.pt': abolaBase,
    'abola.dev.gigsberg.com': abolaBase,

    // Take My Tickets
    'takemytickets.dev.gigsberg.com': {
        ...takeMyTicketsBase,
    },
    'takemytickets.gigsberg.com': {
        ...takeMyTicketsBase,
    },
    'takemytickets.co.in': {
        ...takeMyTicketsBase,
    },
    'international.takemytickets.co.in': {
        ...takeMyTicketsBase,
    },
};
