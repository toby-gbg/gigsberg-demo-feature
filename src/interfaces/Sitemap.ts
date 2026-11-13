export type SitemapRecordType = {
    nameUrl: string;
    nameEs: string | null;
    subtypeNameUrl?: string;
};

export type SitemapDataType = {
    activeLanguageCodes: string[];
    types: (SitemapRecordType & {
        subTypes?: (SitemapRecordType & {
            tours?: SitemapRecordType[];
            performers?: SitemapRecordType[];
        })[];
    })[];
};

export type ChangeFreqType =
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
