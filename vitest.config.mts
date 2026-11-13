import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(dirname, './src'),
        },
    },
    test: {
        passWithNoTests: true,
        environment: 'jsdom',
        deps: {
            optimizer: {
                web: {
                    include: ['react', '@testing-library/jest-dom/vitest'],
                },
            },
        },
        projects: [
            {
                extends: true,
                test: {
                    name: 'unit',
                    setupFiles: ['./src/test/vitest.setup.ts'],
                    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
                    exclude: ['node_modules/**', 'e2e/**'],
                },
            },
            {
                extends: true,
                plugins: [
                    storybookTest({
                        configDir: path.join(dirname, '.storybook'),
                    }),
                ],
                test: {
                    name: 'storybook',
                    setupFiles: ['./src/test/storybook.setup.ts'],
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright(),
                        instances: [{ browser: 'chromium' }],
                    },
                },
            },
        ],
    },
});
