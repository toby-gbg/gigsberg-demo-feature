import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
    framework: {
        name: '@storybook/nextjs-vite',
        options: {},
    },
    stories: ['../src/**/*.stories.@(ts|tsx|js|jsx|mdx)'],
    addons: ['@storybook/addon-docs', '@storybook/addon-vitest', 'msw-storybook-addon'],
    core: {
        allowedHosts: true,
    },
};

export default config;
