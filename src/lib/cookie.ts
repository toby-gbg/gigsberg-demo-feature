import 'server-only';

import { cookies as getCookies } from 'next/headers';

import { verifyToken } from './jsonwebtoken';

export default class Cookie {
    static async get<D extends string | undefined>(key: string): Promise<D> {
        const cookieStore = await getCookies();
        return cookieStore.get(key)?.value as D;
    }

    static async getSafe<D extends string | undefined>(key: string): Promise<D | null> {
        try {
            return await this.get<D>(key);
        } catch {
            return null;
        }
    }

    static async getEncryptedCookie<T>(name: string): Promise<T | null> {
        const token = await this.get(name);
        if (!token) return null;

        try {
            const decoded = await verifyToken<T>(token);
            return decoded ?? null;
        } catch (error) {
            console.error('Invalid cookie token', error);
            return null;
        }
    }

    static async delete(name: string): Promise<void> {
        const cookieStore = await getCookies();
        cookieStore.delete(name);
    }

    static async ip(): Promise<string | null> {
        if (process.env.NEXT_PUBLIC_DEBUG_IP) {
            return process.env.NEXT_PUBLIC_DEBUG_IP;
        }

        return Cookie.getSafe('x-user-ip');
    }
}
