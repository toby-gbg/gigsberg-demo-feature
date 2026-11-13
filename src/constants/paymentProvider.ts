// Current supported payment providers for client selection
export const paymentProviders = ['fibonatix', 'nomupay', 'secure', 'paycom'] as const;

/** When true, Spreedly is the only active payment provider system-wide */
export const isSpreedlyEnabled = process.env.NEXT_PUBLIC_SPREEDLY_ENABLED === 'true';
