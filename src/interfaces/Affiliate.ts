export interface AffiliateTrackVisit {
    origin: string;
    url: string;
    ip: string | undefined;
    userId?: number | null;
    unregCookie?: string;
    value?: string;
    referer?: string;
    domain?: string;
}

export interface AffiliateProgram {
    email: string;
    first_name: string;
    last_name: string;
    phone_prefix: string;
    phone: string;
    company: string;
    country: string;
    monthly_visitors: string;
    website: string;
    drive_traffic_question: string;
}

export default interface Affiliate {
    id: number;
    name: string;
    contact_email: string;
    seller_id: number | null;
    api_key: string | null;
    code: string | null;
}
