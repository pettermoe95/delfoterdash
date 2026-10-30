import { primitives, TokenPrimitives } from '../tokens';
import { lightMode } from '../tokens/Alias';
import { ColorPalette, Tokens } from '../tokens/types';
import { flattenObject } from '../util/getWriteableCSSTokens';

export const prepareColorsForTailwind = () => {
    const { colors } = primitives;
    const primary = buildTailwindPalette('primary', colors.primary);
    const secondary = buildTailwindPalette('secondary', colors.secondary);
    const dashboard = buildTailwindPalette('dashboard', colors.dashboard);

    return {
        ...colors.base,
        ...primary,
        ...secondary,
        ...dashboard,
    };
};

function buildTailwindPalette<K extends keyof TokenPrimitives['colors']>(
    key: K,
    values: TokenPrimitives['colors'][K]
): Record<string, ColorPalette> {
    return Object.fromEntries(
        Object.entries(values).map(([color, value]) => [
            `${key}-${color}`,
            value,
        ])
    );
}

export function prefixTokenMap<
    P extends string,
    T extends Record<string, string | Record<string, string>>,
    K extends keyof T,
>(prefix: P, tokenMap: T) {
    return Object.fromEntries(
        Object.entries(tokenMap).map(([key, value]) => [
            `${prefix}-${key}`,
            value,
        ])
    ) as Record<`${P}-${string & K}`, T[keyof T]>;
}

export function prepareAliasColorsForTailwind() {
    const backgroundColor = prepareAliasColorsForTailwindPrefix(
        lightMode.bg,
        'bg'
    );
    const textColorBase = prepareAliasColorsForTailwindPrefix(
        lightMode.text,
        'text'
    );
    const foreground = prepareAliasColorsForTailwindPrefix(lightMode.fg, 'fg');
    const borderColor = prepareAliasColorsForTailwindPrefix(
        lightMode.border,
        'border'
    );

    const db = prepareAliasColorsForTailwindPrefix(lightMode.db, 'db');

    return {
        backgroundColor: {
            ...backgroundColor,
            db: db,
        },
        textColor: {
            ...textColorBase,
            fg: foreground,
        },
        borderColor,
    };
}

function prepareAliasColorsForTailwindPrefix(map: Tokens, prefix: string) {
    const flattened = flattenObject(map);
    return Object.fromEntries(
        Object.keys(flattened).map((key) => [key, `var(--${prefix}-${key})`])
    );
}
