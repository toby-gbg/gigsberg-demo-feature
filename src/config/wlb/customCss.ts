import { CustomCssSettings, Domain } from '@/interfaces/WhiteLabel';

const abolaBase: CustomCssSettings = {
    fontBase: '18px',
    headingFontSize: '30px',
    headingFontWeight: '800',
    btnFontSize: '14px',
    btnFontWeight: '700',
};

const metropoliBase: CustomCssSettings = {
    breadcrumbBorder: '1px solid var(--text-secondary)',
    trustBenefitBorder: '1px solid var(--text-secondary)',
};

export const customCssConfigs: Record<Domain, CustomCssSettings> = {
    // Gigsberg
    'www.gigsberg.com': {},
    'www.gigsberg.co.uk': {},
    'www.gigsberg.ch': {},
    'marketplace.dev.gigsberg.com': {},
    'marketplace.dev.gigsberg.co.uk': {},
    'pre-marketplace.gigsberg.com': {},
    'pre-marketplace.gigsberg.co.uk': {},
    'marketplace-preprod.gigsberg.com': {},

    // Metropoli
    'entradas.elmundo.es': metropoliBase,
    'metropoli.gigsberg.com': metropoliBase,
    'metropoli.dev.gigsberg.com': metropoliBase,

    // Marca
    'entradas.marca.com': {},
    'tickets.marca.com': {},
    'marca.dev.gigsberg.com': {},
    'pre-marca.gigsberg.com': {},

    // Boleto
    'www.boletoconfirmado.com': {},
    'boletoconfirmado.dev.gigsberg.com': {},

    // Transact
    'www.transact-entertainment.com': {},
    'transactmediagroup.gigsberg.com': {},
    'transactmediagroup.dev.gigsberg.com': {},
    // Abola
    'bilhetes.abola.pt': abolaBase,
    'abola.dev.gigsberg.com': abolaBase,
    // take my tickets
    'takemytickets.dev.gigsberg.com': {},
    'takemytickets.gigsberg.com': {},
    'takemytickets.co.in': {},
    'international.takemytickets.co.in': {},
};
