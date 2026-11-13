import type { SpreedlyFieldError } from '@/utils/spreedlyErrors';

export interface SpreedlySdkError extends SpreedlyFieldError {
    errors?: SpreedlyFieldError[];
}

export interface SpreedlyTokenResponse {
    tokenResponse?: {
        payment_method?: Record<string, unknown> & { token?: string };
    };
}

export interface SpreedlyHostedFieldsInstance {
    on(event: 'ready', callback: () => void): void;
    on(event: 'tokenGenerated', callback: (response: SpreedlyTokenResponse) => void): void;
    on(event: 'error', callback: (error: SpreedlySdkError | string | null) => void): void;
    inAppElements(config: { number: { containerId: string }; cvv: { containerId: string } }): void;
    setFieldType(field: string, type: string): void;
    setPlaceholder(field: string, placeholder: string): void;
    setStyles(field: string, styles: Record<string, string>): void;
    submit(data: Record<string, string>): void;
    // SDK 1.0.1 has no public destroy method; this removes its window message listener.
    _removeMessageListener?(): void;
}

declare global {
    interface Window {
        SpreedlyHostedFields?: new (config: Record<string, string>) => SpreedlyHostedFieldsInstance;
        dataLayer: Record<string, unknown>[];
        /* eslint-disable @typescript-eslint/no-explicit-any */
        fbq: (...args: any[]) => void;
    }

    type RouteContext<T extends string> = {
        params: Promise<{
            [K in ParseRouteParams<T>]: string;
        }>;
    };

    type ParseRouteParams<T extends string> =
        T extends `${infer _Start}[${infer Param}]${infer Rest}`
            ? Param | ParseRouteParams<Rest>
            : never;
}

export {};
