import type { MapViewerStyles } from '@3ddv/dvm';

export const DDV_MAP_ZOOM_ANIMATION_TIME = 250;
export type DigitalVenueStatus =
    'idle' | 'initializing' | 'ready' | 'loading-view' | 'loaded' | 'unavailable' | 'error';

const getTextStyleDigitalVenue = (textFillStyle: string) => {
    return {
        text: true,
        textFillStyle: textFillStyle,
        textLineWidth: 0,
        textStrokeStyle: 'transparent',
        // textFontSize: 8,
    };
};

const DDV_HIDDEN_SECTION_STYLE = {
    cursor: 'auto',
    fillStyle: 'transparent',
    lineWidth: 0,
    strokeStyle: 'transparent',
    text: false,
    textFillStyle: 'transparent',
    textLineWidth: 0,
    textStrokeStyle: 'transparent',
};

const DEFAULT_DDV_SECTION_FILL_STYLE = '#003b73';

export const getDDVMapStyles = (
    fillStyle: string = DEFAULT_DDV_SECTION_FILL_STYLE,
    textFillStyle: string
): MapViewerStyles => [
    {
        section: {
            available: {
                normal: {
                    none: {
                        fillStyle: fillStyle,
                        lineWidth: 1,
                        strokeStyle: '#ffffff',
                        ...getTextStyleDigitalVenue(textFillStyle),
                    },
                },
                hover: {
                    none: {
                        cursor: 'pointer',
                        fillStyle: fillStyle,
                        lineWidth: 1.8,
                        strokeStyle: '#ffffff',
                        ...getTextStyleDigitalVenue(textFillStyle),
                    },
                },
            },
            disabled: {
                normal: {
                    none: DDV_HIDDEN_SECTION_STYLE,
                },
                hover: {
                    none: DDV_HIDDEN_SECTION_STYLE,
                },
            },
            selected: {
                normal: {
                    none: {
                        cursor: 'pointer',
                        fillStyle: fillStyle,
                        lineWidth: 1.8,
                        strokeStyle: '#ffffff',
                        ...getTextStyleDigitalVenue(textFillStyle),
                    },
                },
            },
            unavailable: {
                normal: {
                    none: {
                        cursor: 'auto',
                        fillStyle: '#aaa',
                        lineWidth: 1,
                        strokeStyle: '#ffffff',
                        ...getTextStyleDigitalVenue(textFillStyle),
                    },
                },
            },
        },
    },
];
