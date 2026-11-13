export function hexToRgb(hex: string): string | null {
    let hexValue = hex.replace(/^#/, '');

    // Example: "F00" -> "FF0000"
    if (hexValue.length === 3) {
        hexValue = hexValue
            .split('')
            .map((char) => char + char)
            .join('');
    }

    // Ensure it's a 6-digit hex code now
    if (hexValue.length !== 6) {
        console.error('Invalid hex code provided:', hex);
        return null;
    }

    // Parse the r, g, b values from the 6-digit hex
    const bigint = parseInt(hexValue, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `${r} ${g} ${b}`;
}

export const isLightColor = (color: string): boolean => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 128;
};
