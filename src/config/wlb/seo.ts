import { Domain, SEOSettings } from '@/interfaces/WhiteLabel';
import { createJsonLdConfig } from '@/utils/mappers/jsonLd/utils';
import {
    GIGS_US_ALTERNATE_LINK,
    GIGSBERG_SOCIAL,
    MARCA_SOCIAL,
    METROPOLI_ES_ALTERNATE_LINK,
    METROPOLI_SOCIAL,
    TICKET_MARCA_ALTERNATE_LINK,
} from '@/constants/seo';

import {
    createMarcaOGConfig,
    createMetadataConfig,
    createOpenGraphConfig,
} from '../translations/metadata';

const gigsbergBase: SEOSettings = {
    brandName: { translationKey: 'gigsberg', fallback: 'Gigsberg' },
    robots: { allow: true, blockLocales: ['es-ES'] },
    social: GIGSBERG_SOCIAL,
    metadata: createMetadataConfig(),
    openGraph: createOpenGraphConfig(),
    hreflangs: GIGS_US_ALTERNATE_LINK,
    subtypeDisplayRules: [
        {
            //matches `other-sports`, `other sports`, and other variants with whitespaces
            match: '/(^|\\s)other[- ]sports(?=\\s|$)/gi',
            replace: '',
        },
    ],
    sitemap: {
        rootStrategy: 'show-locales',
        onlySupportOneLocale: false,
        excludedLocales: ['en-GB', 'en-US', 'en', 'us'],
    },
    // matches all variants WITHOUT "-tickets" with suffix "-tickets"
    eventUrlDisplayRule: {
        missing: '-tickets',
        suffix: '-tickets',
    },
    jsonLd: createJsonLdConfig({ orgSchemaId: 'organization-jsonld' }),
    canonical: {
        domainOverrides: {
            es: 'https://entradas.marca.com',
        },
    },
};

const gigsbergUkBase: SEOSettings = {
    ...gigsbergBase,
    jsonLd: {
        ...gigsbergBase.jsonLd!,
        schemaStrategy: {
            ...gigsbergBase.jsonLd!.schemaStrategy,
            orgSchemaId: 'organization-uk-jsonld',
            orgUrl: 'https://www.gigsberg.co.uk',
        },
    },
    sitemap: {
        ...gigsbergBase.sitemap,
        rootStrategy: 'show-types',
        onlySupportOneLocale: true,
    },
};

const marcaBase: SEOSettings = {
    brandName: { translationKey: 'marca', fallback: 'MARCA ENTRADAS' },
    robots: { allow: true, crawlDelay: 0 },
    social: MARCA_SOCIAL,
    metadata: createMetadataConfig('marca'),
    openGraph: createMarcaOGConfig(),
    sitemap: {
        rootStrategy: 'show-locales',
        onlySupportOneLocale: false,
        extraLocales: ['en'],
    },
    jsonLd: createJsonLdConfig({ name: 'ENTRADAS MARCA' }),
};

const metropoliBase: SEOSettings = {
    brandName: { translationKey: 'metropoli', fallback: 'METROPOLI ENTRADAS' },
    robots: { allow: false },
    social: METROPOLI_SOCIAL,
    metadata: createMetadataConfig('metropoli'),
    hreflangs: METROPOLI_ES_ALTERNATE_LINK,
    sitemap: {
        rootStrategy: 'show-locales',
        onlySupportOneLocale: false,
        extraLocales: ['en'],
    },
    jsonLd: createJsonLdConfig({ name: 'METROPOLI ENTRADAS' }),
};

const boletoBase: SEOSettings = {
    brandName: { translationKey: 'boletoconfirmado', fallback: 'boletoconfirmado' },
    robots: { allow: false },
    social: GIGSBERG_SOCIAL,
    metadata: createMetadataConfig('boletoconfirmado'),
    openGraph: createOpenGraphConfig('boletoconfirmado'),
    sitemap: {
        rootStrategy: 'show-locales',
        onlySupportOneLocale: false,
        extraLocales: ['en'],
    },
    jsonLd: createJsonLdConfig({ name: 'boletoconfirmado' }),
};

const transactBase: SEOSettings = {
    brandName: { translationKey: 'transact', fallback: 'TRANSACT ENTERTAINMENT' },
    robots: { allow: false },
    social: GIGSBERG_SOCIAL,
    metadata: createMetadataConfig(),
    openGraph: createOpenGraphConfig('transact'),
    sitemap: {
        rootStrategy: 'show-locales',
        onlySupportOneLocale: false,
        extraLocales: ['en'],
    },
    jsonLd: createJsonLdConfig({ name: 'TRANSACT ENTERTAINMENT' }),
};

const abolaBase: SEOSettings = {
    brandName: { translationKey: 'abola', fallback: 'A BOLA Bilhetes' },
    robots: { allow: false },
    social: GIGSBERG_SOCIAL,
    metadata: createMetadataConfig('abola'),
    openGraph: createOpenGraphConfig('abola'),
    sitemap: {
        rootStrategy: 'show-locales',
        onlySupportOneLocale: false,
        extraLocales: ['en'],
    },
    jsonLd: createJsonLdConfig({ name: 'A BOLA Bilhetes' }),
};

// Configs by domain
export const seoConfigs: Record<Domain, SEOSettings> = {
    // Gigsberg
    'www.gigsberg.com': {
        ...gigsbergBase,
        subtypeDisplayRules: [
            ...(gigsbergBase.subtypeDisplayRules ?? []),
            {
                //matches `soccer world cup and changes it into WC2026`
                match: '/soccer[\\s_-]*world[\\s_-]*cup/i',
                replace: 'World Cup 2026',
            },
        ],
    },
    'www.gigsberg.co.uk': gigsbergUkBase,
    'www.gigsberg.ch': {
        ...gigsbergBase,
        robots: {
            ...gigsbergBase.robots,
            allowAdsBots: true,
            noindexHeader: true,
        },
    },
    'marketplace.dev.gigsberg.com': {
        ...gigsbergBase,
        robots: { allow: false },
        subtypeDisplayRules: [
            ...(gigsbergBase.subtypeDisplayRules ?? []),
            {
                //matches `soccer world cup and changes it into WC2026`
                match: '/soccer[\\s_-]*world[\\s_-]*cup/i',
                replace: 'World Cup 2026',
            },
        ],
    },
    'marketplace.dev.gigsberg.co.uk': {
        ...gigsbergUkBase,
        robots: { allow: false },
        jsonLd: {
            ...gigsbergBase.jsonLd!,
            schemaStrategy: {
                ...gigsbergBase.jsonLd!.schemaStrategy,
                orgUrl: 'https://www.gigsberg.co.uk',
            },
        },
        sitemap: {
            ...gigsbergBase.sitemap,
            rootStrategy: 'show-types',
            onlySupportOneLocale: true,
        },
    },
    'pre-marketplace.gigsberg.com': {
        ...gigsbergBase,
        robots: { allow: false },
        subtypeDisplayRules: [
            ...(gigsbergBase.subtypeDisplayRules ?? []),
            {
                //matches `soccer world cup and changes it into WC2026`
                match: '/soccer[\\s_-]*world[\\s_-]*cup/i',
                replace: 'World Cup 2026',
            },
        ],
    },
    'pre-marketplace.gigsberg.co.uk': {
        ...gigsbergUkBase,
        robots: { allow: false },
        jsonLd: {
            ...gigsbergBase.jsonLd!,
            schemaStrategy: {
                ...gigsbergBase.jsonLd!.schemaStrategy,
                orgUrl: 'https://www.gigsberg.co.uk',
            },
        },
        sitemap: {
            ...gigsbergBase.sitemap,
            rootStrategy: 'show-types',
            onlySupportOneLocale: true,
        },
    },
    'marketplace-preprod.gigsberg.com': {
        ...gigsbergBase,
        robots: { allow: false },
        subtypeDisplayRules: [
            ...(gigsbergBase.subtypeDisplayRules ?? []),
            {
                //matches `soccer world cup and changes it into WC2026`
                match: '/soccer[\\s_-]*world[\\s_-]*cup/i',
                replace: 'World Cup 2026',
            },
        ],
    },

    // Metropoli
    'entradas.elmundo.es': metropoliBase,
    'metropoli.gigsberg.com': metropoliBase,
    'metropoli.dev.gigsberg.com': metropoliBase,

    // Marca
    'entradas.marca.com': {
        ...marcaBase,
        robots: {
            ...marcaBase.robots,
            blockPaths: ['/en', '/en/*'],
            blockLocales: ['en-GB'],
        },
    },
    'tickets.marca.com': {
        ...marcaBase,
        hreflangs: TICKET_MARCA_ALTERNATE_LINK,
    },
    'marca.dev.gigsberg.com': {
        ...marcaBase,
        robots: { allow: false },
    },
    'pre-marca.gigsberg.com': {
        ...marcaBase,
        robots: { allow: false },
    },

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
        robots: { allow: false },
    },
    'takemytickets.gigsberg.com': {
        robots: { allow: false },
    },
    'takemytickets.co.in': {
        robots: { allow: false },
    },
    'international.takemytickets.co.in': {
        robots: { allow: false },
    },
};
