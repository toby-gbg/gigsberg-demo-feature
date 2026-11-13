import Language from './Language';

export enum WebsiteFonts {
    Poppins = 'Poppins',
    Roboto = 'Roboto',
    Alpha = 'Alpha',
    AlfaSlabOne = 'Alfa Slab One',
    Rosario = 'Rosario',
    OpenSans = 'Open Sans',
}

export default interface Website {
    id: number;
    logo: string;
    domain: string;
    name: string;
    header_gradient_start: string;
    header_gradient_end: string;
    text_on_header: string;
    main_gradient_start: string;
    main_gradient_end: string;
    text_on_main: string;
    is_gradient: boolean;
    bg_solid: string;
    text_on_solid: string;
    text_primary: string;
    text_secondary: string;
    published: boolean;
    description: string | null;
    created_at: string;
    updated_at: string;
    languages: Language[];
    clarity_com?: string;
    clarity_couk?: string;
    section_title_font: WebsiteFonts;
    headline_font: WebsiteFonts;
    favicon: string;
    logo_es: string;
    logo_dark: string | null;
    gtm_id: string | null;
    ga4_id: string | null;
}

interface Affiliate {
    id: number;
    name: string;
    code: string;
}

export interface PrimaryAffiliate {
    id: number;
    website_id: number;
    affiliate_id: number;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    website: Pick<Website, 'domain' | 'id'>;
    affiliate: Affiliate;
}
