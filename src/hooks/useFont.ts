import { HEADLINE_FONT_CLASS, SECTION_TITLE_FONT_CLASS } from '@/constants/fonts';

/**
    The `font-family` behind each class is injected per-request by `HeaderLayer`,
    so no store or provider is needed. Kept in the old `next/font` shape so the
    ~20 existing `.className` call sites are unchanged.
 */

// heading font class names for the current tenant.
const FONTS = {
    headlineFont: { className: HEADLINE_FONT_CLASS },
    sectionTitleFont: { className: SECTION_TITLE_FONT_CLASS },
} as const;

const useFont = () => FONTS;

export default useFont;
