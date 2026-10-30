import tanstackPlugin from '@tanstack/eslint-plugin-query';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';

/** @type {Awaited<import('typescript-eslint').Config>} */
export default [
    {
        files: ['**/*.ts', '**/*.tsx'],
        plugins: {
            react: reactPlugin,
            'react-hooks': hooksPlugin,
            '@tanstack/query': tanstackPlugin,
        },
        rules: {
            ...reactPlugin.configs['jsx-runtime'].rules,
            // React Hooks 7 adds React Compiler rules to `recommended`. The
            // repository does not use the compiler yet, so keep the established
            // hook correctness rules without enabling an unrelated migration.
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'no-unused-vars': 'off',
        },
        languageOptions: {
            globals: {
                React: 'writable',
            },
        },
    },
];
