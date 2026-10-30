import baseConfig from '@repo/eslint-config/base';
import reactConfig from '@repo/eslint-config/react';
import reactRefresh from 'eslint-plugin-react-refresh';

/** @type {import('typescript-eslint').Config} */
export default [
    {
        ignores: ['dist/', '.github/'],
    },
    ...baseConfig,
    ...reactConfig,
    {
        files: ['**/*.ts', '**/*.tsx'],
        plugins: {
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
