/// <reference types="./types.d.ts" />

import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';

/**
 * All packages that leverage t3-env should use this rule
 *
 */
export const restrictEnvAccess = tseslint.config({
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
    rules: {
        'no-restricted-properties': [
            'error',
            {
                object: 'process',
                property: 'env',
                message:
                    "Use `import { env } from '~/env'` instead to ensure validated types.",
            },
        ],
        'no-restricted-imports': [
            'error',
            {
                name: 'process',
                importNames: ['env'],
                message:
                    "Use `import { env } from '~/env'` instead to ensure validated types.",
            },
        ],
    },
});

export default tseslint.config(
    {
        // Globally ignored files
        ignores: [
            '**/*.config.*',
            '**/.turbo/**',
            '**/coverage/**',
            '**/dist/**',
            '**/storybook-static/**',
        ],
    },
    {
        files: ['**/*.js', '**/*.ts', '**/*.tsx'],
        plugins: {
            import: importPlugin,
            turbo: turboPlugin,
        },
        extends: [
            eslint.configs.recommended,
            ...tseslint.configs.recommended,
            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.stylisticTypeChecked,
        ],
        rules: {
            ...turboPlugin.configs.recommended.rules,
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/consistent-type-imports': [
                'warn',
                { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
            ],
            '@typescript-eslint/no-misused-promises': [
                2,
                { checksVoidReturn: { attributes: false } },
            ],
            '@typescript-eslint/no-unnecessary-condition': [
                'error',
                {
                    allowConstantLoopConditions: true,
                },
            ],
            '@typescript-eslint/no-non-null-assertion': 'error',
            'import/consistent-type-specifier-style': [
                'error',
                'prefer-top-level',
            ],
            // These are stylistic preferences, not TypeScript safety checks.
            // Keeping them disabled avoids a broad, behavior-sensitive rewrite
            // while the TS 6 deployment is being validated.
            '@typescript-eslint/consistent-type-definitions': 'off',
            '@typescript-eslint/non-nullable-type-assertion-style': 'off',
            '@typescript-eslint/prefer-nullish-coalescing': 'off',
        },
    },
    {
        linterOptions: { reportUnusedDisableDirectives: true },
        languageOptions: { parserOptions: { projectService: true } },
    }
);
