'use client';

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type PropsWithChildren,
} from 'react';
import Cookies from 'js-cookie';

import User from '@/interfaces/User';
import { setAddresses } from '@/stores/addresses';

interface Credentials {
    user: User | null;
    token?: string | null;
}

interface UserActions {
    setCredentials: (credentials: Credentials) => void;
    resetCredentials: () => void;
}

const UserContext = createContext<User | null | undefined>(undefined);
const UserActionsContext = createContext<UserActions | null>(null);

interface UserProviderProps extends PropsWithChildren {
    initialUser: User | null;
}

export function UserProvider({ initialUser, children }: UserProviderProps) {
    // Server data seeds this instance; local credential changes own subsequent updates.
    const [user, setUser] = useState(initialUser);

    const setCredentials = useCallback(({ user, token }: Credentials) => {
        if (token) Cookies.set('te_co', token, { expires: 7 });
        setUser(user);
    }, []);

    const resetCredentials = useCallback(() => {
        Cookies.remove('te_co');
        setAddresses([]);
        setUser(null);
    }, []);

    const actions = useMemo(
        () => ({ setCredentials, resetCredentials }),
        [setCredentials, resetCredentials]
    );

    return (
        <UserActionsContext.Provider value={actions}>
            <UserContext.Provider value={user}>{children}</UserContext.Provider>
        </UserActionsContext.Provider>
    );
}

export function useUser() {
    const user = useContext(UserContext);
    if (user === undefined) throw new Error('useUser must be used within a UserProvider');
    return user;
}

export function useUserActions() {
    const actions = useContext(UserActionsContext);
    if (!actions) throw new Error('useUserActions must be used within a UserProvider');
    return actions;
}
