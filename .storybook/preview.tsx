import { useLayoutEffect, type ReactNode } from 'react';
import type { Preview } from '@storybook/react';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';

// @ts-expect-error - Storybook/Vite handles CSS side-effect imports.
import '../src/assets/css/globals.css';

initialize({
    onUnhandledRequest(request, print) {
        const url = new URL(request.url);

        if (url.pathname.startsWith('/src/') || url.pathname.startsWith('/@id/')) {
            return;
        }

        print.warning();
    },
});

const storyThemes = {
    gigsberg: {
        title: 'Gigsberg',
        variables: {
            '--header-gradient-start': '#022D5F',
            '--header-gradient-end': '#1565C0',
            '--text-on-header': '#FFFFFF',
            '--main-gradient-start': '2 45 95',
            '--main-gradient-end': '21 101 192',
            '--text-on-main': '#FFFFFF',
            '--bg-solid': '2 45 95',
            '--text-on-solid': '#FFFFFF',
            '--text-primary': '#022D5F',
            '--text-secondary': '#1565C0',
        },
    },
    marca: {
        title: 'Marca',
        variables: {
            '--header-gradient-start': '#FFFFFF',
            '--header-gradient-end': '#F5F8FF',
            '--text-on-header': '#000000',
            '--main-gradient-start': '204 0 0',
            '--main-gradient-end': '139 0 0',
            '--text-on-main': '#FFFFFF',
            '--bg-solid': '204 0 0',
            '--text-on-solid': '#FFFFFF',
            '--text-primary': '#000000',
            '--text-secondary': '#1A1A1A',
        },
    },
    metropoli: {
        title: 'Metropoli',
        variables: {
            '--header-gradient-start': '#FFE800',
            '--header-gradient-end': '#FFE800',
            '--text-on-header': '#000000',
            '--main-gradient-start': '255 232 0',
            '--main-gradient-end': '255 232 0',
            '--text-on-main': '#000000',
            '--bg-solid': '0 0 0',
            '--text-on-solid': '#FFFFFF',
            '--text-primary': '#000000',
            '--text-secondary': '#000000',
        },
    },
    boletoconfirmado: {
        title: 'Boleto Confirmado',
        variables: {
            '--header-gradient-start': '#FFFFFF',
            '--header-gradient-end': '#F5F8FF',
            '--text-on-header': '#000000',
            '--main-gradient-start': '1 40 124',
            '--main-gradient-end': '7 86 187',
            '--text-on-main': '#FFFFFF',
            '--bg-solid': '1 40 124',
            '--text-on-solid': '#FFFFFF',
            '--text-primary': '#022D5F',
            '--text-secondary': '#1565C0',
        },
    },
    transact: {
        title: 'Transact',
        variables: {
            '--header-gradient-start': '#0B3F35',
            '--header-gradient-end': '#0E594B',
            '--text-on-header': '#FFFFFF',
            '--main-gradient-start': '11 63 53',
            '--main-gradient-end': '14 89 75',
            '--text-on-main': '#FFFFFF',
            '--bg-solid': '9 54 46',
            '--text-on-solid': '#FFFFFF',
            '--text-primary': '#000000',
            '--text-secondary': '#D4AF37',
        },
    },
    takemytickets: {
        title: 'Take My Tickets',
        variables: {
            '--header-gradient-start': '#FFFFFF',
            '--header-gradient-end': '#FFFFFF',
            '--text-on-header': '#000000',
            '--main-gradient-start': '255 36 89',
            '--main-gradient-end': '248 42 94',
            '--text-on-main': '#FFFFFF',
            '--bg-solid': '255 36 89',
            '--text-on-solid': '#FFFFFF',
            '--text-primary': '#FF2459',
            '--text-secondary': '#101010',
        },
    },
    abola: {
        title: 'Abola',
        variables: {
            '--header-gradient-start': '#FFFFFF',
            '--header-gradient-end': '#FFFFFF',
            '--text-on-header': '#000000',
            '--main-gradient-start': '226 6 19',
            '--main-gradient-end': '226 6 21',
            '--text-on-main': '#FFFFFF',
            '--bg-solid': '168 15 29',
            '--text-on-solid': '#FFFFFF',
            '--text-primary': '#000000',
            '--text-secondary': '#A80F1D',
        },
    },
} as const;

type StoryTheme = keyof typeof storyThemes;

const ThemeSync = ({ children, theme }: { children: ReactNode; theme: StoryTheme }) => {
    useLayoutEffect(() => {
        const root = document.documentElement;
        const previousTheme = root.getAttribute('data-theme');
        const variables = storyThemes[theme].variables;
        const previousVariables = Object.keys(variables).map(
            (name) => [name, root.style.getPropertyValue(name)] as const
        );

        root.setAttribute('data-theme', theme);
        Object.entries(variables).forEach(([name, value]) => root.style.setProperty(name, value));

        return () => {
            previousVariables.forEach(([name, value]) => {
                if (value) {
                    root.style.setProperty(name, value);
                    return;
                }

                root.style.removeProperty(name);
            });

            if (previousTheme === null) {
                root.removeAttribute('data-theme');
                return;
            }

            root.setAttribute('data-theme', previousTheme);
        };
    }, [theme]);

    return <>{children}</>;
};

const preview: Preview = {
    tags: ['autodocs'],
    loaders: [mswLoader],
    globalTypes: {
        theme: {
            description: 'Preview theme for domain-specific tokens',
            defaultValue: 'gigsberg',
            toolbar: {
                title: 'Theme',
                icon: 'paintbrush',
                items: Object.entries(storyThemes).map(([value, { title }]) => ({ value, title })),
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: {
        theme: 'gigsberg',
    },
    parameters: {
        viewport: {
            options: INITIAL_VIEWPORTS,
        },
    },
    decorators: [
        (Story, context) => (
            <ThemeSync theme={(context.globals.theme as StoryTheme) ?? 'gigsberg'}>
                <Story />
            </ThemeSync>
        ),
    ],
};

export default preview;
