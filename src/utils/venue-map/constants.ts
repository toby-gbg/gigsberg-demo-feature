// Venue name (lowercase, substring) -> { BE category (lowercase, substring) -> SVG category } ==> CATEGORY CONFIGURATION
export const VENUE_CATEGORY_ALIASES: Record<string, Record<string, string>> = {
    'emirates stadium': {
        'shortside upper level': 'Shortside Upper Tier',
        'shortside lower level': 'Shortside Lower Tier',
        'longside upper level': 'Longside Upper Tier',
        'longside lower level': 'Longside Lower Tier',
        'club level longside': 'Club Level',
        'club level shortside': 'Club Level',
        'central longside upper': 'Central Upper',
        'central longside lower': 'Central Lower',
        'executive private box': 'Executive Box Level',
        'executive private boxes': 'Executive Box Level',
    },
    'stamford bridge': {
        hospitality: 'Hospitality',
        westview: 'West Stand',
        'executive club boxes': 'Club',
    },
    'hill dickinson stadium': {
        'vip packages': 'VIP',
    },
    'etihad stadium': {
        'longside lower tier': 'Longside Lower Level',
        'longside upper tier': 'Longside Upper Level',
    },
};

// Venue name (lowercase, substring) -> { BE category (lowercase, substring) -> SVG category } ==> BLOCK CONFIGURATION
export const VENUE_BLOCK_ALIASES: Record<string, Record<string, string>> = {
    'emirates stadium': {
        dlamondclub: 'Dlamond Club',
        'dlamond club': 'DlamondClub',
    },
};
