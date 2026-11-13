import { NextRequest, NextResponse } from 'next/server';

import Headers from '@/lib/headers';
import Path from '@/lib/path';

import { WhiteLabelConfig } from './WhiteLabel';

export interface ProxyContext {
    request: NextRequest;
    headers: Headers;
    path: Path;
    config: WhiteLabelConfig;
    affiliate: {
        hasParam: boolean;
        hasCookie: boolean;
    };
    i18n: {
        defaultLocale: string;
        locales: string[];
    };
    locale?: string;
}

export type MiddlewareResult = NextResponse | undefined | void;

export type ProxyMiddleware = (ctx: ProxyContext) => MiddlewareResult | Promise<MiddlewareResult>;
