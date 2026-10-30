// ===================================== //
//            Theme Variation            //
// ===================================== //

import type { CSSProperties } from 'react';
import { THEME_COLORS } from './Presets/Colors';
import { defaultLayout } from './Presets/Layout';
import { modernRounded } from './Presets/Looks';

export type Variation = {
    primary: string;
    secondary: string;
    tertiary: string;
};

export type ColorPalette = {
    25: string;
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
} & Record<number, string>;

export type GraphColorVariation = {
    stroke: string;
    fill: string;
    text_lightmode: string;
    text_darkmode: string;
};

export type SizeVariation = {
    small: string;
    medium: string;
    large: string;
};

export type ActionVariation = {
    base: string;
    hover: string;
    active: string;
    disabled: string;
};

export type SizePlusVariation = SizeVariation & {
    extraSmall: string;
    extraLarge: string;
};

export type VariationValue =
    | Variation
    | GraphColorVariation
    | SizeVariation
    | SizePlusVariation
    | ActionVariation
    | ColorPalette
    | string;

// ===================================== //
//              Theme Parts              //
// ===================================== //

export type ThemeColors = {
    base_background: string;
    background: Variation;
    border: Variation;
    text: Variation;
    accent: Variation;
    accent_text: Variation;

    // Single dimension graph colors
    graph_default: GraphColorVariation;
    graph_neutral: GraphColorVariation;
    graph_positive: GraphColorVariation;
    graph_negative: GraphColorVariation;

    // Actions (buttons)
    action_primary: ActionVariation;
    action_text_primary: ActionVariation;

    action_secondary: ActionVariation;
    action_text_secondary: ActionVariation;

    action_positive: ActionVariation;
    action_text_positive: ActionVariation;

    action_negative: ActionVariation;
    action_text_negative: ActionVariation;
};

export type ThemeLook = {
    border_radius: SizeVariation;
    border_width: SizeVariation;
    box_shadow: SizeVariation;
};

export type ThemeLayout = {
    spacing: string;
};

export type ThemeGeneral = {
    transition_short: string;
    transition_default: string;
    transition_long: string;
};

export const defaultGeneral = {
    transition_short: '0.1s',
    transition_default: '0.2s',
    transition_long: '0.5s',
};

// ===================================== //
//           Theme Definition            //
// ===================================== //

type ThemePart = ThemeColors | ThemeLook | ThemeLayout | ThemeGeneral;

export type Theme = Record<string, ThemePart> & {
    colors: ThemeColors;
    look: ThemeLook;
    layout: ThemeLayout;
    general: ThemeGeneral;
};

/**
 * Default theme
 * Used as a fallback
 */
export const defaultTheme: Theme = {
    colors: THEME_COLORS.light,
    look: modernRounded,
    layout: defaultLayout,
    general: defaultGeneral,
};

export const defaultDarkTheme: Theme = {
    colors: THEME_COLORS.dark,
    look: modernRounded,
    layout: defaultLayout,
    general: defaultGeneral,
};

// ===================================== //
//             React Binding             //
// ===================================== //

/**
 * Converts theme key to css key
 * @param key Key in the theme tpye
 * @returns Santized key used in CSS
 */
function formatKey(key: string) {
    return key.replaceAll('_', '-').toLowerCase();
}

/**
 * Add variation variable to style dict
 */
function addVariable(key: string, variation: VariationValue, suffix: string, target: Record<string, string>) {
    const cssKey = formatKey(key);
    const varName = `--${cssKey}${suffix}`;
    if (typeof variation === 'string') {
        target[varName] = variation;
    } else {
        // Find the variation type for this variation
        const variationDict = variation as Record<string, unknown>;
        const isStandardVariation = Object.keys(variationDict).includes('primary');
        const isActionVariation = Object.keys(variationDict).includes('hover');
        const isColorPalette = Object.keys(variationDict).includes('500');

        const isSizeVariation = !isStandardVariation && !isActionVariation && !isColorPalette;
        const isSizePlusVariation = isSizeVariation && Object.keys(variationDict).includes('extraSmall');

        // Standard variation
        if (isStandardVariation) {
            const standardVariation = variationDict as Variation;
            target[`${varName}-primary`] = standardVariation.primary;
            target[`${varName}-secondary`] = standardVariation.secondary;
            target[`${varName}-tertiary`] = standardVariation.tertiary;
        }

        if (isColorPalette) {
            const palette = variationDict as ColorPalette;
            [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].forEach((darkness) => {
                target[`${varName}-${darkness}`] = palette[darkness];
            });
        }

        // Action variation
        if (isActionVariation) {
            const actionVariation = variationDict as ActionVariation;
            target[`${varName}-base`] = actionVariation.base;
            target[`${varName}-hover`] = actionVariation.hover;
            target[`${varName}-active`] = actionVariation.active;
            target[`${varName}-disabled`] = actionVariation.disabled;
        }

        // Size variation
        if (isSizeVariation) {
            const sizeVariation = variationDict as SizeVariation;
            target[`${varName}-small`] = sizeVariation.small;
            target[`${varName}-medium`] = sizeVariation.medium;
            target[`${varName}-large`] = sizeVariation.large;

            // SizePlus variation
            if (isSizePlusVariation) {
                const sizePlusVariation = variationDict as SizePlusVariation;
                target[`${varName}-extra-small`] = sizePlusVariation.extraSmall;
                target[`${varName}-extra-large`] = sizePlusVariation.extraLarge;
            }
        }
    }
}

/**
 * Converts a theme to a react CSSProperties dictionary
 * @param theme The theme to use
 * @returns CSSProperties dictionary with variable declarations
 */
export function generateThemeStyleVariables(theme: Theme): CSSProperties {
    // Variable definitions
    const style: Record<string, string> = {};

    // Color variables
    for (const rawKey of Object.keys(theme.colors)) {
        const value = theme.colors[rawKey as keyof ThemeColors];
        addVariable(rawKey, value, '-color', style);
    }

    // Look variables
    for (const rawKey of Object.keys(theme.look)) {
        const value = theme.look[rawKey as keyof ThemeLook];
        addVariable(rawKey, value, '', style);
    }

    // Layout variables
    for (const rawKey of Object.keys(theme.layout)) {
        const value = theme.layout[rawKey as keyof ThemeLayout];
        addVariable(rawKey, value, '', style);
    }

    // General variables
    for (const rawKey of Object.keys(theme.general)) {
        const value = theme.general[rawKey as keyof ThemeGeneral];
        addVariable(rawKey, value, '', style);
    }

    // Cast to allow variable declarations
    // Default react CSS property keys only includes standard properties
    return style;
}

/**
 * Generates a composite style based on colors, look and layout
 * @param colors Theme colors
 * @param look Theme look
 * @param layout Theme look
 * @returns React style
 */
export function generateCompositeStyle(colors?: ThemeColors, look?: ThemeLook, layout?: ThemeLayout): CSSProperties {
    return generateThemeStyleVariables({
        colors: colors ?? defaultTheme.colors,
        look: look ?? defaultTheme.look,
        layout: layout ?? defaultTheme.layout,
        general: defaultTheme.general,
    });
}
