import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
    ...nextCoreWebVitals,
    ...nextTypescript,
    {
        rules: {
            'react-hooks/refs': 'off',
            'react-hooks/exhaustive-deps': 'off',
            'react-hooks/preserve-manual-memoization': 'off',
            'react-hooks/set-state-in-effect': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
        },
    },
    {
        ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
    },
];

export default eslintConfig;
