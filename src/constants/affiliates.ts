export const TRACKING_SOURCES = [
    { param: 'gclid', origin: 'google' },
    { param: 'gbraid', origin: 'google' },
    { param: 'wbraid', origin: 'google' },
    { param: 'fbclid', origin: 'facebook' },
    { param: 'sblid', origin: 'stereoboard' },
    { param: 'rwlid', origin: 'redweb' },
    { param: 'tcclid', origin: 'ticketcompare' },
    { param: 'stclid', origin: 'safetickets' },
    { param: 'spclid', origin: 'seatpick' },
    { param: 'wgclid', origin: 'wegow' },
];

export const FTN_AFFILIATE_ID = 23;
export const XS2EVENT_ID = 27;

export const EXCLUDED_AFFILIATE_SOURCES = ['google', 'luup', 'bing'];
export const GOOGLE_SEARCH_ORIGIN = 'google.com';

export const AFFILIATE_COMMISSION_PERCENTAGE = 8;
export const BRAND_NAME = 'Gigsberg';
export const AFFILIATE_COOKIE_DAYS = 10;
export const RATING_VALUE = '4.2';
export const RATING_MAX = 5;

export const AFFILIATE_CARDS = [
    {
        title: 'Content Creators & Bloggers',
        desc: 'Write about music, sports or lifestyle? Embed our links and earn on every sale.',
        key_title: 'content_creators_bloggers',
        key_desc: 'content_creators_description',
    },
    {
        title: 'SEO & Performance Marketers',
        desc: 'Turn organic traffic into commission. Deep inventory, always something to promote.',
        key_title: 'seo_marketers',
        key_desc: 'seo_marketers_description',
    },
    {
        title: 'Social Media Influencers',
        desc: 'Share Gigsberg links with your audience and earn on every sale you inspire.',
        key_title: 'social_media_influencers',
        key_desc: 'social_media_description',
    },
    {
        title: 'Existing Affiliate Networks',
        desc: 'Our API integrates cleanly alongside your current partners.',
        key_title: 'affiliate_networks',
        key_desc: 'affiliate_networks_description',
    },
];

export const AFFILIATE_TAGS = [
    { emoji: '🎵', label: 'Concerts', key: 'concerts' },
    { emoji: '⚽', label: 'Sports', key: 'sports' },
    { emoji: '🎭', label: 'Theatre', key: 'theatre' },
];
