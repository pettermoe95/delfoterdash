/** @type {import('tailwindcss').Config} */
import tokensConfig from '@bv/design-tokens/tailwind/base';

export default {
    content: [
        './src/**/*.tsx',
        './src/**/*.ts',
        '../../packages/bds-core/src/**/*.{js,ts,jsx,tsx}',
        '../../packages/brilliant-view-ui/src/**/*.{js,ts,jsx,tsx}',
        '../../packages/brilliant-components/src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [],
    corePlugins: {
        preflight: true,
    },
    presets: [tokensConfig],
};
