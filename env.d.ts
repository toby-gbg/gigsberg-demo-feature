namespace NodeJS {
    interface ProcessEnv {
        NEXT_PUBLIC_STRIPE_PUBLIC_KEY: string;
        NEXT_PUBLIC_API_BASE_URL: string;
        NEXT_PUBLIC_FRONT_API_BASE_URL: string;
        NEXT_PUBLIC_IMAGE_URL: string;
        NEXT_PUBLIC_FRONT_URL?: string;
        NEXT_PUBLIC_DEBUG_IP?: string;
        NEXT_PUBLIC_SESSION_SECRET: string;
        NEXT_PUBLIC_GOOGLE_MERCHANT_ID: string;
        NEXT_PUBLIC_PAYCOM_IDENTIFIER: string;
        REDIS_URL: string;
        NEXT_PUBLIC_GTM_ID: string;
        NEXT_PUBLIC_GA4_ID: string;
        NEXT_PUBLIC_FACEBOOK_PIXEL_ID: string;
        SECURE_TRADING_SECRET: string;
        NEXT_PUBLIC_ISLIVE: string;

        PRODUCTION_DOMAINS: string;

        NEXT_PUBLIC_NOMUPAY_BASE_URL: string;
        NEXT_PUBLIC_NOMUPAY_ENTITY_ID: string;
        NOMUPAY_TOKEN: string;

        NEXT_PUBLIC_PAYMENT_NOMUPAY_TICKETS_ENTITY_ID: string;
        NEXT_PUBLIC_PAYMENT_NOMUPAY_ENTRADAS_ENTITY_ID: string;
        PAYMENT_NOMUPAY_TICKETS_TOKEN: string;
        PAYMENT_NOMUPAY_ENTRADAS_TOKEN: string;
        API_KEY: string;

        // Spreedly (client-side only — all server secrets are in Fastify)
        NEXT_PUBLIC_SPREEDLY_ENABLED: string;
    }
}
