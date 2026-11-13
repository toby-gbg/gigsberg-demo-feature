const menu = [
    {
        name: 'concerts',
        href: '/concert-tickets',
        subMenu: [
            { name: 'genre_rock', href: '/concert-tickets/rock' },
            { name: 'genre_pop', href: '/concert-tickets/pop' },
            { name: 'genre_hard_rock_metal', href: '/concert-tickets/hard-rock-metal' },
            { name: 'genre_rock_pop', href: '/concert-tickets/rock-pop' },
            { name: 'genre_rap', href: '/concert-tickets/rap' },
            { name: 'genre_hip_hop_reggae', href: '/concert-tickets/rap-hip-hop-reggae' },
            {
                name: 'genre_alternative_indie',
                href: '/concert-tickets/alternative-indie',
            },
            { name: 'all_concerts', href: '/concert-tickets' },
        ],
    },
    {
        name: 'sports',
        href: '/sport-tickets',
        subMenu: [
            { name: 'sport_football', href: '/sport-tickets/football' },
            { name: 'sport_rugby', href: '/sport-tickets/rugby' },
            { name: 'sport_darts', href: '/sport-tickets/darts' },
            { name: 'sport_tennis', href: '/sport-tickets/tennis' },
            { name: 'sport_american_football', href: '/sport-tickets/american-football' },
            { name: 'sport_wwe', href: '/sport-tickets/wrestling' },
            { name: 'all_sports', href: '/sport-tickets' },
        ],
    },
    {
        name: 'comedy',
        href: '/comedy-tickets',
        subMenu: [
            { name: 'comedy', href: '/comedy-tickets/comedy' },
            { name: 'category_all_comedy', href: '/comedy-tickets' },
        ],
    },
    {
        name: 'festivals',
        href: '/festival-tickets',
        subMenu: [
            { name: 'country_united_kingdom', href: '/festival-tickets/uk-festivals' },
            { name: 'country_spain', href: '/festival-tickets/festivals-in-spain' },
            {
                name: 'country_netherlands',
                href: '/festival-tickets/festivals-in-netherlands',
            },
            {
                name: 'country_australia',
                href: '/festival-tickets/festivals-in-australia',
            },

            {
                name: 'category_international_festivals',
                href: '/festival-tickets/international-festivals',
            },
            { name: 'category_all_festivals', href: '/festival-tickets' },
        ],
    },
    {
        name: 'theatre',
        href: '/theatre-tickets',
        subMenu: [
            { name: 'category_classical', href: '/theatre-tickets/classical' },
            {
                name: 'category_conferences_tours',
                href: '/theatre-tickets/conferences-and-speaking-tours',
            },
            { name: 'category_ballet_dance', href: '/theatre-tickets/ballet-dance' },
            { name: 'category_shows', href: '/theatre-tickets/shows' },
            { name: 'category_all_theatre', href: '/theatre-tickets' },
        ],
    },
];

export default menu;
