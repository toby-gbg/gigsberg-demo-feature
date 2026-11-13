import 'server-only';

import { NextRequest, NextResponse } from 'next/server';

import { isSearchResultReferer } from '@/utils/affiliateTracking';
import { affiliateApi } from '@/services/server/affiliates';
import { EXCLUDED_AFFILIATE_SOURCES, TRACKING_SOURCES } from '@/constants/affiliates';

import Encryption from './encryption';
import Headers from './headers';
import Session from './session';

interface AffiliateBody {
    url: string;
    referer?: string;
}

export default class Affiliate {
    private headers: Headers;
    private session: Session;

    constructor(
        protected request: NextRequest,
        private response: NextResponse,
        private body: AffiliateBody
    ) {
        this.headers = new Headers(request);
        this.session = new Session(request);
    }

    static async startTracking(request: NextRequest, response: NextResponse, body: AffiliateBody) {
        const instance = new this(request, response, body);

        if (await instance.handleAffiliateParam()) return;
        if (await instance.handleUtmSourceParam()) return;
        if (await instance.handleTrackingSources()) return;
        await instance.handleSearchReferer();
    }

    private async handleAffiliateParam(): Promise<boolean> {
        const affName = this.getUrlParam('aff');
        if (!affName) return false;

        const affiliate = await affiliateApi.getAffiliate(affName);
        if (!affiliate) return false;

        await this.storeAffiliateName(affiliate.name);
        return true;
    }

    private async handleUtmSourceParam(): Promise<boolean> {
        const utmSource = this.getUrlParam('utm_source');
        if (!utmSource) return false;

        let origin = utmSource;
        //Bypass calling affiliate for excluded sources
        if (!EXCLUDED_AFFILIATE_SOURCES.includes(utmSource)) {
            const affiliate = await affiliateApi.getAffiliate(utmSource);
            if (!affiliate) return false;

            origin = affiliate.name;
        }

        await this.storeAffiliateName(origin);
        return true;
    }

    private async handleSearchReferer(): Promise<boolean> {
        const referer = this.body.referer || this.headers.referer;
        const url = this.body.url;
        if (!isSearchResultReferer(referer, url)) return false;

        //Store with origin = Organic
        await this.storeAffiliateName('organic');
        return true;
    }

    private async handleTrackingSources(): Promise<boolean> {
        for (const { origin, param } of TRACKING_SOURCES) {
            const value = this.getUrlParam(param);
            if (!value) continue;

            await this.storeAffiliateName(origin);
            return true;
        }
        return false;
    }

    private async storeAffiliateName(origin: string) {
        const encryptedValue = await Encryption.encrypt(origin);
        const unregCookie = await Encryption.createCookie(origin);

        this.response.cookies.delete('gc');
        this.response.cookies.set({
            name: 'gc',
            value: unregCookie,
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 14,
            path: '/',
        });

        const userId = await this.session.getUserId();

        // Use the referer from the request body (original referrer from client)
        // Fall back to the HTTP header referer if not provided
        const referer = this.body.referer || this.headers.referer;

        // Backend rejects urls longer than 400 chars (often long affiliate/UTM query strings)
        const url = this.body.url.slice(0, 400);

        await affiliateApi.postAffiliateTrackVisit({
            origin,
            url,
            ip: this.headers.ip,
            userId,
            unregCookie,
            value: encryptedValue,
            referer,
            domain: this.headers.domain,
        });
    }

    private getUrlParam(value: string): string | null {
        const url = new URL(this.body.url);
        const param = url.searchParams.get(value);
        return param;
    }
}
