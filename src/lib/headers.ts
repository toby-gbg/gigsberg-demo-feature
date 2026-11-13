import 'server-only';

import { cache } from 'react';
import { cookies, headers as getHeaders } from 'next/headers';
import { NextRequest } from 'next/server';

import { DomainInfo } from '@/interfaces/Header';
import { WhiteLabelConfig } from '@/interfaces/WhiteLabel';
import { getDomainInformations } from '@/utils/domain';

export default class Headers {
    public domain: string;
    public hostname: string;
    public publicSuffix: string;
    public subdomain: string | null;
    public domainWithoutSuffix: string;
    public websiteName: string;
    public defaultLocale: string;
    public config: WhiteLabelConfig;
    public isStage: boolean;
    public isProtectedDomain: boolean;

    constructor(protected request: NextRequest) {
        const {
            domain,
            hostname,
            subdomain,
            publicSuffix,
            domainWithoutSuffix,
            websiteName,
            defaultLocale,
            isStage,
            isProtectedDomain,
            config,
        } = getDomainInformations(this.host);

        this.domain = domain;
        this.hostname = hostname;
        this.subdomain = subdomain;
        this.publicSuffix = publicSuffix;
        this.domainWithoutSuffix = domainWithoutSuffix;
        this.websiteName = websiteName;
        this.defaultLocale = defaultLocale;
        this.isStage = isStage;
        this.isProtectedDomain = isProtectedDomain;
        this.config = config;
    }

    get toJson() {
        return JSON.stringify(getDomainInformations(this.host));
    }

    private getHostnameWithSuffix(suffix?: string): string {
        const subdomainPart = this.subdomain ? `${this.subdomain}.` : '';
        return `${this.request.nextUrl.protocol}//${subdomainPart}${this.domainWithoutSuffix}.${
            suffix ?? this.publicSuffix
        }`;
    }

    private getFullUrlWithSuffix(suffix?: string): string {
        const url = this.getHostnameWithSuffix(suffix);
        return `${url}${this.pathname}${this.request.nextUrl.search}`;
    }

    get host(): string {
        return process.env.NEXT_PUBLIC_FRONT_URL ?? this.request.headers.get('host') ?? '';
    }

    get referer(): string {
        return this.request.headers.get('referer') || '';
    }

    get comUrl(): string {
        return this.getFullUrlWithSuffix('com');
    }

    get pathname(): string {
        return this.request.nextUrl.pathname;
    }

    get currentUrl(): string {
        return this.getFullUrlWithSuffix();
    }

    get comHostmame(): string {
        return this.getHostnameWithSuffix('com');
    }

    get coUkUrl(): string {
        return this.getFullUrlWithSuffix('co.uk');
    }

    get coUkHostmame(): string {
        return this.getHostnameWithSuffix('co.uk');
    }

    get fullDomain(): string {
        return this.hostname;
    }

    get ip(): string {
        const headers = this.request.headers;

        const xff = headers.get('x-forwarded-for');
        if (xff) return xff.split(',')[0].trim();

        return headers.get('cf-connecting-ip') || headers.get('x-real-ip') || 'unknown';
    }

    static async get<R extends string | null>(name: string): Promise<R> {
        const headerStore = await getHeaders();
        return headerStore.get(name) as R;
    }

    static getDomainInfo = cache(async (): Promise<DomainInfo> => {
        const host = process.env.NEXT_PUBLIC_FRONT_URL ?? ((await this.get('host')) as string);

        return getDomainInformations(host);
    });

    static getHostname = cache(async (): Promise<string> => {
        const { hostname } = await Headers.getDomainInfo();

        return hostname;
    });

    static getExplicitLocale = cache(async (): Promise<string | null> => {
        const cookieStore = await cookies();
        return cookieStore.get('x-explicit-locale')?.value ?? null;
    });

    static getPathName = cache(async (): Promise<string> => {
        return Headers.get('x-pathname');
    });

    static async getCurrentUrl(): Promise<string> {
        return this.get('x-url');
    }

    static getReferer = cache(async (): Promise<string> => {
        return (await this.get('referer')) || '';
    });

    static async getBaseUrl(): Promise<string> {
        const protocol = (await Headers.get('x-forwarded-proto')) || 'https';
        const host = await Headers.get('host');
        return `${protocol}://${host}`;
    }
}
