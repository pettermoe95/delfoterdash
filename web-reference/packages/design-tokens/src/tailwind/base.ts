import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
import { CustomThemeConfig } from 'tailwindcss/types/config';
import { primitives } from '../tokens';
import { flattenObject } from '../util/getWriteableCSSTokens';
import { buildFontsPlugin } from './fonts';
import {
    prefixTokenMap,
    prepareAliasColorsForTailwind,
    prepareColorsForTailwind,
} from './util';

const themeExtension = {
    colors: prepareColorsForTailwind(),
    spacing: primitives.spacing,
    maxWidth: {
        paragraph: primitives.paragraphMaxWidth,
    },
    fontSize: {
        ...primitives.text.size,
        ...prefixTokenMap('display', primitives.display.size),
    },
    font: {
        ...primitives.text.font,
        ...prefixTokenMap('display', primitives.display.font),
    },
    ...prepareAliasColorsForTailwind(),
    boxShadow: {
        ...primitives.shadow,
        ...flattenObject(primitives.ring),
    },
    borderRadius: primitives.borderRadius,
    screens: primitives.breakpoints,
} satisfies Partial<CustomThemeConfig>;

const tailwindConfig = {
    darkMode: ['selector', '[data-theme="dark"]'],
    content: ['src/**/*.{ts,tsx}'],
    corePlugins: {
        preflight: false,
    },
    theme: {
        extend: themeExtension,
    },
    plugins: [plugin(buildFontsPlugin())],
} satisfies Config;

export default tailwindConfig;
