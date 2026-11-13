import { AnalyticsSettings, Domain } from '@/interfaces/WhiteLabel';

const gigsbergBase = (options: Partial<AnalyticsSettings> = {}): AnalyticsSettings => ({
    ...options,
});

const marcaBase = (options: Partial<AnalyticsSettings> = {}): AnalyticsSettings => ({
    marfeel: true,
    ...options,
});

const metropoliBase = (options: Partial<AnalyticsSettings> = {}): AnalyticsSettings => ({
    tealium: true,
    marfeel: true,
    ...options,
});

// Configs by domain
export const analyticsConfigs: Record<Domain, AnalyticsSettings> = {
    // Gigsberg
    'www.gigsberg.com': gigsbergBase(),
    'www.gigsberg.co.uk': gigsbergBase(),
    'www.gigsberg.ch': gigsbergBase(),
    'marketplace.dev.gigsberg.com': gigsbergBase({ enableGoogleService: true }),
    'marketplace.dev.gigsberg.co.uk': gigsbergBase(),
    'pre-marketplace.gigsberg.com': gigsbergBase(),
    'pre-marketplace.gigsberg.co.uk': gigsbergBase(),
    'marketplace-preprod.gigsberg.com': gigsbergBase(),

    // Metropoli
    'entradas.elmundo.es': metropoliBase(),
    'metropoli.gigsberg.com': metropoliBase(),
    'metropoli.dev.gigsberg.com': metropoliBase(),

    // Marca
    'entradas.marca.com': marcaBase(),
    'tickets.marca.com': marcaBase(),
    'marca.dev.gigsberg.com': marcaBase(),
    'pre-marca.gigsberg.com': marcaBase(),

    // Boleto
    'www.boletoconfirmado.com': {},
    'boletoconfirmado.dev.gigsberg.com': {},

    // Transact
    'www.transact-entertainment.com': {},
    'transactmediagroup.gigsberg.com': {},
    'transactmediagroup.dev.gigsberg.com': {},

    // Abola
    'bilhetes.abola.pt': {},
    'abola.dev.gigsberg.com': {},

    // take my tickets
    'takemytickets.dev.gigsberg.com': {},
    'takemytickets.gigsberg.com': {},
    'takemytickets.co.in': {},
    'international.takemytickets.co.in': {},
};
