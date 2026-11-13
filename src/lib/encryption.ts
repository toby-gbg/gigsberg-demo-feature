import 'server-only';

export default class Encryption {
    private static readonly METHOD = 'AES-CBC';
    private static readonly SECRET_KEY = 'wrgw2q45g_abcdef123456789abcdefg';

    static async encrypt(data: string): Promise<string> {
        const iv = crypto.getRandomValues(new Uint8Array(16));

        const key = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(this.SECRET_KEY),
            { name: this.METHOD },
            false,
            ['encrypt']
        );

        const encrypted = await crypto.subtle.encrypt(
            {
                name: this.METHOD,
                iv: iv,
            },
            key,
            new TextEncoder().encode(data)
        );

        return btoa(
            String.fromCharCode(...new Uint8Array(encrypted)) +
                '::' +
                btoa(String.fromCharCode(...iv))
        );
    }

    static async createCookie(referrer: string): Promise<string> {
        const cookieData = `${Date.now()}|${referrer}`;
        return this.encrypt(cookieData);
    }
}
