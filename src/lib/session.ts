import 'server-only';

import { NextRequest } from 'next/server';

import { userApi } from '@/services/server/users';
import { isProtectedPath } from '@/constants/routes/auth';

import { verifyToken } from './jsonwebtoken';

interface UserSession {
    id: number;
    email: string;
}

export default class Session {
    constructor(public request: NextRequest) {}

    get isProtectedRoute(): boolean {
        return isProtectedPath(this.request.nextUrl.pathname);
    }

    get sessionToken(): string | null {
        return this.request.cookies.get('te_co')?.value || null;
    }

    async shouldProtect(): Promise<boolean> {
        if (this.isProtectedRoute) {
            const user = await userApi.getCurrentUser();
            return !user;
        }

        return false;
    }

    async getUserId(): Promise<number | null> {
        const token = this.sessionToken;

        if (!token) return null;

        const payload = await verifyToken<UserSession>(token);

        if (payload) return payload?.id;

        this.request.cookies.delete('te_co');

        return null;
    }
}
