import _default from './default';
import marca from './marca';

export type HeaderMenu = {
    name: string;
    href: string;
    subMenu: {
        name: string;
        href: string;
    }[];
}[];

const getWebsiteMenu = (website: string): HeaderMenu => {
    if (
        ['entradas', 'tickets', 'marketplace-dev', 'marca', 'metropoli', 'metropoli-dev'].includes(
            website
        )
    ) {
        return marca();
    }

    return _default;
};

export default getWebsiteMenu;
