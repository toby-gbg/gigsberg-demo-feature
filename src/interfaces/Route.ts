import { JSX } from 'react';

export default interface Route {
    action: string;
    url?: string;
    icon: JSX.Element;
    scope?: 'seller' | 'buyer';
}
