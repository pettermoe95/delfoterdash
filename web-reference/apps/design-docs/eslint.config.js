import baseConfig from '@repo/eslint-config/base';
import reactConfig from '@repo/eslint-config/react';

/** @type {import('typescript-eslint').Config} */
export default [
    ...baseConfig,
    ...reactConfig,
    {
        files: ['**/*.stories.tsx'],
        rules: {
            // Storybook render functions are React components, but their
            // lowercase property name cannot be inferred by the hooks rule.
            'react-hooks/rules-of-hooks': 'off',
        },
    },
];
