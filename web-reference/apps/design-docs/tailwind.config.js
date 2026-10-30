/** @type {import('tailwindcss').Config} */
import tokensConfig from '@bv/design-tokens/tailwind/base';

export default {
    content: ['./components/**/*.tsx', './stories/**/*.tsx'],
    theme: {
        extend: {},
    },
    corePlugins: {
        preflight: true,
    },
    presets: [tokensConfig],
};
