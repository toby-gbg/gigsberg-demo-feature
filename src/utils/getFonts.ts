import { Alfa_Slab_One, Open_Sans, Poppins, Roboto, Rosario } from 'next/font/google';

// Create font instances at module scope (required by next/font)
export const poppinsFont = Poppins({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600'],
    display: 'swap',
    preload: true,
});

const robotoFont = Roboto({
    subsets: ['latin'],
    weight: ['300', '400', '500', '700'],
    display: 'swap',
    preload: true,
});

const alfaSlabOneFont = Alfa_Slab_One({
    subsets: ['latin'],
    weight: ['400'],
    display: 'swap',
    preload: true,
});

const rosarioFont = Rosario({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    display: 'swap',
    preload: true,
});

const openSansFont = Open_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    display: 'swap',
    preload: true,
});

// Font names arrive both as "Alfa Slab One" and "AlfaSlabOne". Normalising keeps
// either spelling from silently falling back to Poppins.
const normalizeFontKey = (font?: string) => font?.replace(/[\s_-]/g, '').toLowerCase() ?? '';

const getFonts = (fontsString?: string) => {
    switch (normalizeFontKey(fontsString)) {
        case 'roboto':
            return robotoFont;
        case 'alfslabone':
        case 'alpha': // legacy spelling
            return alfaSlabOneFont;
        case 'rosario':
            return rosarioFont;
        case 'opensans':
            return openSansFont;
        case 'poppins':
        default:
            return poppinsFont;
    }
};

export default getFonts;
