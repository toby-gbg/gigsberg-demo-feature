export const primitiveColors = {
    brandBlue: {
        BG50: '#E8F0FC', // BG-50
        BG100: '#C5D8F7', // BG-100
        BRD200: '#9ABDE8', // Brd-200
        BRD300: '#6D9FD6', // Brd-300
        INT400: '#4282C4', // Int-400
        INT500: '#1E6BB8', // Int-500
        INT600: '#1565C0', // Int-600
        EM700: '#0F52A4', // Em-700
        EM800: '#0A3D84', // Em-800
        DEP850: '#072E6A', // Dep-850
        DEP900: '#041E50', // Dep-900
        DEP950: '#010F30', // Dep-950
    },
    neutralGray: {
        BG50: '#FFFFFF', // BG-50
        BG100: '#FAFAFA', // BG-100
        SURF100: '#F5F5F5', // Surf-100
        SURF200: '#EEEEEE', // Surf-200
        BRD300: '#E0E0E0', // Brd-300
        BRD400: '#BDBDBD', // Brd-400
        BRD500: '#9E9E9E', // Brd-500
        TXT600: '#757575', // Txt-600
        TXT700: '#616161', // Txt-700
        DEP850: '#424242', // Dep-850
        DEP900: '#212121', // Dep-900
        DEP950: '#0A0A0A', // Dep-950
    },
    system: {
        success: {
            normal: '#039855', // Succ-Default
            normalHover: '#027A48', // Succ-Hover
            light: '#05603A', // Succ-Pressed
            lightActive: '#054F31', // Succ-Text
        },
        warning: {
            normal: '#DC6803', // Warn-Default
            normalHover: '#B54708', // Warn-Hover
            light: '#93370D', // Warn-Pressed
            lightActive: '#7A2E0E', // Warn-Text
        },
        error: {
            normal: '#D92D20', // Err-Default
            normalHover: '#B42318', // Err-Hover
            light: '#912018', // Err-Pressed
            lightActive: '#7A271A', // Err-Text
        },
        info: {
            normal: '#1570EF', // Info-Default
            normalHover: '#175CD3', // Info-Hover
            light: '#1849A9', // Info-Pressed
            lightActive: '#194185', // Info-Text
        },
    },
} as const;
