export function toOptionalNumber(value?: string) {
    if (!value) return undefined;

    const num = Number(value);

    return Number.isNaN(num) ? undefined : num;
}
