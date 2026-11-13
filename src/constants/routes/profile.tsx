import { Power, ShoppingCart, Ticket, User } from 'lucide-react';

import Route from '@/interfaces/Route';

const PROFILE_ROUTES: Route[] = [
    {
        action: 'my_account',
        url: '/account-settings',
        icon: <User size={16} />,
    },
    {
        action: 'my_tickets',
        url: '/account-settings/purchases',
        icon: <Ticket size={16} />,
    },
    {
        action: 'my_sales',
        url: '/account-settings/sales',
        icon: <ShoppingCart size={16} />,
        scope: 'seller',
    },
    {
        action: 'logout',
        icon: <Power size={16} />,
    },
];

export default PROFILE_ROUTES;
