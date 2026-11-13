export function toCapitalizeWords(str: string) {
    if (!str) return '';
    return str
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

export const parseRegex = (value: string): RegExp => {
    const match = value.match(/^\/(.+)\/([a-z]*)$/i);

    if (!match) {
        return new RegExp('');
    }

    return new RegExp(match[1], match[2]);
};
