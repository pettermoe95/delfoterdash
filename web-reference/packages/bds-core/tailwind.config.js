/** @type {import('tailwindcss').Config} */
import tokensConfig from '@bv/design-tokens/tailwind/base';

export default {
    content: ['./src/**/*.tsx', './src/**/*.ts'],
    theme: {
        extend: {
            transitionProperty: {
                height: 'height',
            },
        },
    },
    corePlugins: {
        preflight: true,
    },
    presets: [tokensConfig],
    plugins: [require('tailwindcss-animate')],
};
