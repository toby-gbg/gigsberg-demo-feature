export function safeStringify(data: unknown): string {
    try {
        const seen = new WeakSet<object>();
        return JSON.stringify(data, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                const obj = value as object;
                if (seen.has(obj)) return '[Circular]';
                seen.add(obj);
            }
            return value;
        });
    } catch {
        try {
            return String(data);
        } catch {
            return '[Unserializable]';
        }
    }
}
