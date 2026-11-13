import defaultMenu from './default';
import type { HeaderMenu } from './index';

const defaultSport = {
    name: 'sports',
    href: '/sport-tickets',
    subMenu: [
        { name: 'sport_football', href: '/sport-tickets/football' },
        { name: 'sport_tennis', href: '/sport-tickets/tennis' },
        { name: 'sport_rugby', href: '/sport-tickets/rugby' },
        { name: 'sport_ufc', href: '/sport-tickets/ufc' },
        { name: 'sport_boxing', href: '/sport-tickets/boxing' },
        { name: 'sport_nba', href: '/sport-tickets/nba' },
        { name: 'sport_nfl', href: '/sport-tickets/nfl' },
        { name: 'sport_nhl', href: '/sport-tickets/nhl' },
        { name: 'sport_mlb', href: '/sport-tickets/mlb' },
        { name: 'all_sports', href: '/sport-tickets' },
    ],
};

const getMarcaMenu = (): HeaderMenu => {
    const menuWithoutSport = defaultMenu.filter((item) => item.name !== 'sports');

    return [defaultSport, ...menuWithoutSport];
};

export default getMarcaMenu;
