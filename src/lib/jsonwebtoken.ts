import { JWTPayload, jwtVerify, SignJWT } from 'jose';

const sessionKey = new TextEncoder().encode(process.env.NEXT_PUBLIC_SESSION_SECRET);

const secureKey = new TextEncoder().encode(process.env.SECURE_TRADING_SECRET);

export type TokenPayload<T> = JWTPayload & T;

export const EXPIRES_IN = 60 * 60;

export const generateToken = async <T>(payload: TokenPayload<T>): Promise<string> => {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${EXPIRES_IN}s`)
        .sign(sessionKey);
};

export const verifyToken = async <T>(
    token?: string,
    type: 'session' | 'secure' = 'session'
): Promise<TokenPayload<T> | null> => {
    try {
        if (!token) return null;

        const key = type === 'session' ? sessionKey : secureKey;

        const { payload } = await jwtVerify<TokenPayload<T>>(token, key, {
            algorithms: ['HS256'],
        });

        return payload;
    } catch {
        return null;
    }
};
