import { Domain, PaymentSettings } from '@/interfaces/WhiteLabel';

const gigsbergBase: PaymentSettings = {
    useNomupayElements: true,
};

const marcaBase: PaymentSettings = {
    useNomupayElements: true,
};

const metropoliBase: PaymentSettings = {
    providerStrategy: 'STRIPE_ONLY',
    stripeExpressMethods: {
        googlePay: 'always',
        applePay: 'always',
    },
};

const boletoBase: PaymentSettings = {
    providerStrategy: 'FIBONATIX_PRIORITY',
    stripeExpressMethods: {
        googlePay: 'always',
        applePay: 'always',
    },
};

const transactBase: PaymentSettings = {
    providerStrategy: 'STRIPE_ONLY',
    stripeExpressMethods: {
        googlePay: 'always',
        applePay: 'always',
    },
};

const abolaBase: PaymentSettings = {
    providerStrategy: 'STRIPE_ONLY',
    stripeExpressMethods: {
        googlePay: 'always',
        applePay: 'always',
    },
};

const takeMyTicketsBase: PaymentSettings = {
    providerStrategy: 'STRIPE_ONLY',
    stripeExpressMethods: {
        googlePay: 'always',
        applePay: 'always',
    },
};

export const paymentConfigs: Record<Domain, PaymentSettings> = {
    // Gigsberg
    'www.gigsberg.com': gigsbergBase,
    'www.gigsberg.co.uk': gigsbergBase,
    'www.gigsberg.ch': {
        providerStrategy: 'STRIPE_ONLY',
        stripeExpressMethods: {
            googlePay: 'always',
            applePay: 'always',
        },
    },
    'marketplace.dev.gigsberg.com': gigsbergBase,
    'marketplace.dev.gigsberg.co.uk': gigsbergBase,
    'pre-marketplace.gigsberg.com': gigsbergBase,
    'pre-marketplace.gigsberg.co.uk': gigsbergBase,
    'marketplace-preprod.gigsberg.com': gigsbergBase,

    // Marca
    'entradas.marca.com': {
        ...marcaBase,
        nomupayEntityId: process.env.NEXT_PUBLIC_PAYMENT_NOMUPAY_ENTRADAS_ENTITY_ID,
        nomupayToken: process.env.PAYMENT_NOMUPAY_ENTRADAS_TOKEN,
    },
    'tickets.marca.com': {
        ...marcaBase,
        nomupayEntityId: process.env.NEXT_PUBLIC_PAYMENT_NOMUPAY_TICKETS_ENTITY_ID,
        nomupayToken: process.env.PAYMENT_NOMUPAY_TICKETS_TOKEN,
    },
    'marca.dev.gigsberg.com': marcaBase,
    'pre-marca.gigsberg.com': marcaBase,

    // Metropoli
    'entradas.elmundo.es': metropoliBase,
    'metropoli.gigsberg.com': metropoliBase,
    'metropoli.dev.gigsberg.com': metropoliBase,

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
    'takemytickets.dev.gigsberg.com': takeMyTicketsBase,
    'takemytickets.gigsberg.com': takeMyTicketsBase,
    'takemytickets.co.in': takeMyTicketsBase,
    'international.takemytickets.co.in': takeMyTicketsBase,
};
