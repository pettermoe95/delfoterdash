import baseConfig from '@repo/eslint-config/base';
import reactConfig from '@repo/eslint-config/react';
import tanstackPlugin from '@tanstack/eslint-plugin-query';
import reactRefresh from 'eslint-plugin-react-refresh';

/** @type {import('typescript-eslint').Config} */
export default [
    {
        ignores: ['!node_modules/*', 'public/', 'dist/', '.github/'],
    },
    ...baseConfig,
    ...reactConfig,
    {
        files: ['**/*.ts', '**/*.tsx'],
        plugins: {
            '@tanstack/query': tanstackPlugin,
            'react-refresh': reactRefresh,
        },
        rules: {
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
        },
    },
];
